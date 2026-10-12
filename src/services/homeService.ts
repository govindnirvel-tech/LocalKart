// ==============================================================================
// LocalKart: Supabase Fashion Catalog & Home Service
// Supports: 50 Main Categories -> 388 Subcategories -> 3880 Products -> Variants
// ==============================================================================

import { supabase } from '@/lib/supabase';
import type { Category, Banner, Story, Product, ProductVariant } from '@/types/database';

export interface ProductFilterOptions {
  gender?: 'Men' | 'Women' | 'Kids' | 'Baby' | 'Unisex' | string;
  age_group?: string;
  brand?: string;
  material?: string;
  fit?: string;
  minPrice?: number;
  maxPrice?: number;
  size?: string;
  color?: string;
  onlySale?: boolean;
  sortBy?: 'new' | 'popular' | 'rating' | 'priceAsc' | 'priceDesc';
  searchQuery?: string;
  page?: number;
  limit?: number;
}

export interface DetailedProduct extends Product {
  variants?: ProductVariant[];
  vendor?: {
    store_name: string;
    logo_url: string | null;
    rating?: number;
    city?: string;
    address_line?: string | null;
  };
  category?: {
    id?: string;
    name: string;
    slug: string;
    parent_id?: string | null;
  };
}

// ─── 1. Main Categories (parent_id IS NULL) ──────────────────────────────────
export const fetchMainCategories = async (gender?: string): Promise<Category[]> => {
  let query = supabase
    .from('categories')
    .select('*')
    .is('parent_id', null)
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (gender && gender !== 'All') {
    query = query.eq('gender', gender);
  }

  const { data, error } = await query;
  if (error) {
    console.warn('Error fetching main categories:', error);
    return [];
  }
  return data || [];
};

// ─── 2. Subcategories for a Main Category (parent_id = mainId) ───────────────
export const fetchSubcategories = async (parentId: string): Promise<Category[]> => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('parent_id', parentId)
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.warn(`Error fetching subcategories for parent ${parentId}:`, error);
    return [];
  }
  return data || [];
};

// ─── 3. All Active Categories (Flattened) ─────────────────────────────────────
export const fetchCategories = async (): Promise<Category[]> => {
  return fetchMainCategories();
};

// ─── 4. Banners ──────────────────────────────────────────────────────────────
export const fetchBanners = async (): Promise<Banner[]> => {
  const { data, error } = await supabase
    .from('banners')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.warn('Error fetching banners:', error);
    return [];
  }
  return data || [];
};

// ─── 5. Stories ──────────────────────────────────────────────────────────────
export const fetchStories = async (): Promise<Story[]> => {
  const { data, error } = await supabase
    .from('stories')
    .select(`
      *,
      vendor:vendors ( store_name, logo_url )
    `)
    .gte('expires_at', new Date().toISOString())
    .order('is_live', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('Error fetching stories:', error);
    return [];
  }
  return data || [];
};

// ─── 6. New Arrivals (with pagination) ───────────────────────────────────────
export const fetchNewArrivals = async (page = 0, limit = 10): Promise<Product[]> => {
  const from = page * limit;
  const to = from + limit - 1;

  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      vendor:vendors ( store_name, logo_url ),
      category:categories ( name, slug )
    `)
    .eq('is_active', true)
    .eq('is_new', true)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    console.warn('Error fetching new arrivals:', error);
    return [];
  }
  return data || [];
};

// ─── 7. Most Popular (with pagination) ───────────────────────────────────────
export const fetchPopularProducts = async (page = 0, limit = 10): Promise<Product[]> => {
  const from = page * limit;
  const to = from + limit - 1;

  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      vendor:vendors ( store_name, logo_url ),
      category:categories ( name, slug )
    `)
    .eq('is_active', true)
    .eq('is_popular', true)
    .order('likes_count', { ascending: false })
    .range(from, to);

  if (error) {
    console.warn('Error fetching popular products:', error);
    return [];
  }
  return data || [];
};

