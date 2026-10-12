import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  Platform,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Path } from 'react-native-svg';

import { RootStackParamList } from '@/navigation/types';
import { fonts } from '@/theme/fonts';
import AppImage from '@/components/AppImage'; 
import FlashSaleTimer from '@/features/home/components/FlashSaleTimer';
import FilterSvg from '@/assets/svg/filter.svg';
import FilterModal, { FilterState } from '@/features/product/components/FilterModal';
import { fetchFlashSaleProducts } from '@/services/homeService';
import type { Product } from '@/types/database';
import { calculateDiscount, calculateDiscountWithPercent } from '@/utils/discount';

const { width: windowWidth } = Dimensions.get('window');
const HORIZONTAL_PADDING = 20;
const GRID_GAP = 12;
const CARD_WIDTH = Math.floor((windowWidth - (HORIZONTAL_PADDING * 2) - GRID_GAP) / 2);
const IMAGE_HEIGHT = Math.round(CARD_WIDTH * 1.08);

// Back Arrow SVG
const BackArrowIcon = ({ size = 20, color = '#181C1F' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 12H5M12 19l-7-7 7-7"
      stroke={color}
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);



// Play Icon for Live showcase
const PlayIcon = ({ size = 16, color = '#FFFFFF' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Path d="M8 5v14l11-7z" />
  </Svg>
);

// Exact Figma 60x40 Active Discount Pill (Component 6 - 2)
const ActiveDiscountPill = ({ text }: { text: string }) => (
  <View style={styles.activePillWrap}>
    <Svg width={60} height={40} viewBox="0 0 60 40">
      {/* 60x40 Rounded Capsule (Radius 20, Fill #FFFFFF, Stroke #004CFF, StrokeWidth 3) */}
      <Path
        d="M 20 1.5 L 40 1.5 A 18.5 18.5 0 0 1 58.5 20 A 18.5 18.5 0 0 1 40 38.5 L 20 38.5 A 18.5 18.5 0 0 1 1.5 20 A 18.5 18.5 0 0 1 20 1.5 Z"
        fill="#FFFFFF"
        stroke="#004CFF"
        strokeWidth={3}
      />
      {/* Figma Downward Polygon (Triangle) */}
      <Path
        d="M 22 0 L 38 0 L 30 14 Z"
        fill="#004CFF"
      />
    </Svg>
    <View style={styles.activePillTextOverlay}>
      <Text style={styles.activePillText}>{text}</Text>
    </View>
  </View>
);

interface FlashProductItem {
  id: string;
  title: string;
  price: number;
  originalPrice: number;
  discount: string;
  discountPercent: number;
  image: string;
}

const ALL_FLASH_PRODUCTS: FlashProductItem[] = [
  {
    id: 'fp-1',
    title: 'Lorem ipsum dolor sit amet consectetur',
    price: 16.0,
    originalPrice: 20.0,
    discount: '-20%',
    discountPercent: 20,
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500',
  },
  {
    id: 'fp-2',
    title: 'Lorem ipsum dolor sit amet consectetur',
    price: 16.0,
    originalPrice: 20.0,
    discount: '-20%',
    discountPercent: 20,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
  },
  {
    id: 'fp-3',
    title: 'Lorem ipsum dolor sit amet consectetur',
    price: 16.0,
    originalPrice: 20.0,
    discount: '-20%',
    discountPercent: 20,
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500',
  },
  {
    id: 'fp-4',
    title: 'Lorem ipsum dolor sit amet consectetur',
    price: 16.0,
    originalPrice: 20.0,
    discount: '-20%',
    discountPercent: 20,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500',
  },
  {
    id: 'fp-5',
    title: 'Lorem ipsum dolor sit amet consectetur',
    price: 18.0,
    originalPrice: 20.0,
    discount: '-10%',
    discountPercent: 10,
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500',
  },
  {
    id: 'fp-6',
    title: 'Lorem ipsum dolor sit amet consectetur',
    price: 14.0,
    originalPrice: 20.0,
    discount: '-30%',
    discountPercent: 30,
    image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500',
  },
  {
    id: 'fp-7',
    title: 'Lorem ipsum dolor sit amet consectetur',
    price: 12.0,
    originalPrice: 20.0,
    discount: '-40%',
    discountPercent: 40,
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500',
  },
  {
    id: 'fp-8',
    title: 'Lorem ipsum dolor sit amet consectetur',
    price: 10.0,
    originalPrice: 20.0,
    discount: '-50%',
    discountPercent: 50,
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500',
  },
];

const DISCOUNT_TABS = ['All', '10%', '20%', '30%', '40%', '50%'];

const FlashSaleProductCard = React.memo(function FlashSaleProductCard({
  item,
  onPress,
}: {
  item: FlashProductItem;
  onPress: (item: FlashProductItem) => void;
}) {
  const handlePress = useCallback(() => {
    onPress(item);
  }, [item, onPress]);

  return (
    <TouchableOpacity
      style={[styles.productCard, { width: CARD_WIDTH }]}
      activeOpacity={0.88}
      onPress={handlePress}
    >
      {/* Image Container with -20% badge */}
      <View style={[styles.imageWrap, { height: IMAGE_HEIGHT }]}>
        <AppImage
          source={{ uri: item.image }}
          style={styles.productImage}
          borderRadius={14}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['#F9154B', '#FF5A93']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.discountBadge}
        >
          <Text style={styles.discountBadgeText}>{item.discount}</Text>
        </LinearGradient>
      </View>

      {/* Details */}
      <Text style={styles.productTitle} numberOfLines={2}>
        {item.title}
      </Text>
      <View style={styles.priceRow}>
        <Text style={styles.finalPrice}>${item.price.toFixed(2)}</Text>
        <View style={styles.originalPriceWrap}>
          <Text style={styles.originalPrice}>${item.originalPrice.toFixed(2)}</Text>
          <View style={styles.thickStrikeLine} />
        </View>
      </View>
    </TouchableOpacity>
  );
});

type Props = NativeStackScreenProps<RootStackParamList, 'FlashSale'>;

export default function FlashSaleScreen({ navigation, route }: Props) {
  const initialDiscount = route.params?.initialDiscount || '20%';
  const [selectedDiscount, setSelectedDiscount] = useState<string>(initialDiscount);
  const [filterVisible, setFilterVisible] = useState<boolean>(false);
  const [appliedFilters, setAppliedFilters] = useState<FilterState | null>(null);

  // Dynamic Supabase Flash Sale Products
  const [liveProducts, setLiveProducts] = useState<FlashProductItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadFlashProducts = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const data = await fetchFlashSaleProducts(0, 40);
      if (data && data.length > 0) {
        const mapped: FlashProductItem[] = data.map((prod) => {
          const origPrice = Number(prod.price) || 20.0;
          const disc = calculateDiscount(
            origPrice,
            prod.discount_price ? Number(prod.discount_price) : origPrice * 0.8
          );
          return {
            id: prod.id,
            title: prod.title,
            price: disc.finalPrice,
            originalPrice: origPrice,
            discount: disc.discountBadge || '-20%',
            discountPercent: disc.discountPercent || 20,
            image: prod.images && prod.images.length > 0
              ? prod.images[0]
              : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500',
          };
        });
        setLiveProducts(mapped);
      }
    } catch (err) {
      console.warn('Error fetching live flash products:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadFlashProducts();
  }, [loadFlashProducts]);

  // Extend screen behind status bar so top-right bubble reaches the physical top edge
  useEffect(() => {
    if (Platform.OS === 'android') {
      (StatusBar as any).setTranslucent?.(true);
      (StatusBar as any).setBackgroundColor?.('transparent', true);
    }
    return () => {
      if (Platform.OS === 'android') {
        (StatusBar as any).setTranslucent?.(false);
      }
    };
  }, []);

  // Filter products based on selected discount tab + applied filters
  const filteredProducts = useMemo(() => {
    const rawList = liveProducts.length > 0 ? liveProducts : ALL_FLASH_PRODUCTS;

    const TIERS = [20, 30, 10, 40, 50, 20, 30, 20];

    // Compute mathematically exact discount and final price for each product
    let list: FlashProductItem[] = rawList.map((p, idx) => {
      const tier = selectedDiscount === 'All'
        ? (p.discountPercent || TIERS[idx % TIERS.length])
        : parseInt(selectedDiscount.replace('%', ''), 10);

      const disc = calculateDiscountWithPercent(p.originalPrice, tier);

      return {
        ...p,
        discountPercent: tier,
        discount: `-${tier}%`,
        price: disc.finalPrice,
      };
    });

    if (appliedFilters) {
      // Filter by price range
      list = list.filter(
        (p) => p.price >= appliedFilters.minPrice && p.price <= appliedFilters.maxPrice
      );

      // Sort
      if (appliedFilters.sortBy === 'priceHighLow') {
        list = [...list].sort((a, b) => b.price - a.price);
      } else if (appliedFilters.sortBy === 'priceLowHigh') {
        list = [...list].sort((a, b) => a.price - b.price);
      } else if (appliedFilters.sortBy === 'newest') {
        list = [...list].reverse();
      }
    }

    return list;
  }, [liveProducts, selectedDiscount, appliedFilters]);

  const handleRefresh = useCallback(() => {
    loadFlashProducts(true);
  }, [loadFlashProducts]);

  const handleProductPress = useCallback(
    (item: FlashProductItem) => {
      navigation.navigate('ProductDetails', {
        productId: item.id,
        name: item.title,
        discountPercent: item.discountPercent,
        initialProduct: item,
      });
    },
    [navigation]
  );

  const handleOpenFilter = useCallback(() => {
    setFilterVisible(true);
  }, []);

  const handleCloseFilter = useCallback(() => {
    setFilterVisible(false);
  }, []);

  const handleApplyFilter = useCallback((filters: FilterState) => {
    setAppliedFilters(filters);
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      {/* Top Right Zero Bubble Graphic (Top-most edge) */}
      <Image
        source={require('@/assets/png/top-right-zero-buble.png')}
        style={styles.topRightBubble}
        resizeMode="stretch"
        pointerEvents="none"
      />

      <View style={styles.contentWrap}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#004CFF']}
              tintColor="#004CFF"
            />
          }
        >
          {/* Header Row: Title + Live Timer (No Back Button) */}
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <Text style={styles.screenTitle}>Flash Sale</Text>
              <Text style={styles.screenSubtitle}>Choose Your Discount</Text>
            </View>

            {/* Synchronized Stopwatch Timer: Timer BG White, Clock White, Font Black */}
            <View style={styles.timerWrap}>
              <FlashSaleTimer
                fontSize={21}
                textColor="#000000"
                badgeBackgroundColor="#FFFFFF"
                clockColor="#FFFFFF"
                badgeWidth={44}
                badgeHeight={34}
                clockSize={22}
              />
            </View>
          </View>

          {/* Discount Selector Bar: All, 10%, 20%, 30%, 40%, 50% */}
          <View style={styles.discountTrack}>
            {DISCOUNT_TABS.map((tab) => {
              const isActive = selectedDiscount === tab;
              return (
                <TouchableOpacity
                  key={tab}
                  activeOpacity={0.85}
                  onPress={() => setSelectedDiscount(tab)}
                  style={styles.tabTouchItem}
                >
                  {isActive ? (
                    <ActiveDiscountPill text={tab} />
                  ) : (
                    <Text style={styles.inactivePillText}>{tab}</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Discount Section Header: "20% Discount" + Filter Icon */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeading}>
              {selectedDiscount === 'All' ? 'All Discount Items' : `${selectedDiscount} Discount`}
            </Text>
            <TouchableOpacity
              style={styles.slidersBtn}
              activeOpacity={0.7}
              onPress={handleOpenFilter}
            >
              <FilterSvg width={24} height={24} />
            </TouchableOpacity>
          </View>

          {/* 2-Column Product Grid */}
          <View style={styles.productGrid}>
            {filteredProducts.map((item) => (
              <FlashSaleProductCard
                key={item.id}
                item={item}
                onPress={handleProductPress}
              />
            ))}
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>

      {/* Filter Modal (Figma Screen 34) */}
      <FilterModal
        visible={filterVisible}
        onClose={handleCloseFilter}
        onApply={handleApplyFilter}
        initialFilters={appliedFilters || undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  topRightBubble: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 410,
    height: 285,
    zIndex: 0,
  },
  contentWrap: {
    flex: 1,
    zIndex: 1,
    paddingTop: Platform.OS === 'ios' ? 52 : (StatusBar.currentHeight ?? 24) + 14,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  // Header
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
    paddingRight: 8,
  },
  screenTitle: {
    fontFamily: fonts.raleway.bold,
    fontSize: 28,
    lineHeight: 32,
    color: '#202020',
  },
  screenSubtitle: {
    fontFamily: fonts.raleway.medium,
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  timerWrap: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 2,
  },
  // Discount Track (Pill track with 60x40 active pill)
  discountTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9F9F9',
    borderRadius: 24,
    height: 48,
    paddingHorizontal: 4,
    marginVertical: 14,
  },
  tabTouchItem: {
    flex: 1,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inactivePillText: {
    fontFamily: fonts.raleway.bold,
    fontSize: 14,
    color: '#000000',
  },
  activePillWrap: {
    width: 60,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 4,
  },
  activePillTextOverlay: {
    position: 'absolute',
    top: 6,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activePillText: {
    fontFamily: fonts.raleway.bold,
    fontSize: 17,
    color: '#004CFF',
    lineHeight: 22,
    includeFontPadding: false,
  },
  // Live Card
  liveCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingTop: 12,
    paddingBottom: 8,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 20,
  },
  liveCardHeading: {
    fontFamily: fonts.raleway.bold,
    fontSize: 11,
    color: '#181C1F',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 8,
  },
  liveGrid: {
    flexDirection: 'row',
    borderRadius: 12,
    overflow: 'hidden',
    height: 120,
    position: 'relative',
  },
  liveModelImg: {
    flex: 1,
    height: '100%',
  },
  livePlayBtn: {
    position: 'absolute',
    alignSelf: 'center',
    left: '46%',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  liveBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: '#08C514',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  liveBadgeText: {
    fontFamily: fonts.raleway.semiBold,
    fontSize: 14,
    color: '#FFFFFF',
  },
  // Section Header Row
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionHeading: {
    fontFamily: fonts.raleway.bold,
    fontSize: 21,
    color: '#202020',
  },
  slidersBtn: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Products Grid
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 16,
  },
  productCard: {
    marginBottom: 4,
  },
  imageWrap: {
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderTopRightRadius: 14,
    borderBottomLeftRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  discountBadgeText: {
    fontFamily: fonts.nunito.bold,
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  productTitle: {
    fontFamily: fonts.nunito.regular,
    fontSize: 12,
    lineHeight: 16,
    color: '#202020',
    marginTop: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  finalPrice: {
    fontFamily: fonts.raleway.bold,
    fontSize: 16,
    lineHeight: 20,
    color: '#181C1F',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  originalPriceWrap: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  originalPrice: {
    fontFamily: fonts.raleway.bold,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.14,
    color: '#F1AEAE',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  thickStrikeLine: {
    position: 'absolute',
    left: -1,
    right: -1,
    height: 2.2,
    backgroundColor: '#F1AEAE',
    borderRadius: 1,
  },
});
