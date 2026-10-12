import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { fonts } from '@/theme/fonts';
import { RootState } from '@/store';
import {
  WalletTabIcon,
  TrendingUpIcon,
  CheckCircleIcon,
  ChevronRightIcon,
} from '../components/common/Icons';

interface PayoutTransaction {
  id: string;
  referenceNo: string;
  amount: number;
  date: string;
  status: 'completed' | 'processing' | 'failed';
  bankAccount: string;
}

const SETTLEMENT_HISTORY: PayoutTransaction[] = [
  {
    id: 'tx-1',
    referenceNo: 'SETTLE-IND-9021',
    amount: 4850,
    date: 'Yesterday, 11:30 PM',
    status: 'completed',
    bankAccount: 'HDFC Bank •• 4912',
  },
  {
    id: 'tx-2',
    referenceNo: 'SETTLE-IND-8940',
    amount: 6200,
    date: '04 Oct 2026, 11:30 PM',
    status: 'completed',
    bankAccount: 'HDFC Bank •• 4912',
  },
  {
    id: 'tx-3',
    referenceNo: 'SETTLE-IND-8812',
    amount: 3450,
    date: '03 Oct 2026, 11:30 PM',
    status: 'completed',
    bankAccount: 'HDFC Bank •• 4912',
  },
  {
    id: 'tx-4',
    referenceNo: 'SETTLE-IND-8700',
    amount: 5120,
    date: '02 Oct 2026, 11:30 PM',
    status: 'completed',
    bankAccount: 'HDFC Bank •• 4912',
  },
];