// ─── 8. Flash Sale (with pagination & 24h filter) ─────────────────────────────
export const fetchFlashSaleProducts = async (page = 0, limit = 10): Promise<Product[]> => {
  const from = page * limit;
  const to = from + limit - 1;

  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      vendor:vendors ( store_name, logo_url ),
      category:categories ( name, slug )
    `)
    .eq('is_active', true)
    .eq('is_flash_sale', true)
    .gte('flash_sale_end', new Date().toISOString())
    .order('discount_price', { ascending: true })
    .range(from, to);

  if (error) {
    console.warn('Error fetching flash sale products:', error);
    return [];
  }
  return data || [];
};

// ─── 9. Filtered Products & Category Products (Main -> Sub IDs support) ─────
export const fetchProductsByCategory = async (
  categoryId: string,
  options?: ProductFilterOptions
): Promise<Product[]> => {
  const page = options?.page ?? 0;
  const limit = options?.limit ?? 20;
  const from = page * limit;
  const to = from + limit - 1;

  // Check if categoryId is a Main Category with subcategories
  let targetCategoryIds: string[] = [categoryId];
  try {
    const { data: subcats } = await supabase
      .from('categories')
      .select('id')
      .eq('parent_id', categoryId);

    if (subcats && subcats.length > 0) {
      // Products are connected to subcategories, so use all child subcategory IDs!
      targetCategoryIds = subcats.map((s) => s.id);
    }
  } catch (err) {
    console.warn('Error resolving subcategories for category:', err);
  }

  let query = supabase
    .from('products')
    .select(`
      *,
      vendor:vendors ( store_name, logo_url ),
      category:categories ( name, slug, parent_id )
    `);

  // Filter by category IDs
  if (targetCategoryIds.length === 1) {
    query = query.eq('category_id', targetCategoryIds[0]);
  } else {
    query = query.in('category_id', targetCategoryIds);
  }

  query = query.eq('is_active', true);

  // Apply filters
  if (options?.gender && options.gender !== 'All') {
    query = query.eq('gender', options.gender);
  }
  if (options?.age_group) {
    query = query.eq('age_group', options.age_group);
  }
  if (options?.brand) {
    query = query.eq('brand', options.brand);
  }
  if (options?.material) {
    query = query.eq('material', options.material);
  }
  if (options?.fit) {
    query = query.eq('fit', options.fit);
  }
  if (options?.onlySale) {
    query = query.not('discount_price', 'is', null);
  }
  if (options?.minPrice != null) {
    query = query.gte('price', options.minPrice);
  }
  if (options?.maxPrice != null) {
    query = query.lte('price', options.maxPrice);
  }
  if (options?.searchQuery && options.searchQuery.trim().length > 0) {
    query = query.ilike('title', `%${options.searchQuery.trim()}%`);
  }

  // Sorting
  switch (options?.sortBy) {
    case 'priceAsc':
      query = query.order('price', { ascending: true });
      break;
    case 'priceDesc':
      query = query.order('price', { ascending: false });
      break;
    case 'rating':
      query = query.order('rating', { ascending: false });
      break;
    case 'popular':
      query = query.order('likes_count', { ascending: false });
      break;
    case 'new':
    default:
      query = query.order('created_at', { ascending: false });
      break;
  }

  // Pagination (max 1000 items per request safe limit)
  query = query.range(from, to);

  const { data, error } = await query;
  if (error) {
    console.warn('Error fetching products by category:', error);
    return [];
  }
  return data || [];
};

// ─── 10. Search Products (ilike on title) ────────────────────────────────────
export const searchProducts = async (
  queryText: string,
  page = 0,
  limit = 20
): Promise<Product[]> => {
  if (!queryText || queryText.trim().length === 0) return [];
  const from = page * limit;
  const to = from + limit - 1;

  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      vendor:vendors ( store_name, logo_url ),
      category:categories ( name, slug )
    `)
    .eq('is_active', true)
    .ilike('title', `%${queryText.trim()}%`)
    .order('likes_count', { ascending: false })
    .range(from, to);

  if (error) {
    console.warn('Error searching products:', error);
    return [];
  }
  return data || [];
};

// ─── 11. Single Product with Variants & Vendor ───────────────────────────────
export const fetchProductById = async (productId: string): Promise<DetailedProduct | null> => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      vendor:vendors ( store_name, logo_url, rating, city, address_line ),
      category:categories ( id, name, slug, parent_id ),
      variants:product_variants ( id, color_name, color_hex, size, sku, price, stock_qty )
    `)
    .eq('id', productId)
    .maybeSingle();

  if (error) {
    console.warn(`Error fetching product ${productId}:`, error);
    return null;
  }
  return data as DetailedProduct;
};

// ─── 12. Parallel Home Feed Fetcher ──────────────────────────────────────────
export const fetchHomeFeed = async () => {
  const [mainCatsRes, bannersRes, storiesRes, newArrivalsRes, popularRes, flashSaleRes] =
    await Promise.allSettled([
      fetchMainCategories(),
      fetchBanners(),
      fetchStories(),
      fetchNewArrivals(0, 10),
      fetchPopularProducts(0, 10),
      fetchFlashSaleProducts(0, 10),
    ]);

  return {
    categories: mainCatsRes.status === 'fulfilled' ? mainCatsRes.value : [],
    banners: bannersRes.status === 'fulfilled' ? bannersRes.value : [],
    stories: storiesRes.status === 'fulfilled' ? storiesRes.value : [],
    newArrivals: newArrivalsRes.status === 'fulfilled' ? newArrivalsRes.value : [],
    popularProducts: popularRes.status === 'fulfilled' ? popularRes.value : [],
    flashSaleProducts: flashSaleRes.status === 'fulfilled' ? flashSaleRes.value : [],
  };
};
