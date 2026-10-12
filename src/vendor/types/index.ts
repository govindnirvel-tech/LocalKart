// ==============================================================================
// LocalKart: Vendor Specific Domain Types (Merchant Storefront & Operations)
// ==============================================================================

import type { Vendor, Product, ProductVariant, Order, Story } from '@/types/database';

export interface VendorStoreProfile extends Vendor {
  totalProductsCount?: number;
  totalOrdersToday?: number;
  revenueToday?: number;
}

export interface VendorInventoryItem extends Product {
  variants?: ProductVariant[];
  totalStockAvailable?: number;
}

export interface VendorCreateProductPayload {
  category_id: string;
  title: string;
  description: string;
  price: number;
  discount_price?: number;
  images: string[];
  tag?: 'New' | 'Sale' | 'Hot';
  tag_color?: string;
  is_new?: boolean;
  is_popular?: boolean;
  is_flash_sale?: boolean;
  stock_qty: number;
  variants?: Array<{
    color_name?: string;
    color_hex?: string;
    size?: string;
    sku?: string;
    price?: number;
    stock_qty: number;
  }>;
}

export interface VendorStoryPayload {
  title?: string;
  media_url: string;
  is_live?: boolean;
  border_color?: string;
}

export interface VendorOrderManagement extends Order {
  customer_name?: string;
  customer_phone?: string;
}

export type StoreOperatingStatus = 'open' | 'closed' | 'busy';
