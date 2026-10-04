import React from 'react';
import { Image, StyleSheet } from 'react-native';

export type TabIconName = 'home' | 'heart' | 'orders' | 'bag' | 'user';

const TAB_IMAGES: Record<TabIconName, any> = {
  home: require('@/assets/png/Shop.png'),
  heart: require('@/assets/png/wishlist.png'),
  orders: require('@/assets/png/Categories.png'),
  bag: require('@/assets/png/Cart.png'),
  user: require('@/assets/png/Profile.png'),
};

type Props = {
  name: TabIconName;
  color: string;
  size?: number;
  focused?: boolean;
};

export default function TabIcon({ name, color, size = 24 }: Props) {
  const imageSource = TAB_IMAGES[name];

  return (
    <Image
      source={imageSource}
      style={[
        styles.icon,
        {
          width: size,
          height: size,
          tintColor: color,
        },
      ]}
      resizeMode="contain"
    />
  );
}

const styles = StyleSheet.create({
  icon: {
    width: 24,
    height: 24,
  },
});