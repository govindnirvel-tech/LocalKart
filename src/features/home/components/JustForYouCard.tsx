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

export type JustForYouProductData = Pick<Product, 'id' | 'title' | 'price'> & {
  discount_price?: number | null;
  images?: string[];
};

export interface JustForYouCardProps {
  product: JustForYouProductData | Product;
  cardWidth?: number;
  imageHeight?: number;
  onPress?: (product: JustForYouProductData | Product) => void;
  testID?: string;
}

export const JustForYouCard: React.FC<JustForYouCardProps> = React.memo(({
  product,
  cardWidth = 155,
  imageHeight,
  onPress,
  testID,
}) => {
  const computedImageHeight =
    imageHeight ?? Math.round(cardWidth * (171 / 155));

  const origPrice = Number(product.price) || 0;
  const disc = calculateDiscount(origPrice, product.discount_price);
  const displayPrice = disc.hasDiscount
    ? `$${disc.finalPrice.toFixed(2).replace('.', ',')}`
    : `$${origPrice.toFixed(2).replace('.', ',')}`;

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
          { width: cardWidth, height: computedImageHeight },
        ]}
      >
        <AppImage
          source={
            imageUri
              ? { uri: imageUri }
              : require('@/assets/png/onboarding_girl_1.png')
          }
          style={{ width: cardWidth, height: computedImageHeight }}
          borderRadius={10}
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
    marginBottom: 16,
  },
  imageContainer: {
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
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
    color: '#181C1F',
    marginTop: 4,
  },
});

export default JustForYouCard;
