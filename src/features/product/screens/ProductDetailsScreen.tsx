import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Svg, { Path } from 'react-native-svg';

import { RootStackParamList } from '@/navigation/types';
import { fetchProductById } from '@/services/homeService';
import AppImage from '@/components/AppImage';
import ToastNotification from '@/components/ToastNotification';
import { fonts } from '@/theme/fonts';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addToCart, updateQuantity, removeFromCart } from '@/store/slices/cartSlice';
import { calculateDiscount, calculateDiscountWithPercent } from '@/utils/discount';
import { MessageCircle } from 'lucide-react-native';

const { width: windowWidth } = Dimensions.get('window');
const IMAGE_HEIGHT = Math.round(windowWidth * 1.05);

// Icons
const BackIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path
      d="M15 18l-6-6 6-6"
      stroke="#181C1F"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const HeartIcon = ({ filled = false }: { filled?: boolean }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill={filled ? '#FF2E63' : 'none'}>
    <Path
      d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
      stroke={filled ? '#FF2E63' : '#6B7280'}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const StarIcon = () => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="#FFA800">
    <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </Svg>
);

const BoltIcon = () => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="#004CFF">
    <Path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </Svg>
);

const StorefrontIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"
      stroke="#004CFF"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

type Props = NativeStackScreenProps<RootStackParamList, 'ProductDetails'>;

