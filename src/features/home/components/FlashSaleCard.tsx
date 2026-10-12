import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AppImage from '@/components/AppImage';
import { fonts } from '@/theme/fonts';
import type { Product } from '@/types/database';

export interface FlashSaleItemData {
  id: string;
  image: string;
  discount?: string;
  product?: Product;
}

export interface FlashSaleCardProps {
  item: FlashSaleItemData;
  cardWidth?: number;
  cardHeight?: number;
  onPress?: (item: FlashSaleItemData) => void;
  testID?: string;
}

export const FlashSaleCard: React.FC<FlashSaleCardProps> = React.memo(({
  item,
  cardWidth = 99,
  cardHeight = 103,
  onPress,
  testID,
}) => {
  const discountText = item.discount || '-20%';

  return (
    <TouchableOpacity
      testID={testID}
      style={[styles.container, { width: cardWidth, height: cardHeight }]}
      activeOpacity={0.85}
      onPress={() => onPress?.(item)}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`Flash sale item, ${discountText} off`}
    >
      <AppImage
        source={{ uri: item.image }}
        style={styles.image}
        borderRadius={9}
        resizeMode="cover"
      />
      {/* Promo banner matching top-right corner badge */}
      <LinearGradient
        colors={['#F9154B', '#FF5A93']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.badgeContainer}
      >
        <Text style={styles.badgeText}>{discountText}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
      default: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
    }),
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badgeContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderTopRightRadius: 9,
    borderBottomLeftRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontFamily: fonts.nunito.bold,
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: -0.2,
    textAlign: 'center',
  },
});

export default FlashSaleCard;
