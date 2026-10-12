import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Platform,
  UIManager,
  LayoutAnimation,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { fonts } from '@/theme/fonts';
import type { Banner } from '@/types/database';
import AppImage from '@/components/AppImage';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export interface BannerSlideData {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  colors: [string, string];
  image: any;
}

const DEFAULT_BANNER_SLIDES: BannerSlideData[] = [
  {
    id: 'slide-1',
    badge: 'Happening Now',
    title: 'Big Sale',
    subtitle: 'Up to 50%',
    colors: ['#FFB703', '#FB8500'],
    image: require('@/assets/png/onboarding_girl_1.png'),
  },
  {
    id: 'slide-2',
    badge: 'Trending Fashion',
    title: 'New Season',
    subtitle: 'Up to 40% Off',
    colors: ['#0077B6', '#0096C7'],
    image: require('@/assets/png/onboarding_girls_2.png'),
  },
  {
    id: 'slide-3',
    badge: 'Local Deals',
    title: 'Super Saver',
    subtitle: 'Flat 30% Off',
    colors: ['#E63946', '#F72585'],
    image: require('@/assets/png/onboarding_slide2.jpg'),
  },
  {
    id: 'slide-4',
    badge: 'Fast Delivery',
    title: 'Flash Mania',
    subtitle: '20% Extra Cashback',
    colors: ['#7209B7', '#4361EE'],
    image: require('@/assets/png/onboarding_slide3.jpg'),
  },
  {
    id: 'slide-5',
    badge: 'Limited Stock',
    title: 'Boutique Fest',
    subtitle: 'Buy 1 Get 1 Free',
    colors: ['#2A9D8F', '#264653'],
    image: require('@/assets/png/onboarding_girl_1.png'),
  },
];

interface HeroBannerCarouselProps {
  banners?: Banner[];
}

