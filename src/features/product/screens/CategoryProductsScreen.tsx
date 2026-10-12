import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Dimensions,
  Platform,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Svg, { Path } from 'react-native-svg';
import LinearGradient from 'react-native-linear-gradient';

import { RootStackParamList } from '@/navigation/types';
import {
  fetchProductsByCategory,
  searchProducts,
  fetchNewArrivals,
  fetchPopularProducts,
  ProductFilterOptions,
} from '@/services/homeService';
import type { Product } from '@/types/database';
import AppImage from '@/components/AppImage';
import ToastNotification from '@/components/ToastNotification';
import { fonts } from '@/theme/fonts';
import { calculateDiscount } from '@/utils/discount';

const { width: windowWidth } = Dimensions.get('window');
const HORIZONTAL_PADDING = 16;
const CARD_GAP = 12;
const CARD_WIDTH = Math.floor((windowWidth - (HORIZONTAL_PADDING * 2) - CARD_GAP) / 2);
const IMAGE_HEIGHT = Math.round(CARD_WIDTH * 1.15);

// Icons
const BackIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M15 18l-6-6 6-6"
      stroke="#181C1F"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const HeartIcon = ({ filled = false }: { filled?: boolean }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill={filled ? '#FF2E63' : 'none'}>
    <Path
      d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
      stroke={filled ? '#FF2E63' : '#6B7280'}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const PlusIcon = () => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 5v14M5 12h14"
      stroke="#FFFFFF"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const StoreIcon = () => (
  <Svg width={11} height={11} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"
      stroke="#8E95A5"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

type FilterType = 'all' | 'popular' | 'sale' | 'lowToHigh' | 'highToLow' | 'rating';

const FILTERS: { id: FilterType; label: string; sortBy?: ProductFilterOptions['sortBy'] }[] = [
  { id: 'all', label: 'All Items', sortBy: 'new' },
  { id: 'popular', label: '🔥 Popular', sortBy: 'popular' },
  { id: 'sale', label: '🏷️ On Sale', sortBy: 'new' },
  { id: 'rating', label: '⭐ Top Rated', sortBy: 'rating' },
  { id: 'lowToHigh', label: 'Price: Low ↑', sortBy: 'priceAsc' },
  { id: 'highToLow', label: 'Price: High ↓', sortBy: 'priceDesc' },
];

type Props = NativeStackScreenProps<RootStackParamList, 'CategoryProducts'>;

export default function CategoryProductsScreen({ route, navigation }: Props) {
  const { categoryId, categoryName } = route.params;

  const isSearchMode = categoryId === 'search';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [page, setPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});
  const [toastItem, setToastItem] = useState<{ title: string; image?: string } | null>(null);

  const PAGE_SIZE = 20;

  // Load products with pagination & filters
  const loadData = useCallback(
    async (pageNum = 0, isRefresh = false) => {
      try {
        if (pageNum === 0) {
          if (isRefresh) setRefreshing(true);
          else setLoading(true);
        } else {
          setLoadingMore(true);
        }

        let newItems: Product[] = [];

        if (isSearchMode) {
          newItems = await searchProducts(categoryName, pageNum, PAGE_SIZE);
        } else if (categoryId === 'new') {
          newItems = await fetchNewArrivals(pageNum, PAGE_SIZE);
        } else if (categoryId === 'popular') {
          newItems = await fetchPopularProducts(pageNum, PAGE_SIZE);
        } else {
          const currentFilter = FILTERS.find((f) => f.id === activeFilter);
          const filterOpts: ProductFilterOptions = {
            page: pageNum,
            limit: PAGE_SIZE,
            sortBy: currentFilter?.sortBy ?? 'new',
            onlySale: activeFilter === 'sale',
          };
          newItems = await fetchProductsByCategory(categoryId, filterOpts);
        }

        if (pageNum === 0) {
          setProducts(newItems);
        } else {
          setProducts((prev) => [...prev, ...newItems]);
        }

        setHasMore(newItems.length >= PAGE_SIZE);
        setPage(pageNum);
      } catch (err) {
        console.warn('Failed to load category products:', err);
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [categoryId, categoryName, isSearchMode, activeFilter]
  );

  // Initial load or on filter change
  useEffect(() => {
    loadData(0, false);
  }, [loadData]);

  // Load next page on end reached
  const handleLoadMore = () => {
    if (!loading && !loadingMore && hasMore) {
      loadData(page + 1, false);
    }
  };

  const toggleWishlist = useCallback((id: string) => {
    setWishlist((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const handleProductPress = useCallback(
    (item: Product, discountPercent?: number) => {
      navigation.navigate('ProductDetails', {
        productId: item.id,
        name: item.title,
        discountPercent,
        initialProduct: item,
      });
    },
    [navigation]
  );

  const keyExtractor = useCallback((item: Product) => item.id, []);

  const filterKeyExtractor = useCallback((item: { id: string }) => item.id, []);

  const handleFilterPress = useCallback((id: FilterType) => {
    setActiveFilter(id);
  }, []);

  const renderFilterItem = useCallback(
    ({ item }: { item: { id: FilterType; label: string } }) => {
      const isActive = activeFilter === item.id;
      return (
        <TouchableOpacity
          style={[styles.filterChip, isActive && styles.filterChipActive]}
          activeOpacity={0.8}
          onPress={() => handleFilterPress(item.id)}
        >
          <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
            {item.label}
          </Text>
        </TouchableOpacity>
      );
    },
    [activeFilter, handleFilterPress]
  );

  const handleRefresh = useCallback(() => {
    loadData(0, true);
  }, [loadData]);

  const renderProductItem = useCallback(
    ({ item }: { item: Product }) => {
      const isLiked = !!wishlist[item.id];
      const imageUri = item.images && item.images.length > 0 ? item.images[0] : undefined;
      const disc = calculateDiscount(item.price, item.discount_price);
      const hasDiscount = disc.hasDiscount;
      const discountPercent = disc.discountPercent;
      const finalPrice = disc.finalPrice;

      const vendorName = (item as any).vendor?.store_name || 'Indore Boutique';

      return (
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.9}
          onPress={() => handleProductPress(item, discountPercent ?? undefined)}
        >
        {/* Image Box */}
        <View style={styles.imageContainer}>
          <AppImage
            source={imageUri ? { uri: imageUri } : require('@/assets/png/onboarding_girl_1.png')}
            style={styles.productImage}
            borderRadius={14}
            resizeMode="cover"
          />

          {/* Discount Badge */}
          {hasDiscount && discountPercent != null && (
            <LinearGradient
              colors={['#FF3B30', '#FF2D55']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.discountBadge}
            >
              <Text style={styles.discountBadgeText}>-{discountPercent}%</Text>
            </LinearGradient>
          )}

          {/* Tag Badge (New / Hot / Sale) */}
          {item.tag && !hasDiscount && (
            <View style={[styles.tagBadge, { backgroundColor: item.tag_color || '#004CFF' }]}>
              <Text style={styles.tagBadgeText}>{item.tag}</Text>
            </View>
          )}

          {/* Wishlist Button */}
          <TouchableOpacity
            style={styles.wishlistBtn}
            activeOpacity={0.8}
            onPress={() => toggleWishlist(item.id)}
          >
            <HeartIcon filled={isLiked} />
          </TouchableOpacity>
        </View>

        {/* Vendor & Rating Info */}
        <View style={styles.vendorRow}>
          <StoreIcon />
          <Text style={styles.vendorName} numberOfLines={1}>
            {vendorName}
          </Text>
          <Text style={styles.ratingText}>★ {item.rating?.toFixed(1) ?? '4.5'}</Text>
        </View>

        {/* Title */}
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>

        {/* Price & Add Row */}
        <View style={styles.priceRow}>
          <View style={styles.priceCol}>
            <Text style={styles.currentPrice}>
              ${finalPrice.toFixed(2)}
            </Text>
            {hasDiscount && (
              <View style={styles.originalPriceWrap}>
                <Text style={styles.originalPrice}>${disc.originalPrice.toFixed(2)}</Text>
                <View style={styles.thickStrikeLine} />
              </View>
            )}
          </View>

          <TouchableOpacity
            style={styles.addBtn}
            activeOpacity={0.8}
            onPress={() => {
              setToastItem({
                title: item.title,
                image: imageUri,
              });
            }}
          >
            <PlusIcon />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  }, [wishlist, navigation]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
        >
          <BackIcon />
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {isSearchMode ? `Search: "${categoryName}"` : categoryName}
          </Text>
          <Text style={styles.headerSub}>
            {products.length > 0 ? `${products.length}+ Items` : 'Catalog'}
          </Text>
        </View>

        <View style={{ width: 36 }} />
      </View>

      {/* Filter Horizontal Chips */}
      <View style={styles.filterBar}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTERS}
          keyExtractor={filterKeyExtractor}
          contentContainerStyle={styles.filterList}
          renderItem={renderFilterItem}
        />
      </View>

      {/* Product List */}
      {loading ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color="#004CFF" />
          <Text style={styles.loadingText}>Fetching products...</Text>
        </View>
      ) : products.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🛍️</Text>
          <Text style={styles.emptyTitle}>No Products Found</Text>
          <Text style={styles.emptySubtitle}>
            Try changing the filter or search with different keywords.
          </Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={keyExtractor}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
          renderItem={renderProductItem}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          removeClippedSubviews={Platform.OS === 'android'}
          maxToRenderPerBatch={10}
          windowSize={7}
          initialNumToRender={12}
          updateCellsBatchingPeriod={50}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#004CFF']}
              tintColor="#004CFF"
            />
          }
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color="#004CFF" />
              </View>
            ) : undefined
          }
        />
      )}

      {/* Quick Add Toast */}
      {toastItem && (
        <ToastNotification
          visible={!!toastItem}
          title="Added to Cart! 🛒"
          message={toastItem.title}
          image={toastItem.image}
          actionText="View Cart"
          onActionPress={() => {
            setToastItem(null);
            navigation.navigate('Tabs', { screen: 'Cart' });
          }}
          onDismiss={() => setToastItem(null)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleWrap: {
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    fontFamily: fonts.raleway.bold,
    fontSize: 17,
    color: '#181C1F',
    textAlign: 'center',
  },
  headerSub: {
    fontFamily: fonts.nunito.regular,
    fontSize: 12,
    color: '#8E95A5',
    marginTop: 2,
  },
  // Filter Bar
  filterBar: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  filterList: {
    paddingHorizontal: HORIZONTAL_PADDING,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  filterChipActive: {
    backgroundColor: '#004CFF',
  },
  filterText: {
    fontFamily: fonts.nunito.bold,
    fontSize: 13,
    color: '#4B5563',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  // Grid
  listContent: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: 16,
    paddingBottom: 40,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  imageContainer: {
    width: '100%',
    height: IMAGE_HEIGHT,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F3F4F6',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  discountBadgeText: {
    fontFamily: fonts.nunito.bold,
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  tagBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagBadgeText: {
    fontFamily: fonts.nunito.bold,
    fontSize: 11,
    color: '#FFFFFF',
  },
  wishlistBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  vendorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  vendorName: {
    fontFamily: fonts.nunito.regular,
    fontSize: 11,
    color: '#8E95A5',
    flex: 1,
  },
  ratingText: {
    fontFamily: fonts.nunito.bold,
    fontSize: 11,
    color: '#FFA800',
  },
  title: {
    fontFamily: fonts.nunito.bold,
    fontSize: 13,
    lineHeight: 18,
    color: '#181C1F',
    marginTop: 4,
    height: 36,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  priceCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  currentPrice: {
    fontFamily: fonts.raleway.bold,
    fontSize: 15,
    lineHeight: 18,
    color: '#000000',
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
    fontSize: 12,
    lineHeight: 18,
    color: '#F1AEAE',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  thickStrikeLine: {
    position: 'absolute',
    left: -1,
    right: -1,
    height: 2,
    backgroundColor: '#F1AEAE',
    borderRadius: 1,
  },
  addBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#004CFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Loading & Empty
  centerLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontFamily: fonts.nunito.regular,
    fontSize: 14,
    color: '#8E95A5',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontFamily: fonts.raleway.bold,
    fontSize: 18,
    color: '#181C1F',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontFamily: fonts.nunito.regular,
    fontSize: 14,
    color: '#8E95A5',
    textAlign: 'center',
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: 'center',
  },
});
