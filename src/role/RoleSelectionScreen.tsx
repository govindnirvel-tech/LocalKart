import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { fonts } from '@/theme/fonts';
import { RootStackParamList } from '@/navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get('window');

// -------------------------------------------------------------
// FIGMA-CRAFTED SVG VECTOR ICONS
// -------------------------------------------------------------

// Back Chevron Arrow
const BackArrowIcon = ({ size = 20, color = '#181C1F' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M15 19l-7-7 7-7"
      stroke={color}
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Customer / Shopper Bag Dual-Tone Icon
const ShopperBagIcon = ({ size = 26, color = '#004BFF' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M16 11V7a4 4 0 0 0-8 0v4"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M5 9h14l1.2 11.2A2 2 0 0 1 18.2 22H5.8a2 2 0 0 1-1.99-1.8L5 9z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="12" cy="15" r="1.5" fill={color} />
  </Svg>
);

// Vendor / Storefront Dual-Tone Icon
const StorehouseIcon = ({ size = 26, color = '#FF5790' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 9l2-5h14l2 5"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M21 9v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M9 22V12h6v10"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
    />
  </Svg>
);

// Bullet Checkmark Icon (Circle badge)
const BulletCheckIcon = ({ color = '#004BFF' }: { color?: string }) => (
  <Svg width={18} height={18} viewBox="0 0 20 20" fill="none">
    <Circle
      cx={10}
      cy={10}
      r={9}
      fill={color === '#004BFF' ? '#EBF2FF' : '#FFF0F5'}
    />
    <Path
      d="M6.5 10.5l2.5 2.5 5-5"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Radio Checked Circle
const RadioChecked = ({ color = '#004BFF' }: { color?: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={12} r={11} fill={color} />
    <Path
      d="M8 12.5l2.5 2.5 5.5-5.5"
      stroke="#FFFFFF"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Radio Unchecked Circle
const RadioUnchecked = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={12} r={10} stroke="#D1D5DB" strokeWidth={1.8} fill="#FFFFFF" />
  </Svg>
);

// Arrow Right Button Icon
const ArrowRightIcon = ({ size = 18, color = '#FFFFFF' }: { size?: number; color?: string }) => (
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

export function RoleSelectionScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [selectedRole, setSelectedRole] = useState<'customer' | 'vendor'>('customer');

  const handleContinue = () => {
    navigation.navigate('CreateAccount', { role: selectedRole });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" />

      {/* ======================================================== */}
      {/* 1. FIGMA HEADER (Back Button + Step Pill)                */}
      {/* ======================================================== */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
        >
          <BackArrowIcon size={20} color="#181C1F" />
        </TouchableOpacity>

        <View style={styles.stepPill}>
          <Text style={styles.stepPillText}>STEP 1 OF 2</Text>
        </View>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ======================================================== */}
        {/* 2. HERO HEADING SECTION                                  */}
        {/* ======================================================== */}
        <View style={styles.heroSection}>
          <View style={styles.eyebrowBadge}>
            <Text style={styles.eyebrowText}>HYPERLOCAL COMMERCE</Text>
          </View>
          <Text style={styles.mainTitle}>How would you like to get started?</Text>
          <Text style={styles.mainSubtitle}>
            Select your primary role. You can always switch or add a storefront later from settings.
          </Text>
        </View>

        {/* ======================================================== */}
        {/* 3. CARD 1: CUSTOMER (FIGMA LUXURY SPEC)                  */}
        {/* ======================================================== */}
        <TouchableOpacity
          style={[
            styles.roleCard,
            selectedRole === 'customer'
              ? styles.roleCardCustomerActive
              : styles.roleCardInactive,
          ]}
          activeOpacity={0.9}
          onPress={() => setSelectedRole('customer')}
        >
          {/* Top Accent Indicator Bar */}
          {selectedRole === 'customer' && <View style={styles.accentBarCustomer} />}

          {/* Card Header Row */}
          <View style={styles.cardHeaderRow}>
            <View
              style={[
                styles.iconBox,
                selectedRole === 'customer'
                  ? styles.iconBoxCustomerActive
                  : styles.iconBoxInactive,
              ]}
            >
              <ShopperBagIcon
                size={26}
                color={selectedRole === 'customer' ? '#004BFF' : '#707070'}
              />
            </View>

            <View style={styles.cardTitleColumn}>
              <View style={styles.titleWithBadge}>
                <Text style={styles.cardTitleText}>Customer</Text>
                <View style={styles.badgeCustomer}>
                  <Text style={styles.badgeCustomerText}>Shopper</Text>
                </View>
              </View>
              <Text style={styles.cardTagline}>Order groceries, fresh food & essentials</Text>
            </View>

            {selectedRole === 'customer' ? (
              <RadioChecked color="#004BFF" />
            ) : (
              <RadioUnchecked />
            )}
          </View>

          {/* Hairline Divider */}
          <View style={styles.cardDivider} />

          {/* Key Value Proposition Bullet Points */}
          <View style={styles.benefitsList}>
            <View style={styles.benefitRow}>
              <BulletCheckIcon color="#004BFF" />
              <View style={styles.benefitTextWrap}>
                <Text style={styles.benefitTitle}>15-Minute Express Delivery</Text>
                <Text style={styles.benefitDesc}>Get daily needs delivered to your door fast</Text>
              </View>
            </View>

            <View style={styles.benefitRow}>
              <BulletCheckIcon color="#004BFF" />
              <View style={styles.benefitTextWrap}>
                <Text style={styles.benefitTitle}>Verified Neighborhood Stores</Text>
                <Text style={styles.benefitDesc}>Best local discounts, transparent prices</Text>
              </View>
            </View>

            <View style={styles.benefitRow}>
              <BulletCheckIcon color="#004BFF" />
              <View style={styles.benefitTextWrap}>
                <Text style={styles.benefitTitle}>Live GPS Order Tracking</Text>
                <Text style={styles.benefitDesc}>Real-time delivery partner status & alerts</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* ======================================================== */}
        {/* 4. CARD 2: VENDOR (FIGMA LUXURY SPEC)                    */}
        {/* ======================================================== */}
        <TouchableOpacity
          style={[
            styles.roleCard,
            selectedRole === 'vendor'
              ? styles.roleCardVendorActive
              : styles.roleCardInactive,
          ]}
          activeOpacity={0.9}
          onPress={() => setSelectedRole('vendor')}
        >
          {/* Top Accent Indicator Bar */}
          {selectedRole === 'vendor' && <View style={styles.accentBarVendor} />}

          {/* Card Header Row */}
          <View style={styles.cardHeaderRow}>
            <View
              style={[
                styles.iconBox,
                selectedRole === 'vendor'
                  ? styles.iconBoxVendorActive
                  : styles.iconBoxInactive,
              ]}
            >
              <StorehouseIcon
                size={26}
                color={selectedRole === 'vendor' ? '#FF5790' : '#707070'}
              />
            </View>

            <View style={styles.cardTitleColumn}>
              <View style={styles.titleWithBadge}>
                <Text style={styles.cardTitleText}>Vendor</Text>
                <View style={styles.badgeVendor}>
                  <Text style={styles.badgeVendorText}>Merchant</Text>
                </View>
              </View>
              <Text style={styles.cardTagline}>Sell products & scale neighborhood orders</Text>
            </View>

            {selectedRole === 'vendor' ? (
              <RadioChecked color="#FF5790" />
            ) : (
              <RadioUnchecked />
            )}
          </View>

          {/* Hairline Divider */}
          <View style={styles.cardDivider} />

          {/* Key Value Proposition Bullet Points */}
          <View style={styles.benefitsList}>
            <View style={styles.benefitRow}>
              <BulletCheckIcon color="#FF5790" />
              <View style={styles.benefitTextWrap}>
                <Text style={styles.benefitTitle}>Instant Digital Storefront</Text>
                <Text style={styles.benefitDesc}>List products & start selling with zero fees</Text>
              </View>
            </View>

            <View style={styles.benefitRow}>
              <BulletCheckIcon color="#FF5790" />
              <View style={styles.benefitTextWrap}>
                <Text style={styles.benefitTitle}>Smart Catalog & Inventory</Text>
                <Text style={styles.benefitDesc}>Easily manage stock, discounts & orders</Text>
              </View>
            </View>

            <View style={styles.benefitRow}>
              <BulletCheckIcon color="#FF5790" />
              <View style={styles.benefitTextWrap}>
                <Text style={styles.benefitTitle}>Daily Bank Settlements</Text>
                <Text style={styles.benefitDesc}>100% transparent payouts straight to bank</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* ======================================================== */}
      {/* 5. FIGMA BOTTOM ACTION BAR                               */}
      {/* ======================================================== */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[
            styles.ctaButton,
            selectedRole === 'customer'
              ? styles.ctaButtonCustomer
              : styles.ctaButtonVendor,
          ]}
          activeOpacity={0.88}
          onPress={handleContinue}
        >
          <Text style={styles.ctaButtonText}>
            {selectedRole === 'customer'
              ? 'Continue as Customer'
              : 'Continue as Vendor'}
          </Text>
          <ArrowRightIcon size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBFC',
  },

  /* ------------------------------------------------------------- */
  /* HEADER                                                        */
  /* ------------------------------------------------------------- */
  header: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: '#FAFBFC',
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  stepPill: {
    backgroundColor: '#EEF4FF',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DCE7FF',
  },
  stepPillText: {
    fontFamily: fonts.raleway.bold,
    fontSize: 11,
    color: '#004BFF',
    letterSpacing: 0.8,
  },
  headerSpacer: {
    width: 42,
  },

  /* ------------------------------------------------------------- */
  /* SCROLL CONTENT & HERO SECTION                                 */
  /* ------------------------------------------------------------- */
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  heroSection: {
    marginBottom: 24,
    paddingTop: 4,
  },
  eyebrowBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 75, 255, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 10,
  },
  eyebrowText: {
    fontFamily: fonts.raleway.bold,
    fontSize: 10.5,
    color: '#004BFF',
    letterSpacing: 1.1,
  },
  mainTitle: {
    fontFamily: fonts.raleway.bold,
    fontSize: 27,
    lineHeight: 35,
    color: '#181C1F',
    marginBottom: 8,
    letterSpacing: -0.4,
  },
  mainSubtitle: {
    fontFamily: fonts.nunito.regular,
    fontSize: 14.5,
    lineHeight: 22,
    color: '#707070',
  },

  /* ------------------------------------------------------------- */
  /* FIGMA LUXURY ROLE CARDS                                       */
  /* ------------------------------------------------------------- */
  roleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1.5,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#181C1F',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 2,
  },
  roleCardInactive: {
    borderColor: '#E5E7EB',
    shadowOpacity: 0.04,
  },
  roleCardCustomerActive: {
    borderColor: '#004BFF',
    backgroundColor: '#FFFFFF',
    shadowColor: '#004BFF',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 5,
  },
  roleCardVendorActive: {
    borderColor: '#FF5790',
    backgroundColor: '#FFFFFF',
    shadowColor: '#FF5790',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 5,
  },
  accentBarCustomer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#004BFF',
  },
  accentBarVendor: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#FF5790',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  iconBoxInactive: {
    backgroundColor: '#F3F4F6',
  },
  iconBoxCustomerActive: {
    backgroundColor: '#EEF4FF',
  },
  iconBoxVendorActive: {
    backgroundColor: '#FFF0F5',
  },
  cardTitleColumn: {
    flex: 1,
    paddingRight: 8,
  },
  titleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 3,
  },
  cardTitleText: {
    fontFamily: fonts.raleway.bold,
    fontSize: 18,
    color: '#181C1F',
  },
  badgeCustomer: {
    backgroundColor: '#EEF4FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeCustomerText: {
    fontFamily: fonts.raleway.bold,
    fontSize: 10.5,
    color: '#004BFF',
  },
  badgeVendor: {
    backgroundColor: '#FFF0F5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeVendorText: {
    fontFamily: fonts.raleway.bold,
    fontSize: 10.5,
    color: '#FF5790',
  },
  cardTagline: {
    fontFamily: fonts.nunito.regular,
    fontSize: 12.5,
    color: '#707070',
    lineHeight: 17,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F1F3F5',
    marginVertical: 14,
  },

  /* ------------------------------------------------------------- */
  /* VALUE PROPOSITIONS                                            */
  /* ------------------------------------------------------------- */
  benefitsList: {
    gap: 10,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  benefitTextWrap: {
    flex: 1,
  },
  benefitTitle: {
    fontFamily: fonts.nunito.semiBold,
    fontSize: 13,
    color: '#181C1F',
    lineHeight: 18,
  },
  benefitDesc: {
    fontFamily: fonts.nunito.regular,
    fontSize: 12,
    color: '#8D8D8D',
    lineHeight: 16,
  },

  /* ------------------------------------------------------------- */
  /* BOTTOM BAR & BUTTONS                                          */
  /* ------------------------------------------------------------- */
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F3F5',
  },
  ctaButton: {
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 4,
  },
  ctaButtonCustomer: {
    backgroundColor: '#004BFF',
    shadowColor: '#004BFF',
    shadowOpacity: 0.28,
  },
  ctaButtonVendor: {
    backgroundColor: '#FF5790',
    shadowColor: '#FF5790',
    shadowOpacity: 0.28,
  },
  ctaButtonText: {
    fontFamily: fonts.raleway.bold,
    fontSize: 16,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});

export default RoleSelectionScreen;
