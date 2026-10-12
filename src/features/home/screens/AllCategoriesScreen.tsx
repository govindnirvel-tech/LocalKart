import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Svg, { Path } from 'react-native-svg';

import { RootStackParamList } from '@/navigation/types';
import { fonts } from '@/theme/fonts';
import AppImage from '@/components/AppImage';
import { fetchMainCategories, fetchSubcategories } from '@/services/homeService';
import type { Category } from '@/types/database';
import { resolveSafeImageUri } from '@/utils/imageResolver';

const { width: windowWidth } = Dimensions.get('window');
const HORIZONTAL_PADDING = 20;
const SUB_GAP = 10;
const SUB_CARD_WIDTH = Math.floor((windowWidth - (HORIZONTAL_PADDING * 2) - SUB_GAP) / 2);

// Close X Icon
const CloseIcon = ({ size = 20, color = '#181C1F' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 6L6 18M6 6l12 12"
      stroke={color}
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Chevron Down Icon
const ChevronDownIcon = ({ size = 18, color = '#202020' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6 9l6 6 6-6"
      stroke={color}
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Chevron Up Icon
const ChevronUpIcon = ({ size = 18, color = '#004CFF' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 15l-6-6-6 6"
      stroke={color}
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Blue Circle Arrow Icon (for Just For You)
const BlueCircleArrowIcon = () => (
  <View style={styles.blueCircleBtn}>
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 12h14M12 5l7 7-7 7"
        stroke="#FFFFFF"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  </View>
);

// Helper to provide instant-loading, high-resolution fashion thumbnails for all categories
const getCategoryThumbnailUri = (cat: Category): string => {
  return resolveSafeImageUri(cat.image_url || cat.icon_url, cat.name);
};

const DEFAULT_CLOTHING_SUBS: Category[] = [
  { id: 'sub-dresses', name: 'Dresses', slug: 'dresses' } as Category,
  { id: 'sub-pants', name: 'Pants', slug: 'pants' } as Category,
  { id: 'sub-skirts', name: 'Skirts', slug: 'skirts' } as Category,
  { id: 'sub-shorts', name: 'Shorts', slug: 'shorts' } as Category,
  { id: 'sub-jackets', name: 'Jackets', slug: 'jackets' } as Category,
  { id: 'sub-hoodies', name: 'Hoodies', slug: 'hoodies' } as Category,
  { id: 'sub-shirts', name: 'Shirts', slug: 'shirts' } as Category,
  { id: 'sub-polo', name: 'Polo', slug: 'polo' } as Category,
  { id: 'sub-tshirts', name: 'T-Shirts', slug: 't-shirts' } as Category,
  { id: 'sub-tunics', name: 'Tunics', slug: 'tunics' } as Category,
];

// Fallback Mock Data if Supabase is offline (Matching Figma 27)
const FALLBACK_CATEGORIES = [
  {
    id: 'clothing',
    name: 'Clothing',
    image_url: 'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=300',
    gender: 'Women',
  },
  {
    id: 'shoes',
    name: 'Shoes',
    image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200',
    gender: 'Women',
  },
  {
    id: 'bags',
    name: 'Bags',
    image_url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=200',
    gender: 'Women',
  },
  {
    id: 'lingerie',
    name: 'Lingerie',
    image_url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=200',
    gender: 'Women',
  },
  {
    id: 'accessories',
    name: 'Accessories',
    image_url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=200',
    gender: 'Unisex',
  },
];

type GenderTab = 'All' | 'Female' | 'Male';

const SubCategoryCard = React.memo(function SubCategoryCard({
  sub,
  onPress,
}: {
  sub: Category;
  onPress: (id: string, name: string) => void;
}) {
  const handlePress = useCallback(() => {
    onPress(sub.id, sub.name);
  }, [sub.id, sub.name, onPress]);

  return (
    <TouchableOpacity
      style={styles.subCard}
      activeOpacity={0.8}
      onPress={handlePress}
    >
      <Text style={styles.subCardText} numberOfLines={1}>
        {sub.name}
      </Text>
    </TouchableOpacity>
  );
});

const CategoryAccordionItem = React.memo(function CategoryAccordionItem({
  cat,
  isExpanded,
  subcategories,
  isSubLoading,
  onToggle,
  onSubPress,
}: {
  cat: Category;
  isExpanded: boolean;
  subcategories: Category[];
  isSubLoading: boolean;
  onToggle: (id: string) => void;
  onSubPress: (id: string, name: string) => void;
}) {
  const handleToggle = useCallback(() => {
    onToggle(cat.id);
  }, [cat.id, onToggle]);

  const handleViewAll = useCallback(() => {
    onSubPress(cat.id, cat.name);
  }, [cat.id, cat.name, onSubPress]);

  return (
    <View style={styles.categoryItemWrap}>
      {/* Category Row (W 335, H 50) */}
      <TouchableOpacity
        style={styles.categoryHeaderCard}
        activeOpacity={0.85}
        onPress={handleToggle}
      >
        <View style={styles.catLeftRow}>
          {/* Category Thumbnail Image */}
          <AppImage
            source={{ uri: getCategoryThumbnailUri(cat) }}
            style={styles.catThumbnail}
            borderRadius={10}
            resizeMode="cover"
          />
          {/* Category Name (bold 17) */}
          <Text style={styles.categoryNameText} numberOfLines={1}>
            {cat.name}
          </Text>
        </View>

        <View style={styles.chevronWrap}>
          {isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </View>
      </TouchableOpacity>

      {/* Subcategories Grid (Expandable) */}
      {isExpanded && (
        <View style={styles.subcategoriesContainer}>
          {isSubLoading ? (
            <View style={styles.subLoader}>
              <ActivityIndicator size="small" color="#004CFF" />
            </View>
          ) : subcategories.length > 0 ? (
            <View style={styles.subGrid}>
              {subcategories.map((sub) => (
                <SubCategoryCard
                  key={sub.id}
                  sub={sub}
                  onPress={onSubPress}
                />
              ))}
            </View>
          ) : (
            <TouchableOpacity
              style={styles.viewAllMainBtn}
              onPress={handleViewAll}
            >
              <Text style={styles.viewAllMainText}>View All {cat.name} Products →</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
});

type Props = NativeStackScreenProps<RootStackParamList, 'AllCategories'>;

export default function AllCategoriesScreen({ navigation }: Props) {
  const [selectedGender, setSelectedGender] = useState<GenderTab>('Female');
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null);

  // Supabase Data States
  const [mainCategories, setMainCategories] = useState<Category[]>([]);
  const [subcategoriesMap, setSubcategoriesMap] = useState<Record<string, Category[]>>({
    clothing: DEFAULT_CLOTHING_SUBS,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingSubs, setLoadingSubs] = useState<Record<string, boolean>>({});

  // 1. Fetch Main Categories from Supabase (parent_id IS NULL)
  useEffect(() => {
    let isMounted = true;
    (async () => {
      setLoading(true);
      const data = await fetchMainCategories();
      if (isMounted) {
        if (data && data.length > 0) {
          setMainCategories(data);
          // Auto-expand first category
          setExpandedCategoryId(data[0].id);
          loadSubcategoriesFor(data[0].id);
        } else {
          setMainCategories(FALLBACK_CATEGORIES as any);
          setExpandedCategoryId('clothing');
        }
        setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch Subcategories Helper
  const loadSubcategoriesFor = useCallback(async (parentId: string) => {
    if (subcategoriesMap[parentId]) return;
    setLoadingSubs((prev) => ({ ...prev, [parentId]: true }));
    const subs = await fetchSubcategories(parentId);
    setSubcategoriesMap((prev) => ({ ...prev, [parentId]: subs }));
    setLoadingSubs((prev) => ({ ...prev, [parentId]: false }));
  }, [subcategoriesMap]);

  // Filter Categories by Gender Tab
  const filteredCategories = useMemo(() => {
    if (mainCategories.length === 0) return [];
    if (selectedGender === 'Female') {
      return mainCategories.filter(
        (c) => c.gender === 'Women' || c.gender === 'Unisex' || !c.gender
      );
    }
    if (selectedGender === 'Male') {
      return mainCategories.filter(
        (c) => c.gender === 'Men' || c.gender === 'Unisex' || !c.gender
      );
    }
    return mainCategories;
  }, [mainCategories, selectedGender]);

  // Toggle Category Accordion
  const toggleCategory = useCallback((id: string) => {
    const nextState = expandedCategoryId === id ? null : id;
    setExpandedCategoryId(nextState);
    if (nextState) {
      loadSubcategoriesFor(nextState);
    }
  }, [expandedCategoryId, loadSubcategoriesFor]);

  // Navigate to Subcategory Products
  const handleSubcategoryPress = useCallback((subId: string, subName: string) => {
    navigation.navigate('CategoryProducts', {
      categoryId: subId,
      categoryName: subName,
    });
  }, [navigation]);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleGoToFlashSale = useCallback(() => {
    navigation.navigate('FlashSale');
  }, [navigation]);

  const handleGenderSelectAll = useCallback(() => setSelectedGender('All'), []);
  const handleGenderSelectFemale = useCallback(() => setSelectedGender('Female'), []);
  const handleGenderSelectMale = useCallback(() => setSelectedGender('Male'), []);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      {/* Header Row: All Categories (bold 28) + Close X */}
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>All Categories</Text>
        <TouchableOpacity
          style={styles.closeBtn}
          activeOpacity={0.7}
          onPress={handleGoBack}
        >
          <CloseIcon size={22} color="#181C1F" />
        </TouchableOpacity>
      </View>

      {/* Gender Tabs (Pills: All, Female, Male) */}
      <View style={styles.genderTabsRow}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleGenderSelectAll}
          style={[styles.genderTab, selectedGender === 'All' && styles.genderTabActive]}
        >
          <Text style={[styles.genderTabText, selectedGender === 'All' && styles.genderTabTextActive]}>
            All
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleGenderSelectFemale}
          style={[styles.genderTab, selectedGender === 'Female' && styles.genderTabActive]}
        >
          <Text style={[styles.genderTabText, selectedGender === 'Female' && styles.genderTabTextActive]}>
            Female
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleGenderSelectMale}
          style={[styles.genderTab, selectedGender === 'Male' && styles.genderTabActive]}
        >
          <Text style={[styles.genderTabText, selectedGender === 'Male' && styles.genderTabTextActive]}>
            Male
          </Text>
        </TouchableOpacity>
      </View>

      {/* Loading Indicator */}
      {loading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color="#004CFF" />
          <Text style={styles.loadingText}>Loading Categories...</Text>
        </View>
      ) : (
        /* Categories Accordion List */
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {filteredCategories.map((cat) => (
            <CategoryAccordionItem
              key={cat.id}
              cat={cat}
              isExpanded={expandedCategoryId === cat.id}
              subcategories={subcategoriesMap[cat.id] || []}
              isSubLoading={Boolean(loadingSubs[cat.id])}
              onToggle={toggleCategory}
              onSubPress={handleSubcategoryPress}
            />
          ))}

          {/* Just For You Special Row */}
          <TouchableOpacity
            style={[styles.categoryHeaderCard, styles.justForYouCard]}
            activeOpacity={0.85}
            onPress={handleGoToFlashSale}
          >
            <View style={styles.catLeftRow}>
              <AppImage
                source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300' }}
                style={styles.catThumbnail}
                borderRadius={10}
                resizeMode="cover"
              />
              <Text style={styles.justForYouTitle}>
                Just for You <Text style={styles.justForYouStar}>★</Text>
              </Text>
            </View>
            <BlueCircleArrowIcon />
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loaderWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontFamily: fonts.raleway.medium,
    fontSize: 14,
    color: '#6B7280',
  },
  subLoader: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: 8,
    paddingBottom: 30,
  },
  // Header
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: 8,
    paddingBottom: 14,
  },
  headerTitle: {
    fontFamily: fonts.raleway.bold,
    fontSize: 28,
    lineHeight: 34,
    color: '#181C1F',
  },
  closeBtn: {
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Gender Tabs Row (Pills: All, Female, Male - Spaced Evenly)
  genderTabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  genderTab: {
    minWidth: 96,
    height: 42,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#F5F6F8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  genderTabActive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.6,
    borderColor: '#004CFF',
  },
  genderTabText: {
    fontFamily: fonts.raleway.medium,
    fontSize: 16,
    color: '#181C1F',
  },
  genderTabTextActive: {
    fontFamily: fonts.raleway.semiBold,
    fontSize: 16,
    color: '#004CFF',
  },
  // Categories Accordion Item
  categoryItemWrap: {
    marginBottom: 12,
  },
  categoryHeaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    height: 56,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#F0F2F5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  catLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
    paddingRight: 8,
  },
  catThumbnail: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
  },
  categoryNameText: {
    fontFamily: fonts.raleway.bold,
    fontSize: 17,
    color: '#181C1F',
    flex: 1,
  },
  chevronWrap: {
    padding: 4,
  },
  // Subcategories Grid (Guaranteed 2 columns per row)
  subcategoriesContainer: {
    marginTop: 10,
  },
  subGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  subCard: {
    width: '48.5%',
    height: 46,
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#FFEAEA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  subCardText: {
    fontFamily: fonts.raleway.bold,
    fontSize: 14,
    color: '#181C1F',
    textAlign: 'center',
  },
  viewAllMainBtn: {
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#F5F7FF',
    borderRadius: 10,
  },
  viewAllMainText: {
    fontFamily: fonts.raleway.bold,
    fontSize: 14,
    color: '#004CFF',
  },
  // Special Just For You Row
  justForYouCard: {
    marginTop: 8,
    borderColor: '#F0F2F5',
  },
  justForYouTitle: {
    fontFamily: fonts.raleway.bold,
    fontSize: 17,
    color: '#181C1F',
  },
  justForYouStar: {
    color: '#004CFF',
    fontSize: 16,
  },
  blueCircleBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#004CFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
