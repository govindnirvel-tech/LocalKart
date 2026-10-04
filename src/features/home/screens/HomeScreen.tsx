import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fonts } from '@/theme/fonts';
import Svg, { Path } from 'react-native-svg';

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

// Play icon for stories
const PlayIcon = ({ size = 14, color = '#004CFF' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Path d="M8 5v14l11-7z" />
  </Svg>
);

// Mock data for Recently Viewed
const RECENTLY_VIEWED = [
  { id: '1', image: require('@/assets/png/onboarding_girl_1.png') },
  { id: '2', image: require('@/assets/png/onboarding_slide2.jpg') },
  { id: '3', image: require('@/assets/png/onboarding_slide3.jpg') },
  { id: '4', image: require('@/assets/png/onboarding_girls_2.png') },
  { id: '5', image: require('@/assets/png/Group 1000004658 (1).png') },
];

// Mock data for Stories
const STORIES = [
  { id: '1', image: require('@/assets/png/onboarding_girl_1.png'), isLive: true, borderColor: '#004CFF' },
  { id: '2', image: require('@/assets/png/onboarding_slide2.jpg'), isLive: false, borderColor: '#FF5E97' },
  { id: '3', image: require('@/assets/png/onboarding_slide3.jpg'), isLive: false, borderColor: '#00C566' },
  { id: '4', image: require('@/assets/png/onboarding_girls_2.png'), isLive: false, borderColor: '#FFB800' },
];

// Mock data for New Items
const NEW_ITEMS = [
  {
    id: '1',
    image: require('@/assets/png/onboarding_girl_1.png'),
    title: 'Lorem ipsum dolor sit amet consectetur',
    price: '$17.00',
  },
  {
    id: '2',
    image: require('@/assets/png/onboarding_slide2.jpg'),
    title: 'Lorem ipsum dolor sit amet consectetur',
    price: '$32.00',
  },
  {
    id: '3',
    image: require('@/assets/png/onboarding_slide3.jpg'),
    title: 'Lorem ipsum dolor sit amet consectetur',
    price: '$21.00',
  },
];

// Mock data for Most Popular
const MOST_POPULAR = [
  {
    id: '1',
    image: require('@/assets/png/onboarding_slide2.jpg'),
    likes: '1780',
    tag: 'New',
    tagColor: '#004CFF',
  },
  {
    id: '2',
    image: require('@/assets/png/onboarding_girl_1.png'),
    likes: '1780',
    tag: 'Sale',
    tagColor: '#FF3B30',
  },
  {
    id: '3',
    image: require('@/assets/png/onboarding_slide3.jpg'),
    likes: '1780',
    tag: 'Hot',
    tagColor: '#FF9500',
  },
];

export default function HomeScreen() {
  const [selectedOrderTab, setSelectedOrderTab] = useState<'To Pay' | 'To Recieve' | 'To Review'>('To Recieve');

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      {/* Main Scrollable Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 1. Header Row */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {/* Avatar (40x40 circle) */}
            <Image
              source={require('@/assets/png/Group 1000004658 (1).png')}
              style={styles.avatar}
            />
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
          <Text style={styles.greetingTitle}>Hello, Romina!</Text>
        </View>

        {/* 3. Announcement Card */}
        <View style={styles.announcementCard}>
          <View style={styles.announcementTextWrap}>
            <Text style={styles.announcementTitle}>Announcement</Text>
            <Text style={styles.announcementDesc}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas hendrerit luctus libero ac vulputate.
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
          {RECENTLY_VIEWED.map((item) => (
            <TouchableOpacity key={item.id} style={styles.recentItemWrapper} activeOpacity={0.8}>
              <Image source={item.image} style={styles.recentItemImage} resizeMode="cover" />
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 5. My Orders */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Orders</Text>
        </View>
        <View style={styles.ordersTabsRow}>
          {(['To Pay', 'To Recieve', 'To Review'] as const).map((tab) => {
            const isSelected = selectedOrderTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.orderTab, isSelected && styles.orderTabActive]}
                activeOpacity={0.8}
                onPress={() => setSelectedOrderTab(tab)}
              >
                {tab === 'To Recieve' && <View style={styles.greenDot} />}
                <Text style={[styles.orderTabText, isSelected && styles.orderTabTextActive]}>
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
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalListContent}
        >
          {STORIES.map((story) => (
            <TouchableOpacity key={story.id} style={styles.storyCard} activeOpacity={0.85}>
              <Image source={story.image} style={styles.storyImage} resizeMode="cover" />
              {story.isLive && (
                <View style={styles.liveBadge}>
                  <Text style={styles.liveBadgeText}>Live</Text>
                </View>
              )}
              <View style={styles.playButtonOverlay}>
                <PlayIcon size={12} color="#004CFF" />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

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
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalListContent}
        >
          {NEW_ITEMS.map((item) => (
            <TouchableOpacity key={item.id} style={styles.productCard} activeOpacity={0.85}>
              <Image source={item.image} style={styles.productImage} resizeMode="cover" />
              <Text style={styles.productTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={styles.productPrice}>{item.price}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

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
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalListContent}
        >
          {MOST_POPULAR.map((item) => (
            <TouchableOpacity key={item.id} style={styles.popularCard} activeOpacity={0.85}>
              <Image source={item.image} style={styles.popularImage} resizeMode="cover" />
              <View style={styles.popularTagRow}>
                <Text style={styles.popularLikes}>{item.likes} ❤</Text>
                <Text style={[styles.popularTag, { color: item.tagColor }]}>{item.tag}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Extra padding at bottom for clean scroll above tab bar */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  bottomSpacer: {
    height: 28,
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
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5EBFC',
  },
  activityButton: {
    backgroundColor: '#004CFF',
    height: 32,
    paddingHorizontal: 16,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  activityButtonText: {
    fontFamily: fonts.nunito.semiBold,
    fontSize: 13,
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
    width: 32,
    height: 32,
  },
  // Headline
  greetingSection: {
    paddingHorizontal: 20,
    marginTop: 12,
    marginBottom: 12,
  },
  greetingTitle: {
    fontFamily: fonts.raleway.bold,
    fontSize: 28,
    lineHeight: 34,
    color: '#181C1F',
    letterSpacing: -0.5,
  },
  // Announcement Card
  announcementCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#004CFF',
    backgroundColor: '#FFFFFF',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  announcementTextWrap: {
    flex: 1,
    marginRight: 12,
  },
  announcementTitle: {
    fontFamily: fonts.raleway.bold,
    fontSize: 14,
    color: '#181C1F',
    marginBottom: 4,
  },
  announcementDesc: {
    fontFamily: fonts.nunito.regular,
    fontSize: 12,
    lineHeight: 17,
    color: '#707070',
  },
  announcementArrowBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#004CFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Section Headers
  sectionHeader: {
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 12,
  },
  sectionHeaderWithLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 22,
    marginBottom: 14,
  },
  sectionTitle: {
    fontFamily: fonts.raleway.bold,
    fontSize: 18,
    color: '#181C1F',
  },
  seeAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontFamily: fonts.nunito.semiBold,
    fontSize: 13,
    color: '#004CFF',
    marginRight: 6,
  },
  seeAllCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#004CFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Recently viewed
  recentListContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  recentItemWrapper: {
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
    backgroundColor: '#F2F4F7',
    borderWidth: 1.5,
    borderColor: '#E8EDFB',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F4FE',
    height: 38,
    paddingHorizontal: 16,
    borderRadius: 19,
  },
  orderTabActive: {
    backgroundColor: '#E5EBFC',
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00C566',
    marginRight: 6,
  },
  orderTabText: {
    fontFamily: fonts.nunito.semiBold,
    fontSize: 13,
    color: '#004CFF',
  },
  orderTabTextActive: {
    color: '#004CFF',
  },
  // Stories
  horizontalListContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  storyCard: {
    width: 108,
    height: 154,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F2F4F7',
    position: 'relative',
  },
  storyImage: {
    width: '100%',
    height: '100%',
  },
  liveBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#00C566',
    paddingHorizontal: 8,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  liveBadgeText: {
    fontFamily: fonts.nunito.bold,
    fontSize: 10,
    color: '#FFFFFF',
  },
  playButtonOverlay: {
    position: 'absolute',
    alignSelf: 'center',
    top: '42%',
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 2,
  },
  // New Items
  productCard: {
    width: 140,
  },
  productImage: {
    width: 140,
    height: 160,
    borderRadius: 16,
    backgroundColor: '#F2F4F7',
  },
  productTitle: {
    fontFamily: fonts.nunito.regular,
    fontSize: 12,
    lineHeight: 16,
    color: '#707070',
    marginTop: 8,
  },
  productPrice: {
    fontFamily: fonts.raleway.bold,
    fontSize: 15,
    color: '#181C1F',
    marginTop: 4,
  },
  // Most Popular
  popularCard: {
    width: 136,
  },
  popularImage: {
    width: 136,
    height: 160,
    borderRadius: 16,
    backgroundColor: '#F2F4F7',
  },
  popularTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    marginTop: 6,
  },
  popularLikes: {
    fontFamily: fonts.nunito.regular,
    fontSize: 12,
    color: '#181C1F',
  },
  popularTag: {
    fontFamily: fonts.nunito.semiBold,
    fontSize: 12,
  },
});