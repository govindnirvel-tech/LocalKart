import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  Image,
  TouchableOpacity,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { fonts } from '@/theme/fonts';
import { RootStackParamList } from '@/navigation/types';
import BubblesCopy from '@/assets/svg/Bubbles copy.svg';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// 375 x 812 Figma reference dimensions:
// Card: W: 326, H: 614, X: 25, Y: 81, borderRadius: 30
const CARD_WIDTH = Math.min(326, SCREEN_WIDTH - 48);
const CARD_HEIGHT = Math.min(614, SCREEN_HEIGHT * 0.74);
const IMAGE_HEIGHT = Math.round(CARD_HEIGHT * 0.58);

interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  image: any;
  activeDotIndex: number;
  showButton?: boolean;
}

const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: 'slide_1',
    title: 'Welcome!',
    description:
      'Discover the best shops in your\nneighbourhood, all in one app.\nFrom daily needs to special finds,\neverything is just a tap away.',
    image: require('@/assets/png/onboarding_girl_1.png'),
    activeDotIndex: 0,
    showButton: false,
  },
  {
    id: 'slide_2',
    title: 'Shop Local',
    description:
      'Browse products from trusted\nstores near you and support\nthe businesses that make\nyour city special.',
    image: require('@/assets/png/onboarding_slide2.jpg'),
    activeDotIndex: 1,
    showButton: false,
  },
  {
    id: 'slide_3',
    title: 'Fast Delivery',
    description:
      'Order in a few taps and get\nit delivered to your doorstep\nquickly, right from the store\nnext door.',
    image: require('@/assets/png/onboarding_slide3.jpg'),
    activeDotIndex: 2,
    showButton: false,
  },
  {
    id: 'slide_4',
    title: 'Ready?',
    description:
      "Your local market is waiting.\nLet's find something you'll love.",
    image: require('@/assets/png/onboarding_girls_2.png'),
    activeDotIndex: 3,
    showButton: true,
  },
];

const TOTAL_DOTS = 4;

const OnboardingScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const flatListRef = useRef<FlatList<OnboardingSlide>>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    if (index >= 0 && index < ONBOARDING_SLIDES.length && index !== currentIndex) {
      setCurrentIndex(index);
    }
  };

  const handleDotPress = (dotIdx: number) => {
    flatListRef.current?.scrollToIndex({
      index: dotIdx,
      animated: true,
    });
    setCurrentIndex(dotIdx);
  };

  const handleStart = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Tabs', params: { screen: 'Home' } }],
    });
  };

  const activeDot = currentIndex;

  const renderSlide = ({ item }: { item: OnboardingSlide }) => {
    return (
      <View style={styles.slideContainer}>
        {/* Card with drop shadow and rounded corners */}
        <View style={styles.cardShadow}>
          <View style={styles.cardInner}>
            {/* Top Half: Rounded Top Image */}
            <Image
              source={item.image}
              style={styles.cardImage}
              resizeMode="cover"
            />

            {/* Bottom Half: Title, Description & Action Button */}
            <View style={styles.cardBody}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>

              {item.showButton && (
                <TouchableOpacity
                  style={styles.startButton}
                  activeOpacity={0.85}
                  onPress={handleStart}
                >
                  <Text style={styles.startButtonText}>Let's Start</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />

      {/* Background SVG Waves - Bubbles copy.svg only */}
      <View style={styles.backgroundWrapper} pointerEvents="none">
        <BubblesCopy
          width={SCREEN_WIDTH}
          height={SCREEN_HEIGHT * 0.48}
          preserveAspectRatio="xMidYMin slice"
        />
      </View>

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* Carousel of Cards */}
        <View style={styles.carouselContainer}>
          <FlatList
            ref={flatListRef}
            data={ONBOARDING_SLIDES}
            renderItem={renderSlide}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            bounces={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            getItemLayout={(_, index) => ({
              length: SCREEN_WIDTH,
              offset: SCREEN_WIDTH * index,
              index,
            })}
          />
        </View>

        {/* 4 Pagination Dots at the bottom */}
        <View style={styles.paginationContainer}>
          {Array.from({ length: TOTAL_DOTS }).map((_, dotIdx) => {
            const isActive = dotIdx === activeDot;
            return (
              <TouchableOpacity
                key={dotIdx}
                activeOpacity={0.7}
                onPress={() => handleDotPress(dotIdx)}
                style={[
                  styles.dot,
                  isActive ? styles.dotActive : styles.dotInactive,
                ]}
              />
            );
          })}
        </View>
      </SafeAreaView>
    </View>
  );
};

export default OnboardingScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  backgroundWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.48,
    overflow: 'hidden',
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
  },
  carouselContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  slideContainer: {
    width: SCREEN_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardShadow: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  cardInner: {
    flex: 1,
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  cardImage: {
    width: '100%',
    height: IMAGE_HEIGHT,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  cardBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  title: {
    fontFamily: fonts.raleway.bold,
    fontSize: 28,
    lineHeight: 34,
    color: '#181C1F',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontFamily: fonts.nunito.regular,
    fontSize: 14.5,
    lineHeight: 22,
    color: '#707070',
    textAlign: 'center',
    maxWidth: 270,
    marginBottom: 16,
  },
  startButton: {
    backgroundColor: '#004BFE',
    minWidth: 156,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
    shadowColor: '#004BFE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 4,
  },
  startButtonText: {
    fontFamily: fonts.nunito.semiBold,
    fontSize: 16,
    color: '#FFFFFF',
  },
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 24,
    paddingTop: 12,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    marginHorizontal: 6,
  },
  dotActive: {
    backgroundColor: '#004BFE',
  },
  dotInactive: {
    backgroundColor: '#D9E4FF',
  },
});
