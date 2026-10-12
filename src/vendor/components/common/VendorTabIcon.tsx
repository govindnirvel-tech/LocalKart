import React from 'react';
import { StyleSheet, View } from 'react-native';
import {
  LayoutDashboard,
  ShoppingBag,
  PackageOpen,
  WalletCards,
  UserRoundPen,
} from 'lucide-react-native';

export type VendorTabIconName = 'home' | 'orders' | 'products' | 'wallet' | 'store';

interface VendorTabIconProps {
  name: VendorTabIconName;
  color: string;
  size?: number;
  strokeWidth?: number;
  focused?: boolean;
}

export const VendorTabIcon: React.FC<VendorTabIconProps> = ({
  name,
  color,
  size = 24,
  strokeWidth = 2,
}) => {
  if (name === 'home') {
    return (
      <View style={[styles.svgWrapper, { width: size, height: size }]}>
        <LayoutDashboard size={size} color={color} strokeWidth={strokeWidth} />
      </View>
    );
  }

  if (name === 'orders') {
    return (
      <View style={[styles.svgWrapper, { width: size, height: size }]}>
        <ShoppingBag size={size} color={color} strokeWidth={strokeWidth} />
      </View>
    );
  }

  if (name === 'products') {
    return (
      <View style={[styles.svgWrapper, { width: size, height: size }]}>
        <PackageOpen size={size} color={color} strokeWidth={strokeWidth} />
      </View>
    );
  }

  if (name === 'wallet') {
    return (
      <View style={[styles.svgWrapper, { width: size, height: size }]}>
        <WalletCards size={size} color={color} strokeWidth={strokeWidth} />
      </View>
    );
  }

  if (name === 'store') {
    return (
      <View style={[styles.svgWrapper, { width: size, height: size }]}>
        <UserRoundPen size={size} color={color} strokeWidth={strokeWidth} />
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  svgWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default VendorTabIcon;
