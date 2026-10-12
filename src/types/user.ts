// ==============================================================================
// LocalKart: Customer / User Specific Domain Types
// ==============================================================================

import type { Profile, UserAddress, Order, CartItem, Product } from './database';

export interface CustomerProfile extends Profile {
  role: 'customer';
  addresses?: UserAddress[];
  defaultAddress?: UserAddress;
}

export type OrderTabType = 'To Pay' | 'To Recieve' | 'To Review';

export interface CustomerOrderSummary {
  toPayCount: number;
  toRecieveCount: number;
  toReviewCount: number;
  activeOrders: Order[];
}

export interface CustomerCartItem extends CartItem {
  product: Product;
}

export interface CustomerWishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: Product;
}

export interface HomeFeedData {
  stories: import('./database').Story[];
  banners: import('./database').Banner[];
  categories: import('./database').Category[];
  newArrivals: Product[];
  popularProducts: Product[];
  flashSaleProducts: Product[];
}
