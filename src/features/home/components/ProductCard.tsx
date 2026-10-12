import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
} from 'react-native';
import AppImage from '@/components/AppImage';
import { fonts } from '@/theme/fonts';
import type { Product } from '@/types/database';

import { calculateDiscount } from '@/utils/discount';

export interface ProductCardProps {
  product: Product;
  cardWidth?: number;
  imageHeight?: number;
  onPress?: (product: Product) => void;
  testID?: string;
}

export const ProductCard: React.FC<ProductCardProps> = React.memo(({
  product,
  cardWidth = 140,
  imageHeight = 140,
  onPress,
  testID,
}) => {
  const origPrice = Number(product.price) || 0;
  const disc = calculateDiscount(origPrice, product.discount_price);
  const displayPrice = disc.hasDiscount
    ? `$${disc.finalPrice.toFixed(2)}`
    : `$${origPrice.toFixed(2)}`;

  const imageUri =
    product.images && product.images.length > 0 ? product.images[0] : undefined;

  return (
    <TouchableOpacity
      testID={testID}
      style={[styles.container, { width: cardWidth }]}
      activeOpacity={0.85}
      onPress={() => onPress?.(product)}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`${product.title}, ${displayPrice}`}
    >
      <View
        style={[
          styles.imageContainer,
          { width: cardWidth, height: imageHeight },
        ]}
      >
        <AppImage
          source={
            imageUri
              ? { uri: imageUri }
              : require('@/assets/png/onboarding_girl_1.png')
          }
          style={styles.image}
          borderRadius={9}
          resizeMode="cover"
        />
      </View>
      <Text style={styles.title} numberOfLines={2}>
        {product.title}
      </Text>
      <Text style={styles.price}>{displayPrice}</Text>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    marginRight: 14,
  },
  imageContainer: {
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.04)',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      default: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
    }),
  },
  image: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontFamily: fonts.nunito.regular,
    fontSize: 12,
    lineHeight: 16,
    color: '#202020',
    marginTop: 8,
  },
  price: {
    fontFamily: fonts.raleway.bold,
    fontSize: 17,
    color: '#000000',
    marginTop: 4,
  },
});

export default ProductCard;
