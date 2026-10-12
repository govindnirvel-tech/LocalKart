import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { fonts } from '@/theme/fonts';
import { VendorOnboardingState } from '../../types/onboarding';

interface ReviewSubmitStepProps {
  state: VendorOnboardingState;
  onGoToStep: (step: number) => void;
  onTermsToggle: () => void;
  onSubmit: () => void;
  onPrev: () => void;
}

export const ReviewSubmitStep = ({
  state,
  onGoToStep,
  onTermsToggle,
  onSubmit,
  onPrev,
}: ReviewSubmitStepProps) => {
  const { business, address, documents, bank, termsAccepted } = state;

  // Masked bank account
  const maskedAcc =
    bank.accountNumber.length > 4
      ? `•••• •••• ${bank.accountNumber.slice(-4)}`
      : '•••• •••• 4589';

  const maskedPan =
    documents.panNumber.length === 10
      ? `${documents.panNumber.slice(0, 5)}••••${documents.panNumber.slice(-1)}`
      : 'ABCDE••••F';

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Eyebrow & Hero Header */}
      <View style={styles.eyebrowBadge}>
        <Text style={styles.eyebrowText}>STEP 5 · FINAL REVIEW</Text>
      </View>
      <Text style={styles.title}>Review & Submit</Text>
      <Text style={styles.subtitle}>
        Verify your store, fulfillment and bank details before submitting to LocalKart.
      </Text>

      {/* 1. Store Summary Card */}
      <View style={styles.reviewCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardHeaderTitle}>🏪 Store Identity</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => onGoToStep(1)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.divider} />
        <View style={styles.fieldRow}>
          <Text style={styles.fieldKey}>Store Name</Text>
          <Text style={styles.fieldVal}>{business.storeName || 'My Store'}</Text>
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.fieldKey}>Category</Text>
          <Text style={styles.fieldVal}>{business.category}</Text>
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.fieldKey}>Structure</Text>
          <Text style={styles.fieldVal}>
            {business.businessType === 'individual'
              ? 'Individual / Proprietor'
              : business.businessType.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* 2. Hyperlocal Address Summary Card */}
      <View style={styles.reviewCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardHeaderTitle}>📍 Hyperlocal Location</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => onGoToStep(2)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.divider} />
        <View style={styles.fieldRow}>
          <Text style={styles.fieldKey}>Shop Address</Text>
          <Text style={[styles.fieldVal, styles.fieldValAddress]}>
            {address.addressLine1 || 'Shop Address'}, {address.city || 'Indore'} ({address.pincode || '452001'})
          </Text>
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.fieldKey}>Express Radius</Text>
          <Text style={[styles.fieldVal, styles.highlightVal]}>
            ⚡ {address.deliveryRadiusKm} KM Zone (15-20 Min)
          </Text>
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.fieldKey}>Min Order Value</Text>
          <Text style={styles.fieldVal}>₹{address.minOrderAmount}</Text>
        </View>
      </View>

      {/* 3. Tax & Legal Summary Card */}
      <View style={styles.reviewCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardHeaderTitle}>⚖️ Compliance & KYC</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => onGoToStep(3)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.divider} />
        <View style={styles.fieldRow}>
          <Text style={styles.fieldKey}>PAN Number</Text>
          <Text style={styles.fieldValMono}>{maskedPan}</Text>
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.fieldKey}>PAN Proof</Text>
          <Text style={[styles.fieldVal, styles.greenText]}>
            {documents.panVerified ? '✓ NSDL Protean Verified' : '✓ Attached'}
          </Text>
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.fieldKey}>GST Status</Text>
          <Text style={[styles.fieldVal, documents.gstVerified ? styles.greenText : null]}>
            {documents.gstVerified
              ? '✓ GSTN Active Entity'
              : documents.gstin
              ? documents.gstin
              : 'Exempted / Turnover < 40L'}
          </Text>
        </View>
      </View>

      {/* 4. Bank Account Summary Card */}
      <View style={styles.reviewCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardHeaderTitle}>💳 Settlement Account</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => onGoToStep(4)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.divider} />
        <View style={styles.fieldRow}>
          <Text style={styles.fieldKey}>Beneficiary</Text>
          <Text style={styles.fieldVal}>
            {bank.pennyDropBeneficiary || bank.accountHolderName || 'Account Holder'}
          </Text>
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.fieldKey}>Account No.</Text>
          <Text style={styles.fieldValMono}>{maskedAcc}</Text>
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.fieldKey}>IFSC Code</Text>
          <Text style={styles.fieldValMono}>{bank.ifscCode || 'HDFC0001234'}</Text>
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.fieldKey}>Penny Drop Check</Text>
          <Text style={[styles.fieldVal, styles.greenText]}>
            {bank.pennyDropStatus === 'SUCCESS'
              ? '✓ NPCI ₹1 IMPS Verified'
              : 'Pending Verification'}
          </Text>
        </View>
      </View>

      {/* Terms & Conditions Acceptance Checkbox */}
      <TouchableOpacity
        style={styles.termsBox}
        activeOpacity={0.8}
        onPress={onTermsToggle}
      >
        <View
          style={[
            styles.checkboxBox,
            termsAccepted && styles.checkboxBoxChecked,
          ]}
        >
          {termsAccepted && (
            <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
              <Path
                d="M20 6L9 17l-5-5"
                stroke="#FFFFFF"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          )}
        </View>
        <Text style={styles.termsText}>
          I agree to the LocalKart Merchant Terms, Express SLA guidelines, and automated payout schedule.
        </Text>
      </TouchableOpacity>

      {/* Navigation Buttons Row */}
      <View style={styles.buttonsRow}>
        <TouchableOpacity
          style={styles.backStepButton}
          activeOpacity={0.7}
          onPress={onPrev}
        >
          <Text style={styles.backStepText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.ctaButton, !termsAccepted && styles.ctaButtonDisabled]}
          activeOpacity={0.88}
          disabled={!termsAccepted}
          onPress={onSubmit}
        >
          <Text style={styles.ctaButtonText}>Submit Application</Text>
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
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 36,
  },
  eyebrowBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF0F5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#FFD6E5',
  },
  eyebrowText: {
    fontFamily: fonts.raleway.bold,
    fontSize: 10.5,
    color: '#FF5790',
    letterSpacing: 1,
  },
  title: {
    fontFamily: fonts.raleway.bold,
    fontSize: 26,
    lineHeight: 33,
    color: '#181C1F',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontFamily: fonts.nunito.regular,
    fontSize: 14,
    lineHeight: 20,
    color: '#707070',
    marginBottom: 20,
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: '#E5E7EB',
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardHeaderTitle: {
    fontFamily: fonts.raleway.bold,
    fontSize: 15,
    color: '#181C1F',
  },
  editText: {
    fontFamily: fonts.nunito.bold,
    fontSize: 13,
    color: '#FF5790',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F3F5',
    marginBottom: 10,
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 4,
  },
  fieldKey: {
    fontFamily: fonts.nunito.regular,
    fontSize: 13,
    color: '#707070',
    width: 110,
  },
  fieldVal: {
    flex: 1,
    fontFamily: fonts.nunito.bold,
    fontSize: 13.5,
    color: '#181C1F',
    textAlign: 'right',
  },
  fieldValAddress: {
    fontSize: 12.5,
    lineHeight: 17,
  },
  fieldValMono: {
    flex: 1,
    fontFamily: fonts.nunito.bold,
    fontSize: 13.5,
    color: '#181C1F',
    textAlign: 'right',
    letterSpacing: 0.8,
  },
  highlightVal: {
    color: '#FF5790',
  },
  greenText: {
    color: '#17BE5A',
  },
  termsBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF0F5',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FFD6E5',
    padding: 14,
    gap: 12,
    marginTop: 6,
    marginBottom: 16,
  },
  checkboxBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.8,
    borderColor: '#FF5790',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginTop: 2,
  },
  checkboxBoxChecked: {
    backgroundColor: '#FF5790',
  },
  termsText: {
    flex: 1,
    fontFamily: fonts.nunito.regular,
    fontSize: 12.5,
    lineHeight: 18,
    color: '#181C1F',
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  backStepButton: {
    width: 90,
    height: 54,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backStepText: {
    fontFamily: fonts.nunito.bold,
    fontSize: 15,
    color: '#707070',
  },
  ctaButton: {
    flex: 1,
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
  ctaButtonDisabled: {
    backgroundColor: '#F3C5D5',
    shadowOpacity: 0,
    elevation: 0,
  },
  ctaButtonText: {
    fontFamily: fonts.raleway.bold,
    fontSize: 16,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});
