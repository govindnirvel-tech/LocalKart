import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  FlatList,
  Image,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { RootStackParamList } from '@/navigation/types';
import { fonts } from '@/theme/fonts';
import Svg, { Path } from 'react-native-svg';
import { useAuth } from '@/features/auth/hooks/useAuth';
import EditProfileModal from '@/features/profile/components/EditProfileModal';
import { getCachedAvatar, getCachedName } from '@/utils/userAvatarStorage';
import AppImage from '@/components/AppImage';
import ShimmerPlaceholder from '@/components/ShimmerPlaceholder';
import { fetchHomeFeed } from '@/services/homeService';
import { setAppMode, startOnboarding } from '@/vendor/store/vendorOnboardingSlice';
import { StorefrontIcon } from '@/vendor/components/common/Icons';
import type { Story, Product, Banner, Category } from '@/types/database';
import {
  ActiveDot,
  CategoryCard,
  ProductCard,
  PopularProductCard,
  StoryCard,
  type CategoryCardData,
} from '@/features/home/components';

// Right arrow icon for "See All" & announcement action
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

export default function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const dispatch = useDispatch();
  const { approvalStatus } = useSelector(
    (state: RootState) => state.vendorOnboarding
  );
  const [selectedOrderTab, setSelectedOrderTab] = useState<'To Pay' | 'To Recieve' | 'To Review'>('To Recieve');
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [cachedAvatar, setCachedAvatar] = useState<string | null>(null);
  const [cachedName, setCachedName] = useState<string | null>(null);
  const { user, profile, signOut, isLoading } = useAuth();

  const isVendor =
    (user?.user_metadata?.role as string) === 'vendor' ||
    approvalStatus !== 'NOT_STARTED';

  const handleSwitchToSeller = () => {
    if (isVendor) {
      dispatch(setAppMode('vendor'));
    } else {
      dispatch(startOnboarding());
    }
  };

  // Supabase Data States
  const [stories, setStories] = useState<Story[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Load feed from Supabase
  const loadFeedData = useCallback(async (isPullToRefresh = false) => {
    try {
      if (isPullToRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const data = await fetchHomeFeed();
      if (data.stories && data.stories.length > 0) setStories(data.stories);
      if (data.newArrivals && data.newArrivals.length > 0) setNewArrivals(data.newArrivals);
      if (data.popularProducts && data.popularProducts.length > 0) setPopularProducts(data.popularProducts);
      if (data.banners && data.banners.length > 0) setBanners(data.banners);
      if (data.categories && data.categories.length > 0) setCategories(data.categories);
    } catch (error) {
      console.warn('Failed to load profile feed:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadFeedData();
  }, [loadFeedData]);

  useEffect(() => {
    getCachedAvatar().then((av) => {
      if (av) setCachedAvatar(av);
    });
    getCachedName().then((nm) => {
      if (nm) setCachedName(nm);
    });
  }, []);

  useEffect(() => {
    if (profile) {
      setCachedAvatar(profile.image_url);
    }
  }, [profile?.image_url]);

  // User Name
  const actualFullName =
    profile?.full_name ||
    cachedName ||
    user?.user_metadata?.full_name ||
    'Romina';

  const firstName = actualFullName.trim().split(' ')[0] || 'Romina';
  const capitalizedName =
    firstName.charAt(0).toUpperCase() + firstName.slice(1);

  // User Avatar
  const userAvatar = profile !== null && profile !== undefined ? profile.image_url : cachedAvatar;

  // Responsive calculations
  const { width: windowWidth } = useWindowDimensions();
  const numCategoryColumns = windowWidth >= 900 ? 4 : windowWidth >= 600 ? 3 : 2;
  const horizontalPadding = 40;
  const categoryGap = 12;
  const categoryCardWidth = Math.floor(
    (windowWidth - horizontalPadding - (categoryGap * (numCategoryColumns - 1))) / numCategoryColumns
  );

  const displayCategories: CategoryCardData[] = useMemo(() => {
    const fallbackImages = [
      'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=300',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=300',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300',
    ];

    if (categories && categories.length > 0) {
      return categories.slice(0, 4).map((cat, idx) => ({
        id: cat.id,
        name: cat.name,
        count: (cat as any).count ?? (idx === 0 ? '109' : idx === 1 ? '530' : idx === 2 ? '87' : '218'),
        images: [cat.image_url || fallbackImages[idx % fallbackImages.length], fallbackImages[(idx + 1) % fallbackImages.length], fallbackImages[(idx + 2) % fallbackImages.length], fallbackImages[(idx + 3) % fallbackImages.length]],
      }));
    }

    return [
      { id: 'c1', name: 'Clothing', count: '109', images: fallbackImages },
      { id: 'c2', name: 'Shoes', count: '530', images: fallbackImages },
      { id: 'c3', name: 'Bags', count: '87', images: fallbackImages },
      { id: 'c4', name: 'Lingerie', count: '218', images: fallbackImages },
    ];
  }, [categories]);

  // Dynamic recently viewed items from Supabase popular products
  const recentlyViewedItems = useMemo(() => {
    if (popularProducts && popularProducts.length > 0) {
      return popularProducts.slice(0, 6).map((prod) => ({
        id: prod.id,
        image: prod.images && prod.images.length > 0
          ? { uri: prod.images[0] }
          : require('@/assets/png/onboarding_girl_1.png'),
        title: prod.title,
      }));
    }
    return [
      { id: '1', image: require('@/assets/png/onboarding_girl_1.png'), title: 'Item 1' },
      { id: '2', image: require('@/assets/png/onboarding_slide2.jpg'), title: 'Item 2' },
      { id: '3', image: require('@/assets/png/onboarding_slide3.jpg'), title: 'Item 3' },
      { id: '4', image: require('@/assets/png/onboarding_girls_2.png'), title: 'Item 4' },
    ];
  }, [popularProducts]);

  const itemKeyExtractor = useCallback((item: { id: string }) => item.id, []);

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

  const handleSeeAllCategories = useCallback(() => {
    navigation.navigate('AllCategories');
  }, [navigation]);

  const handleOpenEditProfile = useCallback(() => {
    setIsEditProfileOpen(true);
  }, []);

  const handleCloseEditProfile = useCallback(() => {
    setIsEditProfileOpen(false);
  }, []);

  const handleRefresh = useCallback(() => {
    loadFeedData(true);
  }, [loadFeedData]);

  const handleSignOut = useCallback(() => {
    signOut();
  }, [signOut]);

  const renderStoryItem = useCallback(
    ({ item }: { item: Story }) => <StoryCard key={item.id} story={item} />,
    []
  );

  const renderProductItem = useCallback(
    ({ item }: { item: Product }) => (
      <ProductCard key={item.id} product={item} onPress={handleProductPress} />
    ),
    [handleProductPress]
  );

  const renderPopularItem = useCallback(
    ({ item }: { item: Product }) => (
      <PopularProductCard key={item.id} product={item} onPress={handleProductPress} />
    ),
    [handleProductPress]
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" />

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
        {/* 1. Header Row */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {/* Avatar (48x48 circle) - User profile sirf profile image se tap karke edit kar paye */}
            <TouchableOpacity
              style={styles.avatarButton}
              activeOpacity={0.85}
              onPress={handleOpenEditProfile}
            >
              <AppImage
                source={userAvatar || require('@/assets/png/userImage.png')}
                placeholder={require('@/assets/png/userImage.png')}
                style={styles.avatar}
                borderRadius={24}
                resizeMode="cover"
              />
            </TouchableOpacity>
            {/* My Activity Pill */}
            <TouchableOpacity style={styles.activityButton} activeOpacity={0.85}>
              <Text style={styles.activityButtonText}>My Activity</Text>
            </TouchableOpacity>
          </View>

          {/* Right Action Icons: Scanner, Top Menu, Settings */}
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
              <Image
                source={require('@/assets/png/scanner.png')}
                style={styles.headerIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
              <Image
                source={require('@/assets/png/top_menu.png')}
                style={styles.headerIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
              <Image
                source={require('@/assets/png/Settings.png')}
                style={styles.headerIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. Headline Greeting */}
        <View style={styles.greetingSection}>
          <Text style={styles.greetingTitle}>Hello, {capitalizedName}!</Text>
        </View>

        {/* 3. Announcement Card */}
        <View style={styles.announcementCard}>
          <View style={styles.announcementTextWrap}>
            <Text style={styles.announcementTitle}>
              {banners.length > 0 ? banners[0].title : 'Announcement'}
            </Text>
            <Text style={styles.announcementDesc} numberOfLines={2}>
              {banners.length > 0
                ? banners[0].description || banners[0].subtitle
                : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas hendrerit luctus libero ac vulputate.'}
            </Text>
          </View>
          <TouchableOpacity style={styles.announcementArrowBtn} activeOpacity={0.85}>
            <ArrowRightIcon size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* 4. Recently viewed */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recently viewed</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.recentListContent}
        >
          {recentlyViewedItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.recentItemContainer}
              activeOpacity={0.8}
              onPress={() => {
                if (item.id && !item.id.startsWith('1') && !item.id.startsWith('2')) {
                  navigation.navigate('ProductDetails', {
                    productId: item.id,
                    name: item.title,
                    initialProduct: item,
                  });
                }
              }}
            >
              <Image
                source={require('@/assets/png/recently_viewed_circle_bg.png')}
                style={styles.recentCircleBg}
                resizeMode="contain"
              />
              <View style={styles.recentItemWrapper}>
                <AppImage
                  source={item.image}
                  style={styles.recentItemImage}
                  borderRadius={24}
                  resizeMode="cover"
                />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 5. My Orders */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Orders</Text>
        </View>
        <View style={styles.ordersTabsRow}>
          {(['To Pay', 'To Recieve', 'To Review'] as const).map((tab) => {
            const isActive = selectedOrderTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.orderTab, isActive && styles.orderTabActive]}
                activeOpacity={0.8}
                onPress={() => setSelectedOrderTab(tab)}
              >
                <ActiveDot visible={isActive} />
                <Text style={[styles.orderTabText, isActive && styles.orderTabTextActive]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 6. Stories */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Stories</Text>
        </View>
        {loading && stories.length === 0 ? (
          <View style={[styles.horizontalListContent, { flexDirection: 'row' }]}>
            {[1, 2, 3, 4].map((k) => (
              <View key={k} style={styles.storyCard}>
                <ShimmerPlaceholder width={120} height={200} borderRadius={10} />
              </View>
            ))}
          </View>
        ) : (
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={stories}
            renderItem={renderStoryItem}
            keyExtractor={itemKeyExtractor}
            contentContainerStyle={styles.horizontalListContent}
          />
        )}

        {/* 7. New Items */}
        <View style={styles.sectionHeaderWithLink}>
          <Text style={styles.sectionTitle}>New Items</Text>
          <TouchableOpacity style={styles.seeAllRow} activeOpacity={0.7}>
            <Text style={styles.seeAllText}>See All</Text>
            <View style={styles.seeAllCircle}>
              <ArrowRightIcon size={12} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        </View>
        {loading && newArrivals.length === 0 ? (
          <View style={[styles.horizontalListContent, { flexDirection: 'row' }]}>
            {[1, 2, 3].map((k) => (
              <View key={k} style={styles.productCard}>
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
            keyExtractor={itemKeyExtractor}
            contentContainerStyle={styles.horizontalListContent}
            removeClippedSubviews={Platform.OS === 'android'}
            maxToRenderPerBatch={10}
            windowSize={7}
            initialNumToRender={12}
            updateCellsBatchingPeriod={50}
          />
        )}

        {/* 8. Most Popular */}
        <View style={styles.sectionHeaderWithLink}>
          <Text style={styles.sectionTitle}>Most Popular</Text>
          <TouchableOpacity style={styles.seeAllRow} activeOpacity={0.7}>
            <Text style={styles.seeAllText}>See All</Text>
            <View style={styles.seeAllCircle}>
              <ArrowRightIcon size={12} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        </View>
        {loading && popularProducts.length === 0 ? (
          <View style={[styles.horizontalListContent, { flexDirection: 'row' }]}>
            {[1, 2, 3, 4].map((k) => (
              <View key={k} style={styles.popularCard}>
                <ShimmerPlaceholder width={104} height={140} borderRadius={9} />
              </View>
            ))}
          </View>
        ) : (
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={popularProducts}
            renderItem={renderPopularItem}
            keyExtractor={itemKeyExtractor}
            contentContainerStyle={styles.horizontalListContent}
            removeClippedSubviews={Platform.OS === 'android'}
            maxToRenderPerBatch={10}
            windowSize={7}
            initialNumToRender={12}
            updateCellsBatchingPeriod={50}
          />
        )}

        {/* 9. Categories: 2 Rows x 2 Columns Grid */}
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

        {/* 10. Seller Mode Switch Card */}
        <View style={styles.sellerBannerWrap}>
          <TouchableOpacity
            style={styles.sellerBannerCard}
            activeOpacity={0.88}
            onPress={handleSwitchToSeller}
          >
            <View style={styles.sellerIconBox}>
              <StorefrontIcon size={24} color="#FF5790" />
            </View>
            <View style={styles.sellerTextBox}>
              <Text style={styles.sellerBannerTitle}>
                {isVendor ? 'Switch Profile · Seller Mode' : 'Become a Seller on LocalKart'}
              </Text>
              <Text style={styles.sellerBannerSub}>
                {isVendor
                  ? 'Manage your store, inventory & live orders'
                  : 'Start selling locally & deliver in 15-20 mins'}
              </Text>
            </View>
            <View style={styles.sellerArrowCircle}>
              <ArrowRightIcon size={14} color="#FF5790" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Logout Option at bottom */}
        <View style={styles.logoutWrapper}>
          <TouchableOpacity
            style={styles.logoutButton}
            activeOpacity={0.8}
            onPress={handleSignOut}
            disabled={isLoading}
          >
            <Text style={styles.logoutButtonText}>
              {isLoading ? 'Logging out...' : 'Log Out'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Edit Profile Modal: Khulta hai sirf Profile Avatar par tap karne se */}
      <EditProfileModal
        visible={isEditProfileOpen}
        onClose={handleCloseEditProfile}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  bottomSpacer: {
    height: 32,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  activityButton: {
    backgroundColor: '#004CFF',
    height: 38,
    paddingHorizontal: 16,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  activityButtonText: {
    fontFamily: fonts.raleway.medium,
    fontSize: 16,
    color: '#FFFFFF',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIcon: {
    width: 24,
    height: 24,
  },
  // Greeting
  greetingSection: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
  },
  greetingTitle: {
    fontFamily: fonts.raleway.bold,
    fontSize: 28,
    lineHeight: 34,
    color: '#000000',
  },
  // Announcement Card
  announcementCard: {
    marginHorizontal: 20,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  announcementTextWrap: {
    flex: 1,
    paddingRight: 12,
  },
  announcementTitle: {
    fontFamily: fonts.raleway.bold,
    fontSize: 15,
    color: '#000000',
    marginBottom: 4,
  },
  announcementDesc: {
    fontFamily: fonts.nunito.regular,
    fontSize: 12,
    lineHeight: 16,
    color: '#8A8A8E',
  },
  announcementArrowBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#0C54FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Recently viewed
  recentListContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  recentItemContainer: {
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recentCircleBg: {
    position: 'absolute',
    width: 64,
    height: 64,
  },
  recentItemWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#F2F4F7',
  },
  recentItemImage: {
    width: '100%',
    height: '100%',
  },
  // My Orders Tabs
  ordersTabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 10,
  },
  orderTab: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E5EBFC',
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  orderTabActive: {
    backgroundColor: '#DFE9FF',
  },
  orderTabText: {
    fontFamily: fonts.raleway.medium,
    fontSize: 16,
    color: '#0042E0',
  },
  orderTabTextActive: {
    color: '#0042E0',
  },
  // Stories
  horizontalListContent: {
    paddingHorizontal: 20,
    paddingVertical: 6,
    gap: 12,
  },
  storyCard: {
    width: 120,
    height: 200,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#F2F4F7',
    position: 'relative',
  },
  // New Items
  productCard: {
    width: 140,
    height: 204,
    marginRight: 10,
  },
  // Most Popular
  popularCard: {
    width: 104,
    height: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 9,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.04)',
    overflow: 'hidden',
    marginRight: 10,
  },
  // Categories Grid Container
  categoriesGridContainer: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 14,
    marginBottom: 10,
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
  // Logout
  logoutWrapper: {
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 10,
  },
  logoutButton: {
    width: '100%',
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FEECEF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButtonText: {
    fontFamily: fonts.raleway.bold,
    fontSize: 15,
    color: '#FF3B30',
  },
  // Seller Banner Card
  sellerBannerWrap: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 4,
  },
  sellerBannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F5',
    borderWidth: 1.2,
    borderColor: '#FFD6E5',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#FF5790',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  sellerIconBox: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: '#FFD6E5',
  },
  sellerTextBox: {
    flex: 1,
  },
  sellerBannerTitle: {
    fontFamily: fonts.raleway.bold,
    fontSize: 15.5,
    color: '#181C1F',
    marginBottom: 3,
  },
  sellerBannerSub: {
    fontFamily: fonts.nunito.regular,
    fontSize: 12.5,
    color: '#707070',
    lineHeight: 17,
  },
  sellerArrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    borderWidth: 1,
    borderColor: '#FFD6E5',
  },
});