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

export interface CategoryCardData {
  id: string;
  name: string;
  count: string | number;
  images: string[];
}

export interface CategoryCardProps {
  category: CategoryCardData;
  cardWidth: number;
  onPress?: (category: CategoryCardData) => void;
  testID?: string;
}

// Fallback images if fewer than 4 are provided
const DEFAULT_FALLBACKS = [
  'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=300',
  'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=300',
  'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=300',
  'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=300',
];

export const CategoryCard: React.FC<CategoryCardProps> = React.memo(({
  category,
  cardWidth,
  onPress,
  testID,
}) => {
  const { name, count, images = [] } = category;

  // Auto-calculate mini image size dynamically based on cardWidth
  // cardPadding = 6 on each side (total 12), gap between mini images = 6
  const miniImageSize = Math.max(20, Math.floor((cardWidth - 12 - 6) / 2));

  // Ensure exactly 4 images for the 2x2 grid
  const safeImages = [
    images[0] || DEFAULT_FALLBACKS[0],
    images[1] || DEFAULT_FALLBACKS[1],
    images[2] || DEFAULT_FALLBACKS[2],
    images[3] || DEFAULT_FALLBACKS[3],
  ];

  return (
    <TouchableOpacity
      testID={testID}
      activeOpacity={0.85}
      onPress={() => onPress?.(category)}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`${name}, ${count} items`}
      style={[styles.card, { width: cardWidth }]}
    >
      {/* 2x2 Inner Mini Boxes Grid */}
      <View style={styles.grid}>
        {/* Row 1 */}
        <View style={styles.gridRow}>
          <AppImage
            source={{ uri: safeImages[0] }}
            style={{ width: miniImageSize, height: miniImageSize }}
            borderRadius={8}
            resizeMode="cover"
          />
          <AppImage
            source={{ uri: safeImages[1] }}
            style={{ width: miniImageSize, height: miniImageSize }}
            borderRadius={8}
            resizeMode="cover"
          />
        </View>

        {/* Row 2 */}
        <View style={styles.gridRow}>
          <AppImage
            source={{ uri: safeImages[2] }}
            style={{ width: miniImageSize, height: miniImageSize }}
            borderRadius={8}
            resizeMode="cover"
          />
          <AppImage
            source={{ uri: safeImages[3] }}
            style={{ width: miniImageSize, height: miniImageSize }}
            borderRadius={8}
            resizeMode="cover"
          />
        </View>
      </View>

      {/* Category Info Row */}
      <View style={styles.bottomRow}>
        <Text style={styles.categoryName} numberOfLines={1}>
          {name}
        </Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{count}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 6,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.04)',
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
  grid: {
    gap: 6,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 6,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingTop: 8,
    paddingBottom: 2,
  },
  categoryName: {
    fontFamily: fonts.raleway.bold,
    fontSize: 17,
    color: '#181C1F',
    flex: 1,
    marginRight: 6,
  },
  countBadge: {
    backgroundColor: '#F3F3F3',
    minWidth: 38,
    height: 20,
    borderRadius: 8,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countText: {
    fontFamily: fonts.nunito.bold,
    fontSize: 12,
    color: '#181C1F',
    textAlign: 'center',
  },
});

export default CategoryCard;
