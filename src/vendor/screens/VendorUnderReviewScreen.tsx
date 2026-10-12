import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch } from 'react-redux';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { fonts } from '@/theme/fonts';
import { RootStackParamList } from '@/navigation/types';
import { setAppMode, setApprovalStatus } from '../store/vendorOnboardingSlice';
import { ShoppingBagIcon } from '../components/common/Icons';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ScreenRouteProp = RouteProp<RootStackParamList, 'VendorUnderReview'>;

export function VendorUnderReviewScreen() {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useDispatch();
  const route = useRoute<ScreenRouteProp>();
  const referenceId = route.params?.referenceId || 'LK-VEN-8492';

  const handleGoDashboard = () => {
    dispatch(setApprovalStatus('APPROVED'));
    navigation.navigate('VendorTabs');
  };

  const handleGoHome = () => {
    dispatch(setAppMode('customer'));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Celebration / Under Review Graphic */}
        <View style={styles.graphicWrap}>
          <View style={styles.outerGlow}>
            <View style={styles.innerGlow}>
              <Svg width={44} height={44} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                  stroke="#FF5790"
                  strokeWidth={2}
                  fill="#FFF0F5"
                />
                <Path
                  d="M12 8v5l3 3"
                  stroke="#FF5790"
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              </Svg>
            </View>
          </View>
        </View>

        {/* Title & Eyebrow */}
        <View style={styles.statusPill}>
          <View style={styles.statusDot} />
          <Text style={styles.statusPillText}>APPLICATION UNDER REVIEW</Text>
        </View>

        <Text style={styles.title}>Submitted for Verification!</Text>
        <Text style={styles.subtitle}>
          Your merchant application is under express review. Hyperlocal onboarding is typically approved within 2–4 hours.
        </Text>

        {/* Reference ID Card */}
        <View style={styles.referenceCard}>
          <View style={styles.refRow}>
            <Text style={styles.refKey}>Reference Number</Text>
            <Text style={styles.refVal}>{referenceId}</Text>
          </View>
          <View style={styles.refRow}>
            <Text style={styles.refKey}>Estimated Approval</Text>
            <Text style={[styles.refVal, styles.pinkText]}>Today by 9:00 PM</Text>
          </View>
          <View style={styles.refRow}>
            <Text style={styles.refKey}>SMS / WhatsApp Updates</Text>
            <Text style={[styles.refVal, styles.greenText]}>✓ Enabled</Text>
          </View>
        </View>

        {/* Verification Pipeline Checklist */}
        <View style={styles.timelineBox}>
          <Text style={styles.timelineHeading}>Verification Pipeline</Text>

          <View style={styles.timelineItem}>
            <View style={styles.timelineIconDone}>
              <Text style={styles.checkIcon}>✓</Text>
            </View>
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTitle}>Store & Identity Setup</Text>
              <Text style={styles.timelineDesc}>Submitted successfully</Text>
            </View>
            <View style={styles.doneBadge}>
              <Text style={styles.doneBadgeText}>DONE</Text>
            </View>
          </View>

          <View style={styles.timelineLine} />

          <View style={styles.timelineItem}>
            <View style={styles.timelineIconActive}>
              <Text style={styles.activeIcon}>⏳</Text>
            </View>
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTitle}>PAN & KYC Compliance</Text>
              <Text style={styles.timelineDesc}>Document verification in progress</Text>
            </View>
            <View style={styles.reviewBadge}>
              <Text style={styles.reviewBadgeText}>REVIEW</Text>
            </View>
          </View>

          <View style={styles.timelineLine} />

          <View style={styles.timelineItem}>
            <View style={styles.timelineIconPending}>
              <Text style={styles.pendingDot}>•</Text>
            </View>
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTitle}>Store Activation</Text>
              <Text style={styles.timelineDesc}>Hyperlocal express catalog goes live</Text>
            </View>
            <View style={styles.waitBadge}>
              <Text style={styles.waitBadgeText}>PENDING</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonSection}>
          <TouchableOpacity
            style={styles.ctaButton}
            activeOpacity={0.88}
            onPress={handleGoDashboard}
          >
            <Text style={styles.ctaButtonText}>Explore Seller Dashboard</Text>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Path
                d="M5 12h14M12 5l7 7-7 7"
                stroke="#FFFFFF"
                strokeWidth={2.2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.outlineButton}
            activeOpacity={0.8}
            onPress={handleGoHome}
          >
            <ShoppingBagIcon size={18} color="#707070" />
            <Text style={styles.outlineButtonText}>Continue to Customer Shopping</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBFC',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 36,
    alignItems: 'center',
  },
  graphicWrap: {
    marginBottom: 20,
    marginTop: 10,
  },
  outerGlow: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FFF0F5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFD6E5',
  },
  innerGlow: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF5790',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    borderWidth: 1,
    borderColor: '#FFE082',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    marginBottom: 12,
    gap: 6,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#FFA000',
  },
  statusPillText: {
    fontFamily: fonts.raleway.bold,
    fontSize: 10.5,
    color: '#FF8F00',
    letterSpacing: 0.8,
  },
  title: {
    fontFamily: fonts.raleway.bold,
    fontSize: 25,
    lineHeight: 32,
    color: '#181C1F',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: fonts.nunito.regular,
    fontSize: 14,
    lineHeight: 21,
    color: '#707070',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  referenceCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    gap: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  refRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  refKey: {
    fontFamily: fonts.nunito.regular,
    fontSize: 13,
    color: '#707070',
  },
  refVal: {
    fontFamily: fonts.nunito.bold,
    fontSize: 13.5,
    color: '#181C1F',
  },
  pinkText: {
    color: '#FF5790',
  },
  greenText: {
    color: '#17BE5A',
  },
  timelineBox: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 28,
  },
  timelineHeading: {
    fontFamily: fonts.raleway.bold,
    fontSize: 14.5,
    color: '#181C1F',
    marginBottom: 14,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timelineIconDone: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EDFDF2',
    borderWidth: 1.5,
    borderColor: '#17BE5A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkIcon: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#17BE5A',
  },
  timelineIconActive: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFF0F5',
    borderWidth: 1.5,
    borderColor: '#FF5790',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIcon: {
    fontSize: 12,
  },
  timelineIconPending: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pendingDot: {
    fontSize: 16,
    color: '#8D8D8D',
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontFamily: fonts.nunito.bold,
    fontSize: 13,
    color: '#181C1F',
  },
  timelineDesc: {
    fontFamily: fonts.nunito.regular,
    fontSize: 11.5,
    color: '#707070',
    marginTop: 1,
  },
  timelineLine: {
    width: 2,
    height: 16,
    backgroundColor: '#E5E7EB',
    marginLeft: 13,
    marginVertical: 4,
  },
  doneBadge: {
    backgroundColor: '#EDFDF2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  doneBadgeText: {
    fontFamily: fonts.raleway.bold,
    fontSize: 9.5,
    color: '#17BE5A',
  },
  reviewBadge: {
    backgroundColor: '#FFF0F5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  reviewBadgeText: {
    fontFamily: fonts.raleway.bold,
    fontSize: 9.5,
    color: '#FF5790',
  },
  waitBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  waitBadgeText: {
    fontFamily: fonts.raleway.bold,
    fontSize: 9.5,
    color: '#8D8D8D',
  },
  buttonSection: {
    width: '100%',
    gap: 12,
  },
  ctaButton: {
    height: 54,
    borderRadius: 16,
    backgroundColor: '#FF5790',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#FF5790',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 4,
  },
  ctaButtonText: {
    fontFamily: fonts.raleway.bold,
    fontSize: 16,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  outlineButton: {
    height: 52,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  outlineButtonText: {
    fontFamily: fonts.nunito.bold,
    fontSize: 15,
    color: '#707070',
  },
});

export default VendorUnderReviewScreen;
