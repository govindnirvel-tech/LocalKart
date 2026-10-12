import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  FlatList,
  TextInput,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  useWindowDimensions,
  Platform,
  type ListRenderItemInfo,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Path, Circle } from 'react-native-svg';

import { RootStackParamList } from '@/navigation/types';
import { fonts } from '@/theme/fonts';
import ShimmerPlaceholder from '@/components/ShimmerPlaceholder';
import { fetchHomeFeed } from '@/services/homeService';
import type { Product, Banner, Category } from '@/types/database';
import FlashSaleTimer from '@/features/home/components/FlashSaleTimer';
import {
  CategoryCard,
  ProductCard,
  PopularProductCard,
  FlashSaleCard,
  TopProductCircle,
  JustForYouCard,
  HeroBannerCarousel,
  type CategoryCardData,
  type FlashSaleItemData,
  type TopProductItemData,
  JustForYouProductData,
} from '@/features/home/components';
import { calculateDiscount } from '@/utils/discount';
import { resolveSafeImageUri } from '@/utils/imageResolver';

type HomeNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type JustForYouItem = Product | JustForYouProductData;

// Right arrow icon for "See All"
const ArrowRightIcon = ({ size = 16, color = '#FFFFFF' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M5 12h14M12 5l7 7-7 7"
      stroke={color}
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Search icon
const SearchIcon = ({ size = 18, color = '#8A8A8E' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Camera search icon
const CameraSearchIcon = ({ size = 18, color = '#004CFF' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="12" cy="13" r="3.5" stroke={color} strokeWidth={1.8} />
  </Svg>
);

// Blue Star icon for Just For You section
const BlueStarIcon = ({ size = 16, color = '#004CFF' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </Svg>
);

// 6 Categories matching Figma 15 Shop (Clothing, Shoes, Bags, Lingerie, Watch, Hoodies)
const SIX_CATEGORIES: CategoryCardData[] = [
  {
    id: 'clothing',
    name: 'Clothing',
    count: '109',
    images: [
      'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=300',
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=300',
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=300',
      'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=300',
    ],
  },
  {
    id: 'shoes',
    name: 'Shoes',
    count: '530',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300',
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300',
      'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=300',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=300',
    ],
  },
  {
    id: 'bags',
    name: 'Bags',
    count: '87',
    images: [
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=300',
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=300',
      'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=300',
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=300',
    ],
  },
  {
    id: 'lingerie',
    name: 'Lingerie',
    count: '218',
    images: [
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300',
      'https://images.unsplash.com/photo-1608248597359-258055a40b90?w=300',
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=300',
      'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=300',
    ],
  },
  {
    id: 'watch',
    name: 'Watch',
    count: '218',
    images: [
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300',
      'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=300',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300',
      'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=300',
    ],
  },
  {
    id: 'hoodies',
    name: 'Hoodies',
    count: '218',
    images: [
      'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=300',
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=300',
      'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=300',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300',
    ],
  },
];

// Flash Sale items matching Figma (W 99, H 103 with -20% red badge)
const DEFAULT_FLASH_SALE_ITEMS: FlashSaleItemData[] = [
  { id: '1', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300', discount: '-20%' },
  { id: '2', image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300', discount: '-20%' },
  { id: '3', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300', discount: '-20%' },
  { id: '4', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300', discount: '-20%' },
  { id: '5', image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300', discount: '-20%' },
  { id: '6', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300', discount: '-20%' },
];

// Top Products items matching Figma floating pills (W 60, H 69 pill with 50x50 round image)
const DEFAULT_TOP_PRODUCTS: TopProductItemData[] = [
  { id: '1', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=200', title: 'Handbag' },
  { id: '2', image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=200', title: 'Watch' },
  { id: '3', image: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=200', title: 'Hoodie' },
  { id: '4', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200', title: 'Sneakers' },
  { id: '5', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=200', title: 'Top' },
];

// Just For You default products matching Figma (W 155, H 171 image, 2-line title, $17,00 price)
const DEFAULT_JUST_FOR_YOU: JustForYouProductData[] = [
  {
    id: 'jfy-1',
    title: 'Lorem ipsum dolor sit amet consectetur',
    price: 17.00,
    images: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500'],
  },
  {
    id: 'jfy-2',
    title: 'Lorem ipsum dolor sit amet consectetur',
    price: 17.00,
    images: ['https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500'],
  },
  {
    id: 'jfy-3',
    title: 'Lorem ipsum dolor sit amet consectetur',
    price: 17.00,
    images: ['https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500'],
  },
  {
    id: 'jfy-4',
    title: 'Lorem ipsum dolor sit amet consectetur',
    price: 17.00,
    images: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500'],
  },
];

/**
 * Shop title + search bar.
 * searchQuery state lives HERE (not in HomeScreen), so typing re-renders only
 * this small component and never the whole list/header.
 */
const SearchHeader = memo(function SearchHeader() {
  const navigation = useNavigation<HomeNavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = useCallback(() => {
    const query = searchQuery.trim();
    if (query.length > 0) {
      navigation.navigate('CategoryProducts', {
        categoryId: 'search',
        categoryName: query,
      });
    }
  }, [navigation, searchQuery]);

  return (
    <View style={styles.header}>
      <Text style={styles.shopTitle}>Shop</Text>
      <View style={styles.searchBar}>
        <TouchableOpacity activeOpacity={0.7} onPress={handleSearch}>
          <SearchIcon size={18} color="#9CA3AF" />
        </TouchableOpacity>
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity activeOpacity={0.7} style={styles.cameraBtn} onPress={handleSearch}>
          <CameraSearchIcon size={20} color="#004CFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
});

const keyExtractor = (item: { id: string }) => item.id;

export default function HomeScreen() {
  const navigation = useNavigation<HomeNavigationProp>();

  // Supabase Real Data States
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [flashSaleProducts, setFlashSaleProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Load feed from Supabase
  const loadHomeData = useCallback(async (isPullToRefresh = false) => {
    try {
      if (isPullToRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const data = await fetchHomeFeed();
      if (data.newArrivals && data.newArrivals.length > 0) setNewArrivals(data.newArrivals);
      if (data.popularProducts && data.popularProducts.length > 0) setPopularProducts(data.popularProducts);
      if (data.flashSaleProducts && data.flashSaleProducts.length > 0) setFlashSaleProducts(data.flashSaleProducts);
      if (data.banners && data.banners.length > 0) setBanners(data.banners);
      if (data.categories && data.categories.length > 0) setCategories(data.categories);
    } catch (error) {
      console.warn('Failed to load home feed from Supabase:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadHomeData();
  }, [loadHomeData]);

  const handleRefresh = useCallback(() => {
    loadHomeData(true);
  }, [loadHomeData]);

  // Responsive calculations
  const { width: windowWidth } = useWindowDimensions();
  const numCategoryColumns = windowWidth >= 900 ? 4 : windowWidth >= 600 ? 3 : 2;
  const horizontalPadding = 40; // 20 padding each side
  const categoryGap = 12;
  const categoryCardWidth = Math.floor(
    (windowWidth - horizontalPadding - (categoryGap * (numCategoryColumns - 1))) / numCategoryColumns
  );

  // Flash Sale Dimensions (3 columns, W: ~99-105, H: 103)
  const flashSaleCardWidth = Math.floor((windowWidth - 40 - (10 * 2)) / 3);
  const flashSaleCardHeight = 103;

  // Just For You Responsive Dimensions
  const numJustForYouColumns = windowWidth >= 900 ? 4 : windowWidth >= 600 ? 3 : 2;
  const justForYouHorizontalPadding = 40;
  const justForYouGap = 14;
  const justForYouCardWidth = Math.floor(
    (windowWidth - justForYouHorizontalPadding - (justForYouGap * (numJustForYouColumns - 1))) / numJustForYouColumns
  );
  const justForYouImageHeight = Math.round(justForYouCardWidth * (171 / 155));

  // Dynamic Categories: 6 categories matching Figma 15 Shop
  const displayCategories: CategoryCardData[] = useMemo(() => {
    if (categories && categories.length > 0) {
      return categories.slice(0, 6).map((cat, idx) => ({
        id: cat.id,
        name: cat.name,
        count: (cat as any).count ?? (idx === 0 ? '109' : idx === 1 ? '530' : idx === 2 ? '87' : '218'),
        images: SIX_CATEGORIES[idx % SIX_CATEGORIES.length]?.images || [],
      }));
    }
    return SIX_CATEGORIES;
  }, [categories]);

  // Dynamic Top Products pills from live categories/products
  const displayTopProducts: TopProductItemData[] = useMemo(() => {
    if (categories && categories.length > 0) {
      return categories.slice(0, 10).map((cat) => ({
        id: cat.id,
        image: resolveSafeImageUri(cat.image_url || cat.icon_url, cat.name),
        title: cat.name,
      }));
    }
    return DEFAULT_TOP_PRODUCTS;
  }, [categories]);

  // Flash Sale items from Supabase or Figma defaults
  const displayFlashSaleItems: FlashSaleItemData[] = useMemo(() => {
    if (flashSaleProducts && flashSaleProducts.length > 0) {
      return flashSaleProducts.slice(0, 6).map((prod) => {
        const origPrice = Number(prod.price) || 20;
        const disc = calculateDiscount(
          origPrice,
          prod.discount_price ? Number(prod.discount_price) : origPrice * 0.8
        );
        return {
          id: prod.id,
          image: prod.images && prod.images.length > 0 ? prod.images[0] : DEFAULT_FLASH_SALE_ITEMS[0].image,
          discount: disc.discountBadge || '-20%',
          product: prod,
        };
      });
    }
    return DEFAULT_FLASH_SALE_ITEMS;
  }, [flashSaleProducts]);

  // Just For You items (outer FlatList data)
  const displayJustForYouProducts: JustForYouItem[] = useMemo(() => {
    if (popularProducts && popularProducts.length >= 2) {
      return popularProducts.slice(0, 4);
    }
    return DEFAULT_JUST_FOR_YOU;
  }, [popularProducts]);

  // ---------- Stable callbacks ----------
  const handleProductPress = useCallback(
    (p: Product) => {
      navigation.navigate('ProductDetails', {
        productId: p.id,
        name: p.title,
        initialProduct: p,
      });
    },
    [navigation]
  );

  const handleCategoryPress = useCallback(
    (cat: CategoryCardData) => {
      navigation.navigate('CategoryProducts', {
        categoryId: cat.id,
        categoryName: cat.name,
      });
    },
    [navigation]
  );

  const handleTopProductPress = useCallback(
    (topItem: TopProductItemData) => {
      navigation.navigate('CategoryProducts', {
        categoryId: topItem.id,
        categoryName: topItem.title || 'Products',
      });
    },
    [navigation]
  );

  const handleFlashSaleCardPress = useCallback(() => {
    navigation.navigate('FlashSale', { initialDiscount: '20%' });
  }, [navigation]);

  const handleJustForYouPress = useCallback(
    (item: JustForYouItem) => {
      navigation.navigate('ProductDetails', {
        productId: item.id,
        name: item.title,
        initialProduct: item,
      });
    },
    [navigation]
  );

  const handleSeeAllCategories = useCallback(() => {
    navigation.navigate('AllCategories');
  }, [navigation]);

  const handleSeeAllNewItems = useCallback(() => {
    navigation.navigate('CategoryProducts', {
      categoryId: 'new',
      categoryName: 'New Items',
    });
  }, [navigation]);

  const handleSeeAllFlashSale = useCallback(() => {
    navigation.navigate('FlashSale');
  }, [navigation]);

  const handleSeeAllPopular = useCallback(() => {
    navigation.navigate('CategoryProducts', {
      categoryId: 'popular',
      categoryName: 'Most Popular',
    });
  }, [navigation]);

  // ---------- renderItem functions ----------
  const renderProductItem = useCallback(
    ({ item }: ListRenderItemInfo<Product>) => (
      <ProductCard product={item} onPress={handleProductPress} />
    ),
    [handleProductPress]
  );

  const renderPopularItem = useCallback(
    ({ item }: ListRenderItemInfo<Product>) => (
      <PopularProductCard product={item} onPress={handleProductPress} />
    ),
    [handleProductPress]
  );

  const renderJustForYouItem = useCallback(
    ({ item }: ListRenderItemInfo<JustForYouItem>) => (
      <JustForYouCard
        product={item}
        cardWidth={justForYouCardWidth}
        imageHeight={justForYouImageHeight}
        onPress={handleJustForYouPress}
      />
    ),
    [justForYouCardWidth, justForYouImageHeight, handleJustForYouPress]
  );

  // ---------- Header: everything ABOVE "Just For You" cards ----------
  const listHeader = useMemo(
    () => (
      <>
        {/* 1. Top Header: "Shop" + Search Bar with Camera (own state, isolated) */}
        <SearchHeader />

        {/* 2. Hero Banner Carousel */}
        <HeroBannerCarousel banners={banners} />

        {/* 3. Categories */}
        <View style={styles.sectionHeaderWithLink}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <TouchableOpacity
            style={styles.seeAllRow}
            activeOpacity={0.7}
            onPress={handleSeeAllCategories}
          >
            <Text style={styles.seeAllText}>See All</Text>
            <View style={styles.seeAllCircle}>
              <ArrowRightIcon size={12} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.categoriesGridContainer}>
          {displayCategories.map((item) => (
            <CategoryCard
              key={item.id}
              category={item}
              cardWidth={categoryCardWidth}
              onPress={handleCategoryPress}
            />
          ))}
        </View>

        {/* 4. Top Products (max 10 items, horizontal ScrollView is fine) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top Products</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.topProductsListContent}
        >
          {displayTopProducts.map((item) => (
            <TopProductCircle key={item.id} item={item} onPress={handleTopProductPress} />
          ))}
        </ScrollView>

        {/* 5. New Items (horizontal FlatList) */}
        <View style={styles.sectionHeaderWithLink}>
          <Text style={styles.sectionTitle}>New Items</Text>
          <TouchableOpacity
            style={styles.seeAllRow}
            activeOpacity={0.7}
            onPress={handleSeeAllNewItems}
          >
            <Text style={styles.seeAllText}>See All</Text>
            <View style={styles.seeAllCircle}>
              <ArrowRightIcon size={12} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        </View>
        {loading && newArrivals.length === 0 ? (
          <View style={[styles.horizontalListContent, { flexDirection: 'row' }]}>
            {[1, 2, 3].map((k) => (
              <View key={k} style={styles.productCardPlaceholder}>
                <ShimmerPlaceholder width={140} height={160} borderRadius={12} />
                <View style={{ marginTop: 8 }}>
                  <ShimmerPlaceholder width={110} height={14} borderRadius={4} />
                  <View style={{ height: 6 }} />
                  <ShimmerPlaceholder width={60} height={16} borderRadius={4} />
                </View>
              </View>
            ))}
          </View>
        ) : (
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={newArrivals}
            renderItem={renderProductItem}
            keyExtractor={keyExtractor}
            contentContainerStyle={styles.horizontalListContent}
            removeClippedSubviews={Platform.OS === 'android'}
            maxToRenderPerBatch={10}
            windowSize={7}
            initialNumToRender={12}
            updateCellsBatchingPeriod={50}
          />
        )}

        {/* 6. Flash Sale */}
        <View style={styles.sectionHeaderWithLink}>
          <TouchableOpacity
            style={styles.seeAllRow}
            activeOpacity={0.7}
            onPress={handleSeeAllFlashSale}
          >
            <Text style={styles.sectionTitle}>Flash Sale</Text>
            <View style={styles.seeAllCircle}>
              <ArrowRightIcon size={12} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.8} onPress={handleSeeAllFlashSale}>
            <FlashSaleTimer />
          </TouchableOpacity>
        </View>
        <View style={styles.flashSaleGridContainer}>
          {displayFlashSaleItems.map((item) => (
            <FlashSaleCard
              key={item.id}
              item={item}
              cardWidth={flashSaleCardWidth}
              cardHeight={flashSaleCardHeight}
              onPress={handleFlashSaleCardPress}
            />
          ))}
        </View>

        {/* 7. Most Popular (horizontal FlatList) */}
        <View style={styles.sectionHeaderWithLink}>
          <Text style={styles.sectionTitle}>Most Popular</Text>
          <TouchableOpacity
            style={styles.seeAllRow}
            activeOpacity={0.7}
            onPress={handleSeeAllPopular}
          >
            <Text style={styles.seeAllText}>See All</Text>
            <View style={styles.seeAllCircle}>
              <ArrowRightIcon size={12} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        </View>
        {loading && popularProducts.length === 0 ? (
          <View style={[styles.horizontalListContent, { flexDirection: 'row' }]}>
            {[1, 2, 3, 4].map((k) => (
              <View key={k} style={styles.popularCardPlaceholder}>
                <ShimmerPlaceholder width={104} height={140} borderRadius={9} />
              </View>
            ))}
          </View>
        ) : (
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={popularProducts}
            removeClippedSubviews={Platform.OS === 'android'}
            maxToRenderPerBatch={10}
            windowSize={7}
            initialNumToRender={12}
            updateCellsBatchingPeriod={50}
            renderItem={renderPopularItem}
            keyExtractor={keyExtractor}
            contentContainerStyle={styles.horizontalListContent}
          />
        )}

        {/* 8. Just For You section header (the cards are the outer FlatList items) */}
        <View style={styles.sectionHeader}>
          <View style={styles.justForYouTitleRow}>
            <Text style={styles.sectionTitle}>Just For You</Text>
            <BlueStarIcon size={16} color="#004CFF" />
          </View>
        </View>
        <View style={styles.justForYouTopGap} />
      </>
    ),
    [
      banners,
      handleSeeAllCategories,
      displayCategories,
      categoryCardWidth,
      handleCategoryPress,
      displayTopProducts,
      handleTopProductPress,
      handleSeeAllNewItems,
      loading,
      newArrivals,
      renderProductItem,
      keyExtractor,
      handleSeeAllFlashSale,
      displayFlashSaleItems,
      flashSaleCardWidth,
      flashSaleCardHeight,
      handleFlashSaleCardPress,
      handleSeeAllPopular,
      popularProducts,
      renderPopularItem,
    ]
  );

  const renderListFooter = useCallback(() => <View style={styles.bottomSpacer} />, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      <FlatList
        // key forces a clean remount if the column count changes
        // (tablet / split-screen). RN throws if numColumns changes on the fly.
        key={`jfy-grid-${numJustForYouColumns}`}
        data={displayJustForYouProducts}
        renderItem={renderJustForYouItem}
        keyExtractor={keyExtractor}
        numColumns={numJustForYouColumns}
        columnWrapperStyle={styles.justForYouRow}
        ListHeaderComponent={listHeader}
        ListFooterComponent={renderListFooter}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        initialNumToRender={6}
        maxToRenderPerBatch={8}
        windowSize={5}
        removeClippedSubviews={Platform.OS === 'android'}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#004CFF']}
            tintColor="#004CFF"
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  // Original spacer was 30. The last grid row now has marginBottom 14 (see
  // justForYouRow), so 16 + 14 = same 30 as before.
  bottomSpacer: {
    height: 16,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  // 1. Header (Shop Title + Search Bar)
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 14,
    gap: 12,
  },
  shopTitle: {
    fontFamily: fonts.raleway.bold,
    fontSize: 28,
    color: '#000000',
    letterSpacing: -0.5,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 22,
    height: 44,
    paddingHorizontal: 14,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.nunito.regular,
    fontSize: 15,
    color: '#181C1F',
    paddingHorizontal: 8,
    paddingVertical: 0,
  },
  cameraBtn: {
    padding: 4,
  },
  // 2. Hero Banner (Big Sale)
  heroBannerWrap: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  heroBannerCard: {
    borderRadius: 20,
    height: 148,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 22,
    overflow: 'hidden',
    shadowColor: '#FB8500',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  bannerTextCol: {
    flex: 1,
    justifyContent: 'center',
  },
  bannerBadge: {
    fontFamily: fonts.nunito.semiBold,
    fontSize: 11,
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    opacity: 0.9,
    marginBottom: 2,
  },
  bannerTitle: {
    fontFamily: fonts.raleway.bold,
    fontSize: 28,
    lineHeight: 32,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  bannerSubtitle: {
    fontFamily: fonts.nunito.bold,
    fontSize: 15,
    color: '#FFFFFF',
    opacity: 0.95,
    marginTop: 2,
  },
  bannerImage: {
    width: 145,
    height: 148,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  dotActive: {
    width: 20,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#004CFF',
  },
  dotInactive: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D1D5DB',
  },
  // Section Headers
  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 10,
  },
  sectionHeaderWithLink: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontFamily: fonts.raleway.bold,
    fontSize: 20,
    lineHeight: 24,
    color: '#000000',
  },
  seeAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  seeAllText: {
    fontFamily: fonts.raleway.semiBold,
    fontSize: 14,
    color: '#004CFF',
  },
  seeAllCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#004CFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Categories (6 Items)
  categoriesGridContainer: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 14,
  },
  // Top Products
  topProductsListContent: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  // New Items & Most Popular
  horizontalListContent: {
    paddingHorizontal: 20,
    paddingVertical: 6,
    gap: 12,
  },
  productCardPlaceholder: {
    width: 140,
    height: 204,
    marginRight: 10,
  },
  popularCardPlaceholder: {
    width: 104,
    height: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 9,
    marginRight: 10,
  },
  // Flash Sale
  flashSaleGridContainer: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
    marginTop: 4,
    marginBottom: 8,
  },
  // Just For You
  justForYouTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  // replaces old justForYouGridContainer marginTop: 4
  justForYouTopGap: {
    height: 4,
  },
  // columnWrapperStyle: same padding / space-between / row gap as the old grid
  justForYouRow: {
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    marginBottom: 14,
  },
});
