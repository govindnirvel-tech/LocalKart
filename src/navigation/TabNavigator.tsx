import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '@shopify/restyle';
import { Theme } from '@/theme';
import { TabParamList } from '@/navigation/types';
import TabIcon, { TabIconName } from '@/components/TabIcon';
import HomeScreen from '@/features/home/screens/HomeScreen';
import WishlistScreen from '@/features/wishlist/screens/WishlistScreen';
import OrdersScreen from '@/features/orders/screens/OrdersScreen';
import CartScreen from '@/features/cart/screens/CartScreen';
import ProfileScreen from '@/features/profile/screens/ProfileScreen';

const Tab = createBottomTabNavigator<TabParamList>();

const icons: Record<keyof TabParamList, TabIconName> = {
  Home: 'home',
  Wishlist: 'heart',
  Orders: 'orders',
  Cart: 'bag',
  Profile: 'user',
};

const getTabBarIcon =
  (routeName: keyof TabParamList) =>
  ({ color }: { color: string }) =>
    <TabIcon name={icons[routeName]} color={color} />;

export default function TabNavigator() {
  const theme = useTheme<Theme>();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textPrimary,
        tabBarStyle: {
          backgroundColor: theme.colors.mainBackground,
          borderTopColor: theme.colors.border,
          height: 70,
          paddingTop: 5,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarIcon: getTabBarIcon('Home') }}
      />
      <Tab.Screen
        name="Wishlist"
        component={WishlistScreen}
        options={{ tabBarIcon: getTabBarIcon('Wishlist') }}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersScreen}
        options={{ tabBarIcon: getTabBarIcon('Orders') }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{ tabBarIcon: getTabBarIcon('Cart') }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarIcon: getTabBarIcon('Profile') }}
      />
    </Tab.Navigator>
  );
}