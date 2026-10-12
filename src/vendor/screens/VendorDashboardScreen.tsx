import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSelector, useDispatch } from 'react-redux';
import Svg, { Path, Circle } from 'react-native-svg';
import { fonts } from '@/theme/fonts';
import { RootState } from '@/store';
import { RootStackParamList } from '@/navigation/types';
import { StoreProfileState } from '../types/storeProfile';
import { useStoreStatus } from '../hooks/useStoreStatus';
import {
  setTemporaryClosure,
  clearTemporaryClosure,
  setManualOverride,
} from '../store/vendorStoreSlice';
import { TemporaryClosureModal } from '../components/profile/TemporaryClosureModal';
import { StorefrontIcon } from '../components/common/Icons';
import { PackagePlus, Settings, ChartNoAxesCombined, MessageSquare } from 'lucide-react-native';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function VendorDashboardScreen() {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useDispatch();

  const storeProfile = useSelector(
    (state: RootState) => (state as any).vendorStore as StoreProfileState
  );
  const onboarding = useSelector((state: RootState) => state.vendorOnboarding);

  const storeName = storeProfile?.storeName || onboarding.business.storeName || 'Sharma Fresh Mart';
  const category = storeProfile?.category || onboarding.business.category || 'Groceries & Daily Needs';
  const logoUri = storeProfile?.logoUri;

  // Auto-calculated operational store status
  const storeStatus = useStoreStatus();
  const [closureModalVisible, setClosureModalVisible] = useState(false);

  // Unread customer messages count
  const chatList = useSelector((state: RootState) => (state as any).chat?.chatList || []);
  const totalUnreadChats = (chatList as any[]).reduce(
    (acc: number, c: any) => acc + (c.unread_count || 0),
    0
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" />

      {/* 1. Header Bar with Real Store Identity & Dynamic Operational Status */}
      <View style={styles.header}>
        <View style={styles.storeHeaderLeft}>
          <View style={styles.storeAvatarBox}>
            {logoUri ? (
              <FastImage
                source={{
                  uri: logoUri,
                  priority: FastImage.priority.high,
                  cache: FastImage.cacheControl.immutable,
                }}
                style={styles.storeLogoThumb}
                resizeMode={FastImage.resizeMode.cover}
              />
            ) : (
              <StorefrontIcon size={24} color="#FF5790" />
            )}
          </View>
          <View style={styles.storeMetaCol}>
            <Text style={styles.storeTitle} numberOfLines={1}>
              {storeName}
            </Text>
            <Text style={styles.storeCategory}>{category}</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {/* Dynamic Operational Status Pill (Doc #31.17) */}
          <TouchableOpacity
            style={[styles.statusPillBtn, { borderColor: storeStatus.color }]}
            activeOpacity={0.8}
            onPress={() => setClosureModalVisible(true)}
          >
            <View style={[styles.statusLiveDot, { backgroundColor: storeStatus.color }]} />
            <View style={styles.statusPillTextWrap}>
              <Text style={[styles.statusPillTitle, { color: storeStatus.color }]}>
                {storeStatus.badgeLabel}
              </Text>
              <Text style={styles.statusPillSub} numberOfLines={1}>
                {storeStatus.statusSubtitle}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Customer Messages Shortcut */}
          <TouchableOpacity
            style={styles.headerChatBtn}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('ChatList')}
            accessibilityLabel="Customer Messages"
          >
            <MessageSquare size={19} color="#FF5790" />
            {totalUnreadChats > 0 && (
              <View style={styles.chatBadge}>
                <Text style={styles.chatBadgeText}>
                  {totalUnreadChats > 99 ? '99+' : totalUnreadChats}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Verification Status Banner */}
        <View style={styles.alertBanner}>
          <View style={styles.alertIcon}>
            <Text style={{ fontSize: 16 }}>⏳</Text>
          </View>
          <View style={styles.alertTextWrap}>
            <Text style={styles.alertTitle}>Verification Under Review</Text>
            <Text style={styles.alertDesc}>
              Preview mode active. Live customer orders will begin once documents are verified today.
            </Text>
          </View>
        </View>

        {/* 2. Today's Hyperlocal Metrics Grid */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Overview</Text>
          <Text style={styles.sectionMeta}>Indore Ward 12</Text>
        </View>

        <View style={styles.metricsGrid}>
          {/* Metric 1: Sales */}
          <View style={[styles.metricCard, styles.metricCardPrimary]}>
            <Text style={styles.metricLabel}>Today's Revenue</Text>
            <Text style={styles.metricValPrimary}>₹0.00</Text>
            <Text style={styles.metricSub}>0 orders completed</Text>
          </View>

          {/* Metric 2: Pending Orders */}
          <TouchableOpacity
            style={styles.metricCard}
            activeOpacity={0.8}
            onPress={() => (navigation as any).navigate('VendorOrders')}
          >
            <Text style={styles.metricLabel}>Active Orders</Text>
            <Text style={styles.metricVal}>4</Text>
            <Text style={styles.metricSubGreen}>Ready for pickup: 1</Text>
          </TouchableOpacity>

          {/* Metric 3: Available Payout */}
          <TouchableOpacity
            style={styles.metricCard}
            activeOpacity={0.8}
            onPress={() => (navigation as any).navigate('VendorWallet')}
          >
            <Text style={styles.metricLabel}>Settlement Balance</Text>
            <Text style={styles.metricVal}>₹3,840</Text>
            <Text style={styles.metricSub}>Next payout: Tonight</Text>
          </TouchableOpacity>

          {/* Metric 4: Inventory Alert */}
          <TouchableOpacity
            style={styles.metricCard}
            activeOpacity={0.8}
            onPress={() => (navigation as any).navigate('VendorProducts')}
          >
            <Text style={styles.metricLabel}>Total Products</Text>
            <Text style={styles.metricVal}>6</Text>
            <Text style={styles.metricSubPink}>Manage catalog</Text>
          </TouchableOpacity>
        </View>

        {/* 3. Quick Action Hub */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Merchant Quick Actions</Text>
        </View>

        <View style={styles.actionGrid}>
          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.8}
            onPress={() => (navigation as any).navigate('VendorProducts')}
          >
            <View style={styles.actionIconWrap}>
              <PackagePlus size={22} color="#FF5790" strokeWidth={1.8} />
            </View>
            <Text style={styles.actionTitle}>Add Product</Text>
            <Text style={styles.actionDesc}>Upload items & pricing</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.8}
            onPress={() => (navigation as any).navigate('VendorInventory')}
          >
            <View style={styles.actionIconWrap}>
              <ChartNoAxesCombined size={22} color="#FF5790" strokeWidth={1.8} />
            </View>
            <Text style={styles.actionTitle}>Inventory</Text>
            <Text style={styles.actionDesc}>Stock & low-stock alerts</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.8}
            onPress={() => (navigation as any).navigate('VendorWallet')}
          >
            <View style={styles.actionIconWrap}>
              <Text style={{ fontSize: 20 }}>💳</Text>
            </View>
            <Text style={styles.actionTitle}>Payouts</Text>
            <Text style={styles.actionDesc}>Bank settlements</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.8}
            onPress={() => (navigation as any).navigate('VendorStore')}
          >
            <View style={styles.actionIconWrap}>
              <Settings size={22} color="#FF5790" strokeWidth={1.8} />
            </View>
            <Text style={styles.actionTitle}>Store Settings</Text>
            <Text style={styles.actionDesc}>Hours & radius</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.8}
            onPress={() => (navigation as any).navigate('ChatList')}
          >
            <View style={styles.actionIconWrap}>
              <MessageSquare size={22} color="#FF5790" strokeWidth={1.8} />
            </View>
            <Text style={styles.actionTitle}>Customer Chats</Text>
            <Text style={styles.actionDesc}>Inquiries & orders</Text>
          </TouchableOpacity>
        </View>

        {/* 4. Active Orders Placeholder Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Incoming Orders</Text>
        </View>

        <View style={styles.emptyOrdersCard}>
          <Text style={{ fontSize: 32, marginBottom: 8 }}>🛵</Text>
          <Text style={styles.emptyOrdersTitle}>No Live Orders Yet</Text>
          <Text style={styles.emptyOrdersSub}>
            As soon as verification completes and customers order within your {onboarding.address.deliveryRadiusKm} km radius, new orders will pop up here with real-time sound alerts.
          </Text>
        </View>
      </ScrollView>

      {/* Emergency Closure Controls Modal */}
      {storeProfile && (
        <TemporaryClosureModal
          visible={closureModalVisible}
          isCurrentlyClosed={storeProfile.temporaryClosure?.isActive || false}
          currentLabel={storeProfile.temporaryClosure?.label}
          onClose={() => setClosureModalVisible(false)}
          onApplyClosure={(reason, mins) =>
            dispatch(setTemporaryClosure({ reason, durationMinutes: mins }))
          }
          onClearClosure={() => dispatch(clearTemporaryClosure())}
          onApplyOpenOverride={(mins) =>
            dispatch(setManualOverride({ durationMinutes: mins }))
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F5',
  },
  storeHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  storeAvatarBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFF0F5',
    borderWidth: 1.2,
    borderColor: '#FFD6E5',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  storeLogoThumb: {
    width: '100%',
    height: '100%',
  },
  storeMetaCol: {
    flex: 1,
  },
  storeTitle: {
    fontFamily: fonts.raleway.bold,
    fontSize: 15,
    color: '#181C1F',
    maxWidth: 160,
  },
  storeCategory: {
    fontFamily: fonts.nunito.regular,
    fontSize: 11.5,
    color: '#707070',
  },
  statusPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FAFBFC',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    maxWidth: 160,
  },
  headerChatBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FFF0F5',
    borderWidth: 1,
    borderColor: '#FFD6E5',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  chatBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FF5790',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  chatBadgeText: {
    fontFamily: fonts.raleway.bold,
    fontSize: 9,
    color: '#FFFFFF',
  },
  statusLiveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusPillTextWrap: {
    flexShrink: 1,
  },
  statusPillTitle: {
    fontFamily: fonts.raleway.bold,
    fontSize: 11,
    letterSpacing: 0.5,
  },
  statusPillSub: {
    fontFamily: fonts.nunito.regular,
    fontSize: 9.5,
    color: '#707070',
  },
  toggleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  toggleLabel: {
    fontFamily: fonts.raleway.bold,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  toggleLabelOpen: {
    color: '#17BE5A',
  },
  toggleLabelClosed: {
    color: '#707070',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 36,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    borderWidth: 1.2,
    borderColor: '#FFE082',
    borderRadius: 14,
    padding: 12,
    marginBottom: 20,
    gap: 12,
  },
  alertIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertTextWrap: {
    flex: 1,
  },
  alertTitle: {
    fontFamily: fonts.nunito.bold,
    fontSize: 13,
    color: '#FF8F00',
  },
  alertDesc: {
    fontFamily: fonts.nunito.regular,
    fontSize: 11.5,
    color: '#707070',
    marginTop: 2,
    lineHeight: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: fonts.raleway.bold,
    fontSize: 16,
    color: '#181C1F',
  },
  sectionMeta: {
    fontFamily: fonts.nunito.regular,
    fontSize: 12,
    color: '#707070',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  metricCardPrimary: {
    borderColor: '#FFD6E5',
    backgroundColor: '#FFF0F5',
  },
  metricLabel: {
    fontFamily: fonts.nunito.regular,
    fontSize: 12,
    color: '#707070',
    marginBottom: 6,
  },
  metricVal: {
    fontFamily: fonts.raleway.bold,
    fontSize: 22,
    color: '#181C1F',
    marginBottom: 4,
  },
  metricValPrimary: {
    fontFamily: fonts.raleway.bold,
    fontSize: 22,
    color: '#FF5790',
    marginBottom: 4,
  },
  metricSub: {
    fontFamily: fonts.nunito.regular,
    fontSize: 11,
    color: '#8D8D8D',
  },
  metricSubGreen: {
    fontFamily: fonts.nunito.bold,
    fontSize: 11,
    color: '#17BE5A',
  },
  metricSubPink: {
    fontFamily: fonts.nunito.bold,
    fontSize: 11,
    color: '#FF5790',
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    gap: 4,
  },
  actionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FAFBFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  actionTitle: {
    fontFamily: fonts.nunito.bold,
    fontSize: 14,
    color: '#181C1F',
  },
  actionDesc: {
    fontFamily: fonts.nunito.regular,
    fontSize: 11,
    color: '#8D8D8D',
  },
  emptyOrdersCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyOrdersTitle: {
    fontFamily: fonts.raleway.bold,
    fontSize: 16,
    color: '#181C1F',
    marginBottom: 4,
  },
  emptyOrdersSub: {
    fontFamily: fonts.nunito.regular,
    fontSize: 12.5,
    color: '#707070',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default VendorDashboardScreen;
