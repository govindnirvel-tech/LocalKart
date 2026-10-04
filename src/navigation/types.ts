import { NavigatorScreenParams } from '@react-navigation/native';

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
  CreateAccount: undefined;
  Login: undefined;
  Password: { email?: string; name?: string } | undefined;
  Otp: { phoneOrEmail: string };
  ForgotPassword: undefined;
  SetupNewPassword: undefined;
  Tabs: NavigatorScreenParams<TabParamList>;
  ProductDetails: { productId: string; name: string };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}