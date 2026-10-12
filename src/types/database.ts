// ==============================================================================
// LocalKart: Complete Database TypeScript Types (Supabase Schema 1:1)
// ==============================================================================

export type UserRole = 'customer' | 'vendor' | 'admin';

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  image_url: string | null;
  fcm_token: string | null;
  created_at: string;
  updated_at: string;
}

export interface Vendor {
  id: string;
  user_id: string | null;
  store_name: string;
  business_category: string;
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  phone: string | null;
  address_line: string | null;
  city: string;
  pincode: string | null;
  latitude: number | null;
  longitude: number | null;
  delivery_radius_km: number;
  is_open: boolean;
  is_verified: boolean;
  rating: number;
  review_count: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon_url: string | null;
  banner_url?: string | null;
  image_url?: string | null;
  description?: string | null;
  parent_id: string | null;
  sort_order: number;
  gender?: string | null;
  age_group?: string | null;
  size_type?: string | null;
  is_active: boolean;
  attributes?: string[] | null;
  available_sizes?: string[] | null;
  available_colors?: string[] | null;
  created_at: string;
}

export interface Banner {
  id: string;
  vendor_id: string | null;
  title: string;
  subtitle: string | null;
  description: string | null;
  image_url: string | null;
  action_type: 'category' | 'product' | 'url';
  action_value: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface Story {
  id: string;
  vendor_id: string | null;
  title: string | null;
  media_url: string;
  is_live: boolean;
  border_color: string;
  expires_at: string;
  created_at: string;
  // Joined relation
  vendor?: Pick<Vendor, 'store_name' | 'logo_url'>;
}

export interface Product {
  id: string;
  vendor_id: string | null;
  category_id: string | null;
  title: string;
  description: string | null;
  price: number;
  discount_price: number | null;
  images: string[];
  rating: number;
  review_count: number;
  likes_count: number;
  tag: string | null;
  tag_color: string | null;
  is_new: boolean;
  is_popular: boolean;
  is_flash_sale: boolean;
  flash_sale_end: string | null;
  stock_qty: number;
  is_active: boolean;
  gender?: string | null;
  age_group?: string | null;
  brand?: string | null;
  material?: string | null;
  fabric?: string | null;
  fit?: string | null;
  pattern?: string | null;
  occasion?: string | null;
  season?: string | null;
  created_at: string;
  updated_at: string;
  // Joined relations
  vendor?: Pick<Vendor, 'store_name' | 'logo_url'>;
  category?: Pick<Category, 'name' | 'slug'>;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  color_name: string | null;
  color_hex: string | null;
  size: string | null;
  sku: string | null;
  price: number | null;
  stock_qty: number;
  created_at: string;
}

export interface UserAddress {
  id: string;
  user_id: string;
  title: string;
  recipient_name: string;
  phone: string;
  address_line: string;
  landmark: string | null;
  city: string;
  pincode: string;
  latitude: number | null;
  longitude: number | null;
  is_default: boolean;
  created_at: string;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  variant_id: string | null;
  quantity: number;
  created_at: string;
  updated_at: string;
  product?: Product;
  variant?: ProductVariant;
}

export interface Rider {
  id: string;
  name: string;
  phone: string;
  vehicle_number: string | null;
  avatar_url: string | null;
  current_lat: number | null;
  current_lng: number | null;
  heading: number;
  is_active: boolean;
  created_at: string;
}

export type OrderStatus =
  | 'placed'
  | 'accepted'
  | 'packing'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export type PaymentMethod = 'COD' | 'UPI' | 'CARD';
export type PaymentStatus = 'pending' | 'completed' | 'refunded' | 'failed';

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  vendor_id: string;
  rider_id: string | null;
  subtotal: number;
  discount_amount: number;
  delivery_fee: number;
  total_amount: number;
  status: OrderStatus;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  delivery_address: Record<string, any>;
  delivery_pin: string;
  delivery_notes: string | null;
  created_at: string;
  updated_at: string;
  vendor?: Pick<Vendor, 'store_name' | 'logo_url' | 'phone'>;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  variant_name: string | null;
  price: number;
  quantity: number;
  image_url: string | null;
  created_at: string;
}

export interface OrderTimeline {
  id: string;
  order_id: string;
  status: OrderStatus;
  title: string;
  description: string | null;
  created_at: string;
}

export interface Conversation {
  id: string;
  customer_id: string;
  vendor_id: string;
  last_message: string | null;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  text: string;
  product_id: string | null;
  is_read: boolean;
  created_at: string;
}
