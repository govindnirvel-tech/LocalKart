import React, { useState, useRef, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  Modal,
  Platform,
  StatusBar,
  PanResponder,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { fonts } from '@/theme/fonts';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Close (X) Icon
const CloseIcon = ({ size = 20, color = '#181C1F' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 6L6 18M6 6l12 12"
      stroke={color}
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Checkmark Icon inside small blue badge
const BadgeCheckIcon = ({ size = 10, color = '#FFFFFF' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 6L9 17l-5-5"
      stroke={color}
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// 10 Filter Categories with high quality fashion avatars (Matching Figma Screen 34)
export interface FilterCategoryItem {
  id: string;
  name: string;
  imageUrl: string;
}

const FILTER_CATEGORIES: FilterCategoryItem[] = [
  {
    id: 'dresses',
    name: 'Dresses',
    imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=200',
  },
  {
    id: 'pants',
    name: 'Pants',
    imageUrl: 'https://images.unsplash.com/photo-1542272604-780c96856592?w=200',
  },
  {
    id: 'skirts',
    name: 'Skirts',
    imageUrl: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=200',
  },
  {
    id: 'shorts',
    name: 'Shorts',
    imageUrl: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=200',
  },
  {
    id: 'jackets',
    name: 'Jackets',
    imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=200',
  },
  {
    id: 'hoodies',
    name: 'Hoodies',
    imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=200',
  },
  {
    id: 'shirts',
    name: 'Shirts',
    imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=200',
  },
  {
    id: 'polo',
    name: 'Polo',
    imageUrl: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=200',
  },
  {
    id: 't-shirts',
    name: 'T-shirts',
    imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=200',
  },
  {
    id: 'tunics',
    name: 'Tunics',
    imageUrl: 'https://images.unsplash.com/photo-1618244972963-dbee1a7edc95?w=200',
  },
];

const CLOTH_SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL'];
const SHOE_SIZES = ['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11'];

const COLOR_SWATCHES = [
  { id: 'white', name: 'White', hex: '#FFFFFF', isLight: true },
  { id: 'black', name: 'Black', hex: '#262626', isLight: false },
  { id: 'blue', name: 'Blue', hex: '#004CFF', isLight: false },
  { id: 'red', name: 'Red', hex: '#F9154B', isLight: false },
  { id: 'teal', name: 'Teal', hex: '#00A896', isLight: false },
  { id: 'yellow', name: 'Yellow', hex: '#F4B400', isLight: false },
  { id: 'purple', name: 'Purple', hex: '#8E44AD', isLight: false },
];

export type SortFilterOption = 'popular' | 'newest' | 'priceHighLow' | 'priceLowHigh';

export interface FilterState {
  selectedCategories: string[];
  sizeType: 'clothes' | 'shoes';
  selectedSize: string;
  selectedColor: string;
  minPrice: number;
  maxPrice: number;
  sortBy: SortFilterOption;
}

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filterState: FilterState) => void;
  initialFilters?: Partial<FilterState>;
  categories?: FilterCategoryItem[];
}

export default function FilterModal({
  visible,
  onClose,
  onApply,
  initialFilters,
  categories,
}: FilterModalProps) {
  const availableCategories = categories && categories.length > 0 ? categories : FILTER_CATEGORIES;
  // Category selections (default dresses, pants, t-shirts selected as in Figma 34)
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialFilters?.selectedCategories ?? ['dresses', 'pants', 't-shirts']
  );

  // Size type and size value
  const [sizeType, setSizeType] = useState<'clothes' | 'shoes'>(
    initialFilters?.sizeType ?? 'clothes'
  );
  const [selectedSize, setSelectedSize] = useState<string>(
    initialFilters?.selectedSize ?? 'M'
  );

  // Color selection (default White as in Figma 34)
  const [selectedColor, setSelectedColor] = useState<string>(
    initialFilters?.selectedColor ?? 'white'
  );

  // Price range ($10 - $150 as in Figma 34)
  const [minPrice, setMinPrice] = useState<number>(initialFilters?.minPrice ?? 10);
  const [maxPrice, setMaxPrice] = useState<number>(initialFilters?.maxPrice ?? 150);

  // Sort option (default popular as in Figma 34)
  const [sortBy, setSortBy] = useState<SortFilterOption>(
    initialFilters?.sortBy ?? 'popular'
  );

  // Toggle category
  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Sizes according to type
  const activeSizes = sizeType === 'clothes' ? CLOTH_SIZES : SHOE_SIZES;

  // Clear all filters back to fresh default
  const handleClear = () => {
    setSelectedCategories([]);
    setSizeType('clothes');
    setSelectedSize('M');
    setSelectedColor('white');
    setMinPrice(10);
    setMaxPrice(150);
    setSortBy('popular');
  };

  // Apply filters
  const handleApply = () => {
    onApply({
      selectedCategories,
      sizeType,
      selectedSize,
      selectedColor,
      minPrice,
      maxPrice,
      sortBy,
    });
    onClose();
  };

  // Slider width calculations
  const sliderTrackWidth = SCREEN_WIDTH - 48; // padding 24 each side
  const PRICE_MIN_LIMIT = 0;
  const PRICE_MAX_LIMIT = 200;

  // Slider Pan Handlers
  const minPercent = (minPrice - PRICE_MIN_LIMIT) / (PRICE_MAX_LIMIT - PRICE_MIN_LIMIT);
  const maxPercent = (maxPrice - PRICE_MIN_LIMIT) / (PRICE_MAX_LIMIT - PRICE_MIN_LIMIT);

  const leftThumbPos = minPercent * sliderTrackWidth;
  const rightThumbPos = maxPercent * sliderTrackWidth;

  const handleTrackTouch = (eventX: number) => {
    const clampedX = Math.max(0, Math.min(sliderTrackWidth, eventX));
    const calculatedPrice = Math.round(
      PRICE_MIN_LIMIT + (clampedX / sliderTrackWidth) * (PRICE_MAX_LIMIT - PRICE_MIN_LIMIT)
    );

    // Update closer thumb
    const distToMin = Math.abs(calculatedPrice - minPrice);
    const distToMax = Math.abs(calculatedPrice - maxPrice);

    if (distToMin < distToMax) {
      if (calculatedPrice < maxPrice - 5) {
        setMinPrice(Math.max(0, calculatedPrice));
      }
    } else {
      if (calculatedPrice > minPrice + 5) {
        setMaxPrice(Math.min(PRICE_MAX_LIMIT, calculatedPrice));
      }
    }
  };

  const leftPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        const newPos = Math.max(0, Math.min(sliderTrackWidth, leftThumbPos + gestureState.dx));
        const newPrice = Math.round(
          PRICE_MIN_LIMIT + (newPos / sliderTrackWidth) * (PRICE_MAX_LIMIT - PRICE_MIN_LIMIT)
        );
        if (newPrice < maxPrice - 5) {
          setMinPrice(Math.max(0, newPrice));
        }
      },
    })
  ).current;

  const rightPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        const newPos = Math.max(0, Math.min(sliderTrackWidth, rightThumbPos + gestureState.dx));
        const newPrice = Math.round(
          PRICE_MIN_LIMIT + (newPos / sliderTrackWidth) * (PRICE_MAX_LIMIT - PRICE_MIN_LIMIT)
        );
        if (newPrice > minPrice + 5) {
          setMaxPrice(Math.min(PRICE_MAX_LIMIT, newPrice));
        }
      },
    })
  ).current;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.modalRoot}>
        <StatusBar barStyle="dark-content" />

        <SafeAreaView style={styles.safeContainer} edges={['top', 'bottom']}>
          {/* Header: "Filter" + Close "X" Button */}
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>Filter</Text>
            <TouchableOpacity
              style={styles.closeBtn}
              activeOpacity={0.7}
              onPress={onClose}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <CloseIcon size={22} color="#181C1F" />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* 1. Category Circular Avatars */}
            <View style={styles.categoryGrid}>
              {availableCategories.map((item) => {
                const isSelected = selectedCategories.includes(item.id);
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.categoryItem}
                    activeOpacity={0.8}
                    onPress={() => toggleCategory(item.id)}
                  >
                    <View style={styles.avatarWrap}>
                      <Image
                        source={{ uri: item.imageUrl }}
                        style={styles.avatarImage}
                        resizeMode="cover"
                      />
                      {isSelected && (
                        <View style={styles.avatarCheckBadge}>
                          <BadgeCheckIcon size={9} color="#FFFFFF" />
                        </View>
                      )}
                    </View>
                    <Text
                      style={[
                        styles.categoryLabel,
                        isSelected && styles.categoryLabelActive,
                      ]}
                      numberOfLines={1}
                    >
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* 2. Size Section */}
            <View style={styles.sectionWrap}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Size</Text>
                {/* Clothes / Shoes Toggle */}
                <View style={styles.sizeTypeRow}>
                  <TouchableOpacity
                    style={[
                      styles.sizeTypeBtn,
                      sizeType === 'clothes' && styles.sizeTypeBtnActive,
                    ]}
                    activeOpacity={0.8}
                    onPress={() => {
                      setSizeType('clothes');
                      setSelectedSize('M');
                    }}
                  >
                    <Text
                      style={[
                        styles.sizeTypeText,
                        sizeType === 'clothes' && styles.sizeTypeTextActive,
                      ]}
                    >
                      Clothes
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.sizeTypeBtn,
                      sizeType === 'shoes' && styles.sizeTypeBtnActive,
                    ]}
                    activeOpacity={0.8}
                    onPress={() => {
                      setSizeType('shoes');
                      setSelectedSize('UK 8');
                    }}
                  >
                    <Text
                      style={[
                        styles.sizeTypeText,
                        sizeType === 'shoes' && styles.sizeTypeTextActive,
                      ]}
                    >
                      Shoes
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Horizontal Pill Capsule Track */}
              <View style={styles.sizeCapsuleTrack}>
                {activeSizes.map((sz) => {
                  const isActive = selectedSize === sz;
                  return (
                    <TouchableOpacity
                      key={sz}
                      style={[styles.sizeItem, isActive && styles.sizeItemActive]}
                      activeOpacity={0.85}
                      onPress={() => setSelectedSize(sz)}
                    >
                      <Text
                        style={[
                          styles.sizeItemText,
                          isActive && styles.sizeItemTextActive,
                        ]}
                      >
                        {sz}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* 3. Color Section */}
            <View style={styles.sectionWrap}>
              <Text style={styles.sectionTitle}>Color</Text>
              <View style={styles.colorRow}>
                {COLOR_SWATCHES.map((color) => {
                  const isSelected = selectedColor === color.id;
                  return (
                    <TouchableOpacity
                      key={color.id}
                      style={[
                        styles.colorSwatchWrap,
                        isSelected && styles.colorSwatchWrapActive,
                      ]}
                      activeOpacity={0.8}
                      onPress={() => setSelectedColor(color.id)}
                    >
                      <View
                        style={[
                          styles.colorCircle,
                          { backgroundColor: color.hex },
                          color.isLight && styles.lightColorCircleBorder,
                        ]}
                      />
                      {isSelected && (
                        <View style={styles.colorCheckBadge}>
                          <BadgeCheckIcon size={8} color="#FFFFFF" />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* 4. Price Section ($10 — $150) */}
            <View style={styles.sectionWrap}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Price</Text>
                <Text style={styles.priceValueText}>
                  ${minPrice} — ${maxPrice}
                </Text>
              </View>

              {/* Dual Range Slider Container */}
              <View
                style={styles.sliderContainer}
                onStartShouldSetResponder={() => true}
                onResponderGrant={(e) => handleTrackTouch(e.nativeEvent.locationX)}
              >
                {/* Background Track */}
                <View style={styles.sliderBaseTrack} />

                {/* Active Highlighted Segment */}
                <View
                  style={[
                    styles.sliderActiveTrack,
                    {
                      left: leftThumbPos,
                      width: Math.max(0, rightThumbPos - leftThumbPos),
                    },
                  ]}
                />

                {/* Left Thumb */}
                <View
                  style={[styles.sliderThumb, { left: leftThumbPos - 16 }]}
                  {...leftPanResponder.panHandlers}
                />

                {/* Right Thumb */}
                <View
                  style={[styles.sliderThumb, { left: rightThumbPos - 16 }]}
                  {...rightPanResponder.panHandlers}
                />
              </View>
            </View>

            {/* 5. Sort Options (2x2 Pill Grid) */}
            <View style={styles.sectionWrap}>
              <View style={styles.sortGrid}>
                {/* Popular */}
                <TouchableOpacity
                  style={[
                    styles.sortPill,
                    sortBy === 'popular' && styles.sortPillActive,
                  ]}
                  activeOpacity={0.8}
                  onPress={() => setSortBy('popular')}
                >
                  <Text
                    style={[
                      styles.sortPillText,
                      sortBy === 'popular' && styles.sortPillTextActive,
                    ]}
                  >
                    Popular
                  </Text>
                  {sortBy === 'popular' && (
                    <View style={styles.pillCheckCircle}>
                      <BadgeCheckIcon size={8} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>

                {/* Newest */}
                <TouchableOpacity
                  style={[
                    styles.sortPill,
                    sortBy === 'newest' && styles.sortPillActive,
                  ]}
                  activeOpacity={0.8}
                  onPress={() => setSortBy('newest')}
                >
                  <Text
                    style={[
                      styles.sortPillText,
                      sortBy === 'newest' && styles.sortPillTextActive,
                    ]}
                  >
                    Newest
                  </Text>
                  {sortBy === 'newest' && (
                    <View style={styles.pillCheckCircle}>
                      <BadgeCheckIcon size={8} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>

                {/* Price High to Low */}
                <TouchableOpacity
                  style={[
                    styles.sortPill,
                    sortBy === 'priceHighLow' && styles.sortPillActive,
                  ]}
                  activeOpacity={0.8}
                  onPress={() => setSortBy('priceHighLow')}
                >
                  <Text
                    style={[
                      styles.sortPillText,
                      sortBy === 'priceHighLow' && styles.sortPillTextActive,
                    ]}
                  >
                    Price High to Low
                  </Text>
                  {sortBy === 'priceHighLow' && (
                    <View style={styles.pillCheckCircle}>
                      <BadgeCheckIcon size={8} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>

                {/* Price Low to High */}
                <TouchableOpacity
                  style={[
                    styles.sortPill,
                    sortBy === 'priceLowHigh' && styles.sortPillActive,
                  ]}
                  activeOpacity={0.8}
                  onPress={() => setSortBy('priceLowHigh')}
                >
                  <Text
                    style={[
                      styles.sortPillText,
                      sortBy === 'priceLowHigh' && styles.sortPillTextActive,
                    ]}
                  >
                    Price Low to High
                  </Text>
                  {sortBy === 'priceLowHigh' && (
                    <View style={styles.pillCheckCircle}>
                      <BadgeCheckIcon size={8} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View style={{ height: 20 }} />
          </ScrollView>

          {/* Bottom Action Buttons: Clear & Apply */}
          <View style={styles.footerRow}>
            <TouchableOpacity
              style={styles.clearBtn}
              activeOpacity={0.75}
              onPress={handleClear}
            >
              <Text style={styles.clearBtnText}>Clear</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.applyBtn}
              activeOpacity={0.85}
              onPress={handleApply}
            >
              <Text style={styles.applyBtnText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  safeContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  // Header
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 14 : 6,
    paddingBottom: 16,
  },
  headerTitle: {
    fontFamily: fonts.raleway.bold,
    fontSize: 28,
    lineHeight: 34,
    color: '#181C1F',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  // 1. Categories Grid
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 26,
    rowGap: 16,
  },
  categoryItem: {
    width: (SCREEN_WIDTH - 48) / 5,
    alignItems: 'center',
  },
  avatarWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    position: 'relative',
  },
  avatarImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F3F4F6',
  },
  avatarCheckBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#004CFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  categoryLabel: {
    fontFamily: fonts.raleway.medium,
    fontSize: 12,
    color: '#181C1F',
    marginTop: 6,
    textAlign: 'center',
  },
  categoryLabelActive: {
    fontFamily: fonts.raleway.bold,
    color: '#004CFF',
  },
  // Sections
  sectionWrap: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitle: {
    fontFamily: fonts.raleway.bold,
    fontSize: 20,
    color: '#181C1F',
  },
  // Size toggles
  sizeTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sizeTypeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#FCECEC', // soft inactive tint
  },
  sizeTypeBtnActive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.4,
    borderColor: '#004CFF',
  },
  sizeTypeText: {
    fontFamily: fonts.raleway.medium,
    fontSize: 12,
    color: '#181C1F',
  },
  sizeTypeTextActive: {
    fontFamily: fonts.raleway.semiBold,
    color: '#004CFF',
  },
  // Size Capsule Track
  sizeCapsuleTrack: {
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EEF3FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
  },
  sizeItem: {
    flex: 1,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
  },
  sizeItemActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#004CFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.16,
    shadowRadius: 6,
    elevation: 4,
  },
  sizeItemText: {
    fontFamily: fonts.raleway.bold,
    fontSize: 13,
    color: '#7D9FFC',
  },
  sizeItemTextActive: {
    color: '#004CFF',
    fontSize: 15,
  },
  // Color Swatches
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  colorSwatchWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  colorSwatchWrapActive: {
    borderWidth: 2,
    borderColor: '#004CFF',
  },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  lightColorCircleBorder: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  colorCheckBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#004CFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  // Price Slider
  priceValueText: {
    fontFamily: fonts.raleway.semiBold,
    fontSize: 16,
    color: '#181C1F',
  },
  sliderContainer: {
    height: 36,
    justifyContent: 'center',
    position: 'relative',
    marginTop: 6,
  },
  sliderBaseTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#DCE8FF',
    width: '100%',
  },
  sliderActiveTrack: {
    position: 'absolute',
    height: 4,
    borderRadius: 2,
    backgroundColor: '#004CFF',
  },
  sliderThumb: {
    position: 'absolute',
    top: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  // Sort Grid (2x2)
  sortGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  sortPill: {
    width: (SCREEN_WIDTH - 48 - 10) / 2,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5F6F8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    position: 'relative',
  },
  sortPillActive: {
    backgroundColor: '#E8F0FE',
  },
  sortPillText: {
    fontFamily: fonts.raleway.medium,
    fontSize: 13,
    color: '#181C1F',
  },
  sortPillTextActive: {
    fontFamily: fonts.raleway.semiBold,
    color: '#004CFF',
  },
  pillCheckCircle: {
    position: 'absolute',
    right: 12,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#004CFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Footer Row
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 8 : 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F2F5',
    backgroundColor: '#FFFFFF',
  },
  clearBtn: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.8,
    borderColor: '#004CFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearBtnText: {
    fontFamily: fonts.raleway.bold,
    fontSize: 16,
    color: '#004CFF',
  },
  applyBtn: {
    flex: 2,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#004CFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#004CFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  applyBtnText: {
    fontFamily: fonts.raleway.bold,
    fontSize: 16,
    color: '#FFFFFF',
  },
});
