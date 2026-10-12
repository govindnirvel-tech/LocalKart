import { NavigatorScreenParams } from '@react-navigation/native';
import type { VendorTabParamList } from '@/vendor';

export type TabParamList = {
  Home: undefined;
  Wishlist: undefined;
  Orders: undefined;
  Cart: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Onboarding: undefined;
  Start: undefined;
  RoleSelection: undefined;
  CreateAccount: { role?: 'customer' | 'vendor' } | undefined;
  Login: { role?: 'customer' | 'vendor' } | undefined;
  Password: { email?: string; name?: string; role?: 'customer' | 'vendor' } | undefined;
  Otp: { phoneOrEmail: string; role?: 'customer' | 'vendor' };
  ForgotPassword: { email?: string; role?: 'customer' | 'vendor' } | undefined;
  SetupNewPassword: undefined;
  Tabs: NavigatorScreenParams<TabParamList> | undefined;
  ProductDetails: {
    productId: string;
    name: string;
    discountPercent?: number;
    initialProduct?: any;
  };
  CategoryProducts: { categoryId: string; categoryName: string };
  AllCategories: undefined;
  FlashSale: { initialDiscount?: string } | undefined;
  VendorTabs: NavigatorScreenParams<VendorTabParamList> | undefined;
  VendorOnboarding: { initialStep?: number } | undefined;
  VendorUnderReview: { referenceId?: string } | undefined;
  VendorDashboard: undefined;
  VendorOrders: undefined;
  VendorProducts: undefined;
  VendorInventory: undefined;
  VendorWallet: undefined;
  VendorStore: undefined;
  ChatList: undefined;
  ChatRoom: {
    conversationId?: string;
    vendorId?: string;
    targetUserId?: string;
    title?: string;
    avatarUrl?: string | null;
    lastSeenAt?: string | null;
    product?: import('@/features/chat/types').ProductPreview | null;
  };
  ActiveCall: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}