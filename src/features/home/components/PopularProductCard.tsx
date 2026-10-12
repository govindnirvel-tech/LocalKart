import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import AppImage from '@/components/AppImage';
import { fonts } from '@/theme/fonts';
import type { Product } from '@/types/database';

export interface PopularProductCardProps {
  product: Product;
  cardWidth?: number;
  cardHeight?: number;
  onPress?: (product: Product) => void;
  testID?: string;
}

const BlueHeartIcon = ({
  size = 14,
  color = '#0042E0',
}: {
  size?: number;
  color?: string;
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </Svg>
);

export const PopularProductCard: React.FC<PopularProductCardProps> = React.memo(({
  product,
  cardWidth = 104,
  cardHeight = 150,
  onPress,
  testID,
}) => {
  const imageUri =
    product.images && product.images.length > 0 ? product.images[0] : undefined;

  const likesCount = product.likes_count ?? 1780;

  return (
    <TouchableOpacity
      testID={testID}
      style={[styles.card, { width: cardWidth, height: cardHeight }]}
      activeOpacity={0.85}
      onPress={() => onPress?.(product)}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`${product.title}, ${likesCount} likes`}
    >
      <View style={styles.imageContainer}>
        <AppImage
          source={
            imageUri
              ? { uri: imageUri }
              : require('@/assets/png/onboarding_slide2.jpg')
          }
          style={styles.image}
          borderRadius={10}
          resizeMode="cover"
        />
      </View>
      <View style={styles.tagRow}>
        <View style={styles.likesRow}>
          <Text style={styles.likesText}>{likesCount}</Text>
          <BlueHeartIcon size={14} color="#0042E0" />
        </View>
        {product.tag ? (
          <Text style={styles.tagText}>{product.tag}</Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    padding: 6,
    borderRadius: 14,
    marginRight: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
    }),
  },
  imageContainer: {
    flex: 1,
    width: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    marginTop: 6,
    height: 20,
  },
  likesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  likesText: {
    fontFamily: fonts.raleway.bold,
    fontSize: 14,
    color: '#181C1F',
  },
  tagText: {
    fontFamily: fonts.raleway.medium,
    fontSize: 12,
    color: '#202020',
  },
});

export default PopularProductCard;