export function VendorWalletScreen() {
  const bankData = useSelector(
    (state: RootState) => state.vendorOnboarding.bank
  );
  const [balance] = useState(3840);
  const [todayEarnings] = useState(1280);
  const [weekEarnings] = useState(19620);

  const bankName = bankData.bankName || 'State Bank of India';
  const lastFour = bankData.accountNumber
    ? bankData.accountNumber.slice(-4)
    : '4912';

  const handleRequestPayout = () => {
    Alert.alert(
      'Payout Request',
      `Instant settlement of ₹${balance.toLocaleString()} has been queued to ${bankName} (•• ${lastFour}). Funds arrive within 15 minutes via IMPS.`,
      [{ text: 'Great' }]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Merchant Wallet & Payouts</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Balance Hero Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeaderRow}>
            <View>
              <Text style={styles.balanceLabel}>Available for Settlement</Text>
              <Text style={styles.balanceAmount}>
                ₹{balance.toLocaleString()}
              </Text>
            </View>
            <View style={styles.walletIconCircle}>
              <WalletTabIcon size={24} color="#FF5790" />
            </View>
          </View>

          <View style={styles.balanceDivider} />

          {/* Sub metrics */}
          <View style={styles.subMetricsRow}>
            <View style={styles.subMetricItem}>
              <Text style={styles.subMetricLabel}>Today's Earnings</Text>
              <View style={styles.earningsWrap}>
                <TrendingUpIcon size={14} color="#17BE5A" />
                <Text style={styles.subMetricValue}>
                  ₹{todayEarnings.toLocaleString()}
                </Text>
              </View>
            </View>
            <View style={styles.verticalSep} />
            <View style={styles.subMetricItem}>
              <Text style={styles.subMetricLabel}>This Week Net</Text>
              <Text style={styles.subMetricValue}>
                ₹{weekEarnings.toLocaleString()}
              </Text>
            </View>
          </View>

          {/* Instant Payout Button */}
          <TouchableOpacity
            style={styles.payoutButton}
            activeOpacity={0.85}
            onPress={handleRequestPayout}
          >
            <Text style={styles.payoutButtonText}>Request Instant Payout</Text>
          </TouchableOpacity>
        </View>

        {/* Linked Settlement Account */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Settlement Bank Account</Text>
        </View>

        <View style={styles.bankCard}>
          <View style={styles.bankIconWrap}>
            <Text style={{ fontSize: 22 }}>🏦</Text>
          </View>
          <View style={styles.bankDetails}>
            <Text style={styles.bankNameText}>{bankName}</Text>
            <Text style={styles.accountNumberText}>
              A/C •••• {lastFour} • {bankData.ifscCode || 'SBIN0001244'}
            </Text>
            <View style={styles.verifiedRow}>
              <CheckCircleIcon size={12} color="#17BE5A" />
              <Text style={styles.verifiedText}>Penny Drop Verified</Text>
            </View>
          </View>
          <ChevronRightIcon size={18} color="#8E8E93" />
        </View>

        {/* Settlement Cycle Notice */}
        <View style={styles.cycleNotice}>
          <Text style={styles.cycleNoticeTitle}>T+0 Daily Auto-Settlement</Text>
          <Text style={styles.cycleNoticeDesc}>
            All completed customer orders are automatically settled to your verified bank account everyday at 11:30 PM with zero transfer fees.
          </Text>
        </View>

        {/* Settlement History */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Settlements</Text>
        </View>

        <View style={styles.historyList}>
          {SETTLEMENT_HISTORY.map((item) => (
            <View key={item.id} style={styles.txCard}>
              <View style={styles.txLeft}>
                <View style={styles.txStatusIcon}>
                  <CheckCircleIcon size={16} color="#17BE5A" />
                </View>
                <View>
                  <Text style={styles.txRef}>{item.referenceNo}</Text>
                  <Text style={styles.txDate}>{item.date}</Text>
                  <Text style={styles.txBank}>{item.bankAccount}</Text>
                </View>
              </View>
              <View style={styles.txRight}>
                <Text style={styles.txAmount}>+₹{item.amount}</Text>
                <View style={styles.completedBadge}>
                  <Text style={styles.completedBadgeText}>COMPLETED</Text>
                </View>
              </View>
            </View>
          ))}
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
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F5',
  },
  headerTitle: {
    fontFamily: fonts.raleway.bold,
    fontSize: 20,
    color: '#181C1F',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 36,
  },
  balanceCard: {
    backgroundColor: '#FFF0F5',
    borderWidth: 1.2,
    borderColor: '#FFD6E5',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#FF5790',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  balanceHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  balanceLabel: {
    fontFamily: fonts.nunito.regular,
    fontSize: 13,
    color: '#707070',
    marginBottom: 4,
  },
  balanceAmount: {
    fontFamily: fonts.raleway.bold,
    fontSize: 32,
    color: '#181C1F',
  },
  walletIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFD6E5',
  },
  balanceDivider: {
    height: 1,
    backgroundColor: '#FFD6E5',
    marginVertical: 16,
  },
  subMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  subMetricItem: {
    flex: 1,
  },
  subMetricLabel: {
    fontFamily: fonts.nunito.regular,
    fontSize: 12,
    color: '#707070',
    marginBottom: 3,
  },
  earningsWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  subMetricValue: {
    fontFamily: fonts.raleway.bold,
    fontSize: 17,
    color: '#181C1F',
  },
  verticalSep: {
    width: 1,
    backgroundColor: '#FFD6E5',
    marginHorizontal: 16,
  },
  payoutButton: {
    backgroundColor: '#FF5790',
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payoutButtonText: {
    fontFamily: fonts.raleway.bold,
    fontSize: 14,
    color: '#FFFFFF',
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: fonts.raleway.bold,
    fontSize: 16,
    color: '#181C1F',
  },
  bankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  bankIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5F6F8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  bankDetails: {
    flex: 1,
  },
  bankNameText: {
    fontFamily: fonts.raleway.bold,
    fontSize: 15,
    color: '#181C1F',
  },
  accountNumberText: {
    fontFamily: fonts.nunito.regular,
    fontSize: 12,
    color: '#707070',
    marginTop: 2,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  verifiedText: {
    fontFamily: fonts.nunito.bold,
    fontSize: 11,
    color: '#17BE5A',
  },
  cycleNotice: {
    backgroundColor: '#F0F4FE',
    borderWidth: 1,
    borderColor: '#D4E2FC',
    borderRadius: 14,
    padding: 14,
    marginBottom: 24,
  },
  cycleNoticeTitle: {
    fontFamily: fonts.nunito.bold,
    fontSize: 13,
    color: '#004BFF',
    marginBottom: 4,
  },
  cycleNoticeDesc: {
    fontFamily: fonts.nunito.regular,
    fontSize: 12,
    color: '#506690',
    lineHeight: 17,
  },
  historyList: {
    gap: 12,
  },
  txCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    padding: 14,
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  txStatusIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8FBF0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  txRef: {
    fontFamily: fonts.nunito.bold,
    fontSize: 13,
    color: '#181C1F',
  },
  txDate: {
    fontFamily: fonts.nunito.regular,
    fontSize: 11.5,
    color: '#707070',
    marginTop: 2,
  },
  txBank: {
    fontFamily: fonts.nunito.regular,
    fontSize: 11,
    color: '#8E8E93',
  },
  txRight: {
    alignItems: 'flex-end',
  },
  txAmount: {
    fontFamily: fonts.raleway.bold,
    fontSize: 16,
    color: '#17BE5A',
  },
  completedBadge: {
    backgroundColor: '#E8FBF0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  completedBadgeText: {
    fontFamily: fonts.nunito.bold,
    fontSize: 9.5,
    color: '#17BE5A',
  },
});

export default VendorWalletScreen;
