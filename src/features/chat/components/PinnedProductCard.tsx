import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import FastImage from 'react-native-fast-image';
import { X, ShoppingBag } from 'lucide-react-native';
import { fonts } from '@/theme/fonts';
import { ProductPreview } from '../types';

interface PinnedProductCardProps {
  product: ProductPreview;
  onPress: () => void;
  onDismiss: () => void;
}

export const PinnedProductCard: React.FC<PinnedProductCardProps> = ({
  product,
  onPress,
  onDismiss,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.contentWrap}
        onPress={onPress}
        activeOpacity={0.8}
      >
        {product.image_url ? (
          <FastImage
            source={{
              uri: product.image_url,
              priority: FastImage.priority.normal,
              cache: FastImage.cacheControl.immutable,
            }}
            style={styles.image}
            resizeMode={FastImage.resizeMode.cover}
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <ShoppingBag size={20} color="#004BFF" />
          </View>
        )}

        <View style={styles.metaCol}>
          <Text style={styles.tag}>INQUIRING ABOUT THIS ITEM</Text>
          <Text style={styles.title} numberOfLines={1}>
            {product.title}
          </Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{product.price}</Text>
            {product.discount_price && (
              <Text style={styles.originalPrice}>₹{product.discount_price}</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.closeBtn}
        onPress={onDismiss}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <X size={16} color="#707070" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F7FAFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2ECFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  contentWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    marginRight: 10,
  },
  imagePlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#EBF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  metaCol: {
    flex: 1,
    justifyContent: 'center',
  },
  tag: {
    fontSize: 9,
    fontFamily: fonts.raleway.bold,
    color: '#004BFF',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 13,
    fontFamily: fonts.raleway.bold,
    color: '#181C1F',
    marginTop: 1,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 1,
  },
  price: {
    fontSize: 13,
    fontFamily: fonts.raleway.bold,
    color: '#181C1F',
  },
  originalPrice: {
    fontSize: 11,
    fontFamily: fonts.raleway.regular,
    color: '#8D8D8D',
    textDecorationLine: 'line-through',
  },
  closeBtn: {
    padding: 6,
    marginLeft: 8,
  },
});
