import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '@shopify/restyle';
import { Theme } from '@/theme';
import {
  VendorDashboardScreen,
  VendorOrdersScreen,
  VendorProductsScreen,
  VendorWalletScreen,
  VendorStoreScreen,
} from '../screens';
import VendorTabIcon, { VendorTabIconName } from '../components/common/VendorTabIcon';

export type VendorTabParamList = {
  VendorHome: undefined;
  VendorOrders: undefined;
  VendorProducts: undefined;
  VendorWallet: undefined;
  VendorStore: undefined;
};

const Tab = createBottomTabNavigator<VendorTabParamList>();

const vendorIcons: Record<keyof VendorTabParamList, VendorTabIconName> = {
  VendorHome: 'home',
  VendorOrders: 'orders',
  VendorProducts: 'products',
  VendorWallet: 'wallet',
  VendorStore: 'store',
};

const getVendorTabBarIcon =
  (routeName: keyof VendorTabParamList) =>
  ({ color }: { color: string }) =>
    <VendorTabIcon name={vendorIcons[routeName]} color={color} size={24} />;

export function VendorNavigator() {
  const theme = useTheme<Theme>();

  return (
    <Tab.Navigator
      screenOptions={{
        animation: 'shift',
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: theme.colors.vendor || '#FF5790',
        tabBarInactiveTintColor: theme.colors.textPrimary || '#181C1F',
        tabBarStyle: {
          backgroundColor: theme.colors.mainBackground || '#FFFFFF',
          borderTopColor: theme.colors.border || '#E9E9E9',
          height: 70,
          paddingTop: 5,
        },
      }}
    >
      <Tab.Screen
        name="VendorHome"
        component={VendorDashboardScreen}
        options={{ tabBarIcon: getVendorTabBarIcon('VendorHome') }}
      />
      <Tab.Screen
        name="VendorOrders"
        component={VendorOrdersScreen}
        options={{ tabBarIcon: getVendorTabBarIcon('VendorOrders') }}
      />
      <Tab.Screen
        name="VendorProducts"
        component={VendorProductsScreen}
        options={{ tabBarIcon: getVendorTabBarIcon('VendorProducts') }}
      />
      <Tab.Screen
        name="VendorWallet"
        component={VendorWalletScreen}
        options={{ tabBarIcon: getVendorTabBarIcon('VendorWallet') }}
      />
      <Tab.Screen
        name="VendorStore"
        component={VendorStoreScreen}
        options={{ tabBarIcon: getVendorTabBarIcon('VendorStore') }}
          />
    </Tab.Navigator>
  );
}

export default VendorNavigator;