export default function ProductDetailsScreen({ route, navigation }: Props) {
  const { productId, name, initialProduct } = route.params;

  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state) => state.cart.items);

  const [product, setProduct] = useState<any>(initialProduct || null);
  const [loading, setLoading] = useState<boolean>(!initialProduct);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(
    initialProduct?.variants?.[0]?.size || 'M'
  );
  const [selectedColor, setSelectedColor] = useState<string | null>(
    initialProduct?.variants?.[0]?.color_name || 'Black'
  );
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    fetchProductById(productId)
      .then((data) => {
        if (!isMounted) return;
        if (data) {
          setProduct((prev: any) => ({ ...(prev || {}), ...data }));
          if (data.variants && data.variants.length > 0) {
            setSelectedSize((prev) => prev || data.variants?.[0]?.size || 'M');
            setSelectedColor((prev) => prev || data.variants?.[0]?.color_name || 'Black');
          }
        }
      })
      .catch((err) => console.warn('Error fetching product details:', err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [productId]);

  const images: string[] = useMemo(() => {
    if (product?.images && product.images.length > 0) return product.images;
    if (product?.image) return [product.image];
    return ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600'];
  }, [product]);

  const price = Number(product?.price) || 19.99;
  const passedDiscountPercent = route.params?.discountPercent;

  const discountDetails = useMemo(() => {
    if (passedDiscountPercent != null && passedDiscountPercent > 0) {
      return calculateDiscountWithPercent(price, passedDiscountPercent);
    }
    return calculateDiscount(price, product?.discount_price);
  }, [price, passedDiscountPercent, product?.discount_price]);

  const hasDiscount = discountDetails.hasDiscount;
  const discountPercent = discountDetails.discountPercent;
  const finalPrice = discountDetails.finalPrice;

  const vendor = product?.vendor;
  const variants = product?.variants || [];

  // Cart item identity key based on product + selected variant
  const cartItemKey = `${product?.id || productId}_${selectedSize || 'default'}_${selectedColor || 'default'}`;
  const existingCartItem = cartItems.find((item) => item.id === cartItemKey);
  const currentQtyInCart = existingCartItem ? existingCartItem.quantity : 0;

  // Selected variant & real stock
  const currentVariant = variants.find(
    (v: any) => v.color_name === selectedColor && v.size === selectedSize
  );
  const currentStock = currentVariant?.stock_qty ?? product?.stock_qty ?? 20;
  const isOutOfStock = currentStock <= 0;

  // Available sizes filtered by selected color (with fallback to all variant sizes)
  const availableSizes = useMemo(() => {
    if (selectedColor && variants.length > 0) {
      const colorMatching = variants.filter((v: any) => v.color_name === selectedColor);
      if (colorMatching.length > 0) {
        return colorMatching.map((v: any) => v.size).filter(Boolean);
      }
    }
    const set = new Set<string>();
    variants.forEach((v: any) => {
      if (v.size) set.add(v.size);
    });
    if (set.size > 0) return Array.from(set);
    return ['S', 'M', 'L', 'XL'];
  }, [variants, selectedColor]);

  const availableColors = useMemo(() => {
    const list: { name: string; hex: string }[] = [];
    const seen = new Set<string>();
    variants.forEach((v: any) => {
      if (v.color_name && !seen.has(v.color_name)) {
        seen.add(v.color_name);
        list.push({ name: v.color_name, hex: v.color_hex || '#000000' });
      }
    });
    if (list.length > 0) return list;
    return [
      { name: 'Black', hex: '#000000' },
      { name: 'Navy Blue', hex: '#000080' },
      { name: 'White', hex: '#FFFFFF' },
    ];
  }, [variants]);

  // RTK Add To Cart
  const handleAddToCart = useCallback(() => {
    dispatch(
      addToCart({
        id: cartItemKey,
        productId: product?.id || productId,
        title: product?.title || name,
        price,
        discountPrice: hasDiscount ? finalPrice : null,
        image: images[0],
        size: selectedSize,
        color: selectedColor,
        quantity: 1,
        vendorName: vendor?.store_name || 'Local Boutique',
      })
    );
    setShowToast(true);
  }, [
    dispatch,
    cartItemKey,
    product?.id,
    productId,
    product?.title,
    name,
    price,
    hasDiscount,
    finalPrice,
    images,
    selectedSize,
    selectedColor,
    vendor?.store_name,
  ]);

  // RTK Increase Quantity from Details Page
  const handleIncreaseQty = useCallback(() => {
    dispatch(
      updateQuantity({
        id: cartItemKey,
        quantity: currentQtyInCart + 1,
      })
    );
  }, [dispatch, cartItemKey, currentQtyInCart]);

  // RTK Decrease Quantity from Details Page
  const handleDecreaseQty = useCallback(() => {
    if (currentQtyInCart <= 1) {
      dispatch(removeFromCart(cartItemKey));
    } else {
      dispatch(
        updateQuantity({
          id: cartItemKey,
          quantity: currentQtyInCart - 1,
        })
      );
    }
  }, [dispatch, cartItemKey, currentQtyInCart]);

  if (loading && !product) {
    return (
      <View style={styles.centerLoading}>
        <StatusBar barStyle="dark-content" />
        <ActivityIndicator size="large" color="#004CFF" />
        <Text style={styles.loadingText}>Loading details...</Text>
      </View>
    );
  }

  const effectiveTotalPrice = finalPrice * (currentQtyInCart > 0 ? currentQtyInCart : 1);

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" />

      {/* Animated Floating Toast Notification */}
      <ToastNotification
        visible={showToast}
        title="Added to Cart! 🛒"
        message={`${product?.title || name}${selectedSize ? ` • Size: ${selectedSize}` : ''}`}
        image={images[0]}
        actionText="View Cart"
        onActionPress={() => {
          setShowToast(false);
          navigation.navigate('Tabs', { screen: 'Cart' });
        }}
        onDismiss={() => setShowToast(false)}
      />

      {/* Floating Translucent Round Back Button Over Image */}
      <SafeAreaView style={styles.floatingNav} edges={['top']}>
        <TouchableOpacity
          style={styles.translucentBackBtn}
          activeOpacity={0.75}
          onPress={() => navigation.goBack()}
        >
          <BackIcon />
        </TouchableOpacity>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* 1. Full-bleed Image Carousel (Starts from top Y=0) */}
        <View style={styles.imageCarouselWrapper}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const slide = Math.round(e.nativeEvent.contentOffset.x / windowWidth);
              if (slide !== activeImageIndex) {
                setActiveImageIndex(slide);
              }
            }}
          >
            {images.map((img, idx) => (
              <View key={idx} style={styles.imageSlide}>
                <AppImage
                  source={{ uri: img }}
                  style={styles.slideImage}
                  resizeMode="cover"
                />
              </View>
            ))}
          </ScrollView>

          {/* Dots Indicator */}
          {images.length > 1 && (
            <View style={styles.dotsRow}>
              {images.map((_, idx) => (
                <View
                  key={idx}
                  style={[styles.dot, activeImageIndex === idx && styles.activeDot]}
                />
              ))}
            </View>
          )}
        </View>

        {/* 2. Main Details Card */}
        <View style={styles.contentCard}>
          {/* Category Chip & Rating */}
          <View style={styles.topMetaRow}>
            <View style={styles.categoryChip}>
              <Text style={styles.categoryChipText}>
                {product?.category?.name || 'Local Favorite'}
              </Text>
            </View>

            <View style={styles.ratingBadge}>
              <StarIcon />
              <Text style={styles.ratingText}>{product?.rating ?? 4.8}</Text>
              <Text style={styles.reviewCount}>({product?.review_count ?? 128})</Text>
            </View>
          </View>

          {/* Product Title */}
          <Text style={styles.title}>{product?.title || name}</Text>

          {/* Price Row with Discount Badge & Stock Status */}
          <View style={styles.priceRow}>
            <Text style={styles.currentPrice}>${finalPrice.toFixed(2)}</Text>
            {hasDiscount && (
              <View style={styles.originalPriceWrap}>
                <Text style={styles.originalPrice}>${price.toFixed(2)}</Text>
                <View style={styles.thickStrikeLine} />
              </View>
            )}
            {hasDiscount && discountPercent != null && (
              <View style={styles.discountPill}>
                <Text style={styles.discountPillText}>-{discountPercent}%</Text>
              </View>
            )}
            <View style={[styles.inStockBadge, isOutOfStock && styles.outOfStockBadge]}>
              <Text style={[styles.inStockText, isOutOfStock && styles.outOfStockText]}>
                {isOutOfStock ? 'Out of Stock' : `In Stock (${currentStock})`}
              </Text>
            </View>
          </View>

          {/* Hyperlocal Vendor Card */}
          <View style={styles.vendorCard}>
            <View style={styles.vendorIconWrap}>
              <StorefrontIcon />
            </View>
            <View style={styles.vendorInfoWrap}>
              <Text style={styles.vendorTitle}>{vendor?.store_name || 'Indore Local Boutique'}</Text>
              <Text style={styles.vendorSub}>
                📍 {vendor?.address_line || 'Indore'} • ⭐ {vendor?.rating ?? 4.9}
              </Text>
            </View>
            <View style={styles.deliveryBadge}>
              <BoltIcon />
              <Text style={styles.deliveryText}>20 mins</Text>
            </View>
          </View>

          {/* 3. Size Selection */}
          <View style={styles.sectionWrap}>
            <Text style={styles.sectionHeading}>Select Size</Text>
            <View style={styles.optionsRow}>
              {availableSizes.map((sz: string) => {
                const isSelected = selectedSize === sz;
                return (
                  <TouchableOpacity
                    key={sz}
                    style={[styles.sizeBox, isSelected && styles.sizeBoxSelected]}
                    activeOpacity={0.8}
                    onPress={() => setSelectedSize(sz)}
                  >
                    <Text style={[styles.sizeText, isSelected && styles.sizeTextSelected]}>
                      {sz}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* 4. Color Selection: Round Circle Dots from DB */}
          <View style={styles.sectionWrap}>
            <Text style={styles.sectionHeading}>Select Color</Text>
            <View style={styles.colorDotsRow}>
              {availableColors.map((cl) => {
                const isSelected = selectedColor === cl.name;
                const isWhite =
                  cl.hex.toLowerCase() === '#ffffff' || cl.hex.toLowerCase() === '#fff';
                return (
                  <TouchableOpacity
                    key={cl.name}
                    style={[
                      styles.colorDotRing,
                      isSelected && styles.colorDotRingSelected,
                    ]}
                    activeOpacity={0.8}
                    onPress={() => setSelectedColor(cl.name)}
                  >
                    <View
                      style={[
                        styles.colorDot,
                        { backgroundColor: cl.hex },
                        isWhite && styles.whiteDotBorder,
                      ]}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* 5. Description */}
          <View style={styles.sectionWrap}>
            <Text style={styles.sectionHeading}>Description</Text>
            <Text style={styles.descText}>
              {product?.description ||
                'High-grade quality fashion item sourced directly from trusted boutique sellers in your local area. Verified for fabric quality, comfort, and fast delivery to your door.'}
            </Text>
          </View>

          {/* 6. Product Specifications */}
          {(product?.brand || product?.fabric || product?.fit || product?.material || product?.occasion || product?.pattern || product?.season) ? (
            <View style={styles.sectionWrap}>
              <Text style={styles.sectionHeading}>Specifications</Text>
              <View style={styles.specsContainer}>
                {product?.brand ? (
                  <View style={styles.specRow}>
                    <Text style={styles.specLabel}>Brand</Text>
                    <Text style={styles.specValue}>{product.brand}</Text>
                  </View>
                ) : null}
                {product?.gender ? (
                  <View style={styles.specRow}>
                    <Text style={styles.specLabel}>Gender</Text>
                    <Text style={styles.specValue}>{product.gender}</Text>
                  </View>
                ) : null}
                {product?.material ? (
                  <View style={styles.specRow}>
                    <Text style={styles.specLabel}>Material</Text>
                    <Text style={styles.specValue}>{product.material}</Text>
                  </View>
                ) : null}
                {product?.fabric ? (
                  <View style={styles.specRow}>
                    <Text style={styles.specLabel}>Fabric</Text>
                    <Text style={styles.specValue}>{product.fabric}</Text>
                  </View>
                ) : null}
                {product?.fit ? (
                  <View style={styles.specRow}>
                    <Text style={styles.specLabel}>Fit</Text>
                    <Text style={styles.specValue}>{product.fit}</Text>
                  </View>
                ) : null}
                {product?.pattern ? (
                  <View style={styles.specRow}>
                    <Text style={styles.specLabel}>Pattern</Text>
                    <Text style={styles.specValue}>{product.pattern}</Text>
                  </View>
                ) : null}
                {product?.occasion ? (
                  <View style={styles.specRow}>
                    <Text style={styles.specLabel}>Occasion</Text>
                    <Text style={styles.specValue}>{product.occasion}</Text>
                  </View>
                ) : null}
                {product?.season ? (
                  <View style={styles.specRow}>
                    <Text style={styles.specLabel}>Season</Text>
                    <Text style={styles.specValue}>{product.season}</Text>
                  </View>
                ) : null}
              </View>
            </View>
          ) : null}
        </View>
      </ScrollView>

      {/* 6. Sticky Bottom Action Bar */}
      <SafeAreaView style={styles.bottomBar} edges={['bottom']}>
        {/* Total Price */}
        <View style={styles.bottomPriceCol}>
          <Text style={styles.bottomPriceLabel}>Total Price</Text>
          <Text style={styles.bottomPriceValue}>${effectiveTotalPrice.toFixed(2)}</Text>
        </View>

        {/* Action Controls: Wishlist + Add To Cart / Quantity Stepper */}
        <View style={styles.bottomButtonsRow}>
          {/* Wishlist Button (Heart next to Cart) */}
          <TouchableOpacity
            style={[styles.wishlistBottomBtn, isLiked && styles.wishlistBottomBtnActive]}
            activeOpacity={0.8}
            onPress={() => setIsLiked(!isLiked)}
          >
            <HeartIcon filled={isLiked} />
          </TouchableOpacity>

          {/* Chat with Seller Button */}
          <TouchableOpacity
            style={styles.wishlistBottomBtn}
            activeOpacity={0.8}
            onPress={() => {
              if (product) {
                navigation.navigate('ChatRoom', {
                  vendorId: product.vendor_id || 'v-ind-001',
                  title: product.vendor?.store_name || 'Store Seller',
                  avatarUrl: product.vendor?.logo_url,
                  product: {
                    id: product.id,
                    title: product.title,
                    price: hasDiscount ? finalPrice : price,
                    image_url: images && images.length > 0 ? images[0] : null,
                  },
                });
              }
            }}
            accessibilityLabel="Chat with Seller"
          >
            <MessageCircle size={20} color="#004BFF" />
          </TouchableOpacity>

          {/* If already in cart -> Quantity Stepper from details page */}
          {currentQtyInCart > 0 ? (
            <View style={styles.stepperContainer}>
              <TouchableOpacity
                style={styles.stepperActionBtn}
                activeOpacity={0.7}
                onPress={handleDecreaseQty}
              >
                <Text style={styles.stepperActionText}>−</Text>
              </TouchableOpacity>

              <View style={styles.stepperQtyDisplay}>
                <Text style={styles.stepperQtyNum}>{currentQtyInCart}</Text>
                <Text style={styles.stepperQtySub}>in cart</Text>
              </View>

              <TouchableOpacity
                style={styles.stepperActionBtn}
                activeOpacity={0.7}
                onPress={handleIncreaseQty}
              >
                <Text style={styles.stepperActionText}>+</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* Primary Add To Cart Button */
            <TouchableOpacity
              style={styles.addToCartPrimaryBtn}
              activeOpacity={0.88}
              onPress={handleAddToCart}
            >
              <Text style={styles.addToCartPrimaryText}>Add to Cart</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8F9FD',
  },
  centerLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FD',
  },
  loadingText: {
    fontFamily: fonts.nunito.regular,
    fontSize: 14,
    color: '#6B7280',
    marginTop: 10,
  },
  floatingNav: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  translucentBackBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.22)', // Ultra crystal clear glass
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.45)', // Crisp subtle glass rim
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 0, // Removes Android muddy shadow so it's 100% crystal clear
      },
    }),
  },
  scrollContent: {
    paddingBottom: 110,
  },
  imageCarouselWrapper: {
    width: windowWidth,
    height: IMAGE_HEIGHT,
    backgroundColor: '#F0F2F6',
    position: 'relative',
  },
  imageSlide: {
    width: windowWidth,
    height: IMAGE_HEIGHT,
  },
  slideImage: {
    width: '100%',
    height: '100%',
  },
  dotsRow: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  activeDot: {
    width: 18,
    backgroundColor: '#004CFF',
  },
  contentCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -20,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 20,
  },
  topMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  categoryChip: {
    backgroundColor: '#EEF3FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryChipText: {
    fontFamily: fonts.nunito.bold,
    fontSize: 11,
    color: '#004CFF',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontFamily: fonts.nunito.bold,
    fontSize: 13,
    color: '#181C1F',
  },
  reviewCount: {
    fontFamily: fonts.nunito.regular,
    fontSize: 12,
    color: '#8E95A5',
  },
  title: {
    fontFamily: fonts.raleway.bold,
    fontSize: 22,
    lineHeight: 28,
    color: '#181C1F',
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 18,
  },
  currentPrice: {
    fontFamily: fonts.raleway.bold,
    fontSize: 26,
    color: '#004CFF',
  },
  originalPriceWrap: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  originalPrice: {
    fontFamily: fonts.nunito.regular,
    fontSize: 16,
    lineHeight: 20,
    color: '#9CA3AF',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  thickStrikeLine: {
    position: 'absolute',
    left: -2,
    right: -2,
    height: 2.2,
    backgroundColor: '#F1AEAE',
    borderRadius: 1.5,
  },
  inStockBadge: {
    backgroundColor: '#E8FBF0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginLeft: 'auto',
  },
  inStockText: {
    fontFamily: fonts.nunito.semiBold,
    fontSize: 11,
    color: '#00A854',
  },
  outOfStockBadge: {
    backgroundColor: '#FEE2E2',
  },
  outOfStockText: {
    color: '#EF4444',
  },
  discountPill: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  discountPillText: {
    fontFamily: fonts.nunito.bold,
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  // Specifications
  specsContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    gap: 8,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  specLabel: {
    fontFamily: fonts.nunito.regular,
    fontSize: 13,
    color: '#6B7280',
  },
  specValue: {
    fontFamily: fonts.nunito.bold,
    fontSize: 13,
    color: '#181C1F',
  },
  vendorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FD',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EEF1F8',
    marginBottom: 20,
  },
  vendorIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  vendorInfoWrap: {
    flex: 1,
  },
  vendorTitle: {
    fontFamily: fonts.raleway.bold,
    fontSize: 14,
    color: '#181C1F',
  },
  vendorSub: {
    fontFamily: fonts.nunito.regular,
    fontSize: 11,
    color: '#8E95A5',
    marginTop: 2,
  },
  deliveryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 3,
  },
  deliveryText: {
    fontFamily: fonts.nunito.bold,
    fontSize: 11,
    color: '#004CFF',
  },
  sectionWrap: {
    marginTop: 18,
  },
  sectionHeading: {
    fontFamily: fonts.raleway.bold,
    fontSize: 15,
    color: '#181C1F',
    marginBottom: 10,
  },
  selectedColorName: {
    fontFamily: fonts.nunito.regular,
    fontSize: 13,
    color: '#707070',
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  sizeBox: {
    minWidth: 46,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  sizeBoxSelected: {
    borderColor: '#004CFF',
    backgroundColor: '#EEF3FF',
  },
  sizeText: {
    fontFamily: fonts.raleway.bold,
    fontSize: 14,
    color: '#4B5563',
  },
  sizeTextSelected: {
    color: '#004CFF',
  },
  colorDotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  colorDotRing: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorDotRingSelected: {
    borderColor: '#004CFF',
  },
  colorDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
  },
  whiteDotBorder: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  descText: {
    fontFamily: fonts.nunito.regular,
    fontSize: 13,
    lineHeight: 20,
    color: '#6B7280',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEF0F5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  bottomPriceCol: {
    flexDirection: 'column',
  },
  bottomPriceLabel: {
    fontFamily: fonts.nunito.regular,
    fontSize: 11,
    color: '#8E95A5',
  },
  bottomPriceValue: {
    fontFamily: fonts.raleway.bold,
    fontSize: 22,
    color: '#181C1F',
  },
  bottomButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  wishlistBottomBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F3F4F8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  wishlistBottomBtnActive: {
    backgroundColor: '#FFE9EF',
    borderColor: '#FFBACD',
  },
  addToCartPrimaryBtn: {
    backgroundColor: '#004CFF',
    paddingHorizontal: 26,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#004CFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.28,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  addToCartPrimaryText: {
    fontFamily: fonts.raleway.bold,
    fontSize: 14,
    color: '#FFFFFF',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF3FF',
    borderRadius: 14,
    height: 48,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: '#D4E2FF',
  },
  stepperActionBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
      },
      android: {
        elevation: 1.5,
      },
    }),
  },
  stepperActionText: {
    fontFamily: fonts.raleway.bold,
    fontSize: 18,
    color: '#004CFF',
    lineHeight: 20,
  },
  stepperQtyDisplay: {
    alignItems: 'center',
    paddingHorizontal: 12,
    minWidth: 46,
  },
  stepperQtyNum: {
    fontFamily: fonts.raleway.bold,
    fontSize: 16,
    color: '#004CFF',
  },
  stepperQtySub: {
    fontFamily: fonts.nunito.regular,
    fontSize: 9,
    color: '#7088B8',
    marginTop: -2,
  },
});