export const HeroBannerCarousel: React.FC<HeroBannerCarouselProps> = ({ banners }) => {
  const { width: windowWidth } = useWindowDimensions();
  const cardWidth = windowWidth - 40; // 20 padding on each side
  const flatListRef = useRef<FlatList<BannerSlideData>>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const currentIndexRef = useRef(1);
  const isInteracting = useRef(false);
  const isResetting = useRef(false);

  // Merge dynamic banners from Supabase if available
  const baseSlides: BannerSlideData[] = useMemo(() => {
    if (banners && banners.length > 0) {
      return banners.map((b, idx) => {
        const fallback = DEFAULT_BANNER_SLIDES[idx % DEFAULT_BANNER_SLIDES.length];
        return {
          id: b.id,
          badge: 'Happening Now',
          title: b.title || fallback.title,
          subtitle: b.subtitle || b.description || fallback.subtitle,
          colors: fallback.colors,
          image: b.image_url ? { uri: b.image_url } : fallback.image,
        };
      });
    }
    return DEFAULT_BANNER_SLIDES;
  }, [banners]);

  // Infinite looping data with clones: [LastClone, ...baseSlides, FirstClone]
  const slides: BannerSlideData[] = useMemo(() => {
    if (baseSlides.length <= 1) return baseSlides;
    const firstClone: BannerSlideData = {
      ...baseSlides[0],
      id: `${baseSlides[0].id}-clone-first`,
    };
    const lastClone: BannerSlideData = {
      ...baseSlides[baseSlides.length - 1],
      id: `${baseSlides[baseSlides.length - 1].id}-clone-last`,
    };
    return [lastClone, ...baseSlides, firstClone];
  }, [baseSlides]);

  // Mount at index 1 (the first real slide)
  useEffect(() => {
    if (cardWidth > 0 && baseSlides.length > 1) {
      currentIndexRef.current = 1;
      flatListRef.current?.scrollToOffset({
        offset: 1 * cardWidth,
        animated: false,
      });
    }
  }, [cardWidth, baseSlides.length]);

  // Auto-play timer (every 4 seconds) - strictly forward infinite loop
  useEffect(() => {
    if (baseSlides.length <= 1) return;

    const interval = setInterval(() => {
      if (isInteracting.current || isResetting.current) return;

      const nextTarget = currentIndexRef.current + 1;
      currentIndexRef.current = nextTarget;

      flatListRef.current?.scrollToOffset({
        offset: nextTarget * cardWidth,
        animated: true,
      });

      // Calculate which dot is active: wrap to 0 when sliding to end clone
      let nextDot = 0;
      if (nextTarget >= 1 && nextTarget <= baseSlides.length) {
        nextDot = nextTarget - 1;
      } else if (nextTarget > baseSlides.length) {
        nextDot = 0; // Direct to first dot, never reverse!
      }

      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setActiveIndex(nextDot);
    }, 4000);

    return () => clearInterval(interval);
  }, [baseSlides.length, cardWidth]);

  // Handle manual scroll while dragging
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (isResetting.current || baseSlides.length <= 1) return;
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / cardWidth);

    let nextDot = 0;
    if (index >= 1 && index <= baseSlides.length) {
      nextDot = index - 1;
    } else if (index >= baseSlides.length + 1) {
      nextDot = 0;
    } else if (index <= 0) {
      nextDot = baseSlides.length - 1;
    }

    if (nextDot !== activeIndex) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setActiveIndex(nextDot);
    }
  };

  // When momentum animation stops, silently reset if on cloned items
  const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    isInteracting.current = false;
    if (baseSlides.length <= 1) return;

    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / cardWidth);

    if (index >= baseSlides.length + 1) {
      // Reached first clone (after last slide) -> silently jump to real first slide (index 1)
      isResetting.current = true;
      currentIndexRef.current = 1;
      flatListRef.current?.scrollToOffset({
        offset: 1 * cardWidth,
        animated: false,
      });
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setActiveIndex(0);
      setTimeout(() => {
        isResetting.current = false;
      }, 50);
    } else if (index <= 0) {
      // Reached last clone (before first slide) -> silently jump to real last slide
      isResetting.current = true;
      currentIndexRef.current = baseSlides.length;
      flatListRef.current?.scrollToOffset({
        offset: baseSlides.length * cardWidth,
        animated: false,
      });
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setActiveIndex(baseSlides.length - 1);
      setTimeout(() => {
        isResetting.current = false;
      }, 50);
    } else {
      currentIndexRef.current = index;
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setActiveIndex(index - 1);
    }
  };

  const bannerKeyExtractor = useCallback((item: BannerSlideData) => item.id, []);

  const handleDotPress = useCallback(
    (dotIdx: number) => {
      if (baseSlides.length <= 1) return;
      const target = dotIdx + 1;
      currentIndexRef.current = target;
      flatListRef.current?.scrollToOffset({
        offset: target * cardWidth,
        animated: true,
      });
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setActiveIndex(dotIdx);
    },
    [baseSlides.length, cardWidth]
  );

  const handleScrollBeginDrag = useCallback(() => {
    isInteracting.current = true;
  }, []);

  const handleScrollEndDrag = useCallback(() => {
    isInteracting.current = false;
  }, []);

  const handleScrollToIndexFailed = useCallback(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToOffset({
        offset: 1 * cardWidth,
        animated: false,
      });
    }, 100);
  }, [cardWidth]);

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: cardWidth,
      offset: cardWidth * index,
      index,
    }),
    [cardWidth]
  );

  const renderBannerItem = useCallback(
    ({ item }: { item: BannerSlideData }) => (
      <View style={[styles.cardOuter, { width: cardWidth }]}>
        <LinearGradient
          colors={item.colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0.8 }}
          style={styles.heroBannerCard}
        >
          <View style={styles.bannerTextCol}>
            <Text style={styles.bannerBadge}>{item.badge}</Text>
            <Text
              style={[
                styles.bannerTitle,
                item.title.length > 14 && styles.bannerTitleLong,
              ]}
              numberOfLines={2}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
            >
              {item.title}
            </Text>
            <Text style={styles.bannerSubtitle} numberOfLines={2}>
              {item.subtitle}
            </Text>
          </View>
          <AppImage
            source={typeof item.image === 'string' ? { uri: item.image } : item.image}
            style={styles.bannerImage}
            resizeMode="cover"
          />
        </LinearGradient>
      </View>
    ),
    [cardWidth]
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={slides}
        keyExtractor={bannerKeyExtractor}
        renderItem={renderBannerItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        bounces={false}
        decelerationRate="fast"
        snapToInterval={cardWidth}
        snapToAlignment="start"
        disableIntervalMomentum={true}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleScrollEndDrag}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        initialScrollIndex={baseSlides.length > 1 ? 1 : 0}
        onScrollToIndexFailed={handleScrollToIndexFailed}
        getItemLayout={getItemLayout}
      />

      {/* Pagination Dots */}
      <View style={styles.dotsRow}>
        {baseSlides.map((_, dotIdx) => {
          const isActive = dotIdx === activeIndex;
          return (
            <TouchableOpacity
              key={dotIdx}
              activeOpacity={0.7}
              onPress={() => handleDotPress(dotIdx)}
              style={isActive ? styles.dotActive : styles.dotInactive}
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  cardOuter: {
    overflow: 'hidden',
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
    paddingRight: 10,
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
  bannerTitleLong: {
    fontSize: 21,
    lineHeight: 25,
  },
  bannerSubtitle: {
    fontFamily: fonts.nunito.bold,
    fontSize: 15,
    color: '#FFFFFF',
    opacity: 0.95,
    marginTop: 2,
  },
  bannerImage: {
    width: 140,
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
    width: 22,
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
});

export default HeroBannerCarousel;
