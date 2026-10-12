import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { fonts } from '@/theme/fonts';
import { VendorBankData } from '../../types/onboarding';
import { PennyDropModal } from '../common/PennyDropModal';

interface BankPayoutStepProps {
  data: VendorBankData;
  onChange: (fields: Partial<VendorBankData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const BankPayoutStep = ({
  data,
  onChange,
  onNext,
  onPrev,
}: BankPayoutStepProps) => {
  const [showPennyModal, setShowPennyModal] = useState(false);

  const isAccountMatch =
    data.accountNumber.length >= 9 &&
    data.accountNumber === data.confirmAccountNumber;

  const isIfscValid = data.ifscCode.trim().length === 11;

  const isValid =
    data.accountHolderName.trim().length >= 3 &&
    isAccountMatch &&
    isIfscValid;

  const handleAttachCheque = () => {
    setShowPennyModal(true);
  };

  const handlePennyDropSuccess = (result: {
    chequeDocName: string;
    verifiedBankName: string;
    beneficiaryName: string;
    pennyDropStatus: 'SUCCESS';
    utrNumber: string;
  }) => {
    onChange({
      chequeDocName: result.chequeDocName,
      pennyDropStatus: result.pennyDropStatus,
      pennyDropUtr: result.utrNumber,
      pennyDropBeneficiary: result.beneficiaryName,
      bankName: data.bankName || result.verifiedBankName,
    });
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Eyebrow & Hero Header */}
      <View style={styles.eyebrowBadge}>
        <Text style={styles.eyebrowText}>STEP 4 · DIRECT PAYOUTS</Text>
      </View>
      <Text style={styles.title}>Bank Account & Settlements</Text>
      <Text style={styles.subtitle}>
        Earnings from your completed neighborhood orders will be settled directly to this account.
      </Text>

      {/* Security Shield Banner */}
      <View style={styles.securityBanner}>
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
            stroke="#17BE5A"
            strokeWidth={1.8}
            fill="#EDFDF2"
          />
          <Path
            d="M9 12l2 2 4-4"
            stroke="#17BE5A"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
        <Text style={styles.securityBannerText}>
          Bank account numbers are encrypted & masked for your privacy.
        </Text>
      </View>

      {/* 1. Account Holder Name */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          Bank Account Holder Name <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.inputBox}>
          <TextInput
            style={styles.input}
            placeholder="As per bank passbook / PAN"
            placeholderTextColor="#8D8D8D"
            autoCapitalize="words"
            value={data.accountHolderName}
            onChangeText={(text) => onChange({ accountHolderName: text })}
          />
        </View>
      </View>

      {/* 2. Bank Account Number */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          Bank Account Number <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.inputBox}>
          <TextInput
            style={[styles.input, styles.monoInput]}
            placeholder="Enter full account number"
            placeholderTextColor="#8D8D8D"
            keyboardType="numeric"
            value={data.accountNumber}
            onChangeText={(text) => onChange({ accountNumber: text.trim() })}
          />
        </View>
      </View>

      {/* 3. Re-enter Bank Account Number */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          Confirm Account Number <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.inputBox}>
          <TextInput
            style={[styles.input, styles.monoInput]}
            placeholder="Re-type account number"
            placeholderTextColor="#8D8D8D"
            keyboardType="numeric"
            value={data.confirmAccountNumber}
            onChangeText={(text) =>
              onChange({ confirmAccountNumber: text.trim() })
            }
          />
          {isAccountMatch && (
            <View style={styles.validCheck}>
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                <Circle cx={12} cy={12} r={10} fill="#17BE5A" />
                <Path
                  d="M8 12.5l2.5 2.5 5.5-5.5"
                  stroke="#FFFFFF"
                  strokeWidth={2.4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </View>
          )}
        </View>
      </View>

      {/* 4. IFSC Code */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          Bank IFSC Code <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.inputBox}>
          <TextInput
            style={[styles.input, styles.monoInput]}
            placeholder="HDFC0001234"
            placeholderTextColor="#8D8D8D"
            maxLength={11}
            autoCapitalize="characters"
            value={data.ifscCode}
            onChangeText={(text) =>
              onChange({
                ifscCode: text.toUpperCase().trim(),
                bankName: text.length >= 4 ? 'HDFC Bank Ltd.' : '',
              })
            }
          />
          {isIfscValid && (
            <View style={styles.ifscBadge}>
              <Text style={styles.ifscBadgeText}>HDFC BANK</Text>
            </View>
          )}
        </View>
      </View>

      {/* 5. UPI ID (Optional) */}
      <View style={styles.inputGroup}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>Instant UPI ID</Text>
          <View style={styles.optionalBadge}>
            <Text style={styles.optionalText}>FAST SETTLEMENT</Text>
          </View>
        </View>
        <View style={styles.inputBox}>
          <TextInput
            style={styles.input}
            placeholder="e.g. sharmamart@okhdfcbank"
            placeholderTextColor="#8D8D8D"
            autoCapitalize="none"
            value={data.upiId || ''}
            onChangeText={(text) => onChange({ upiId: text.trim() })}
          />
        </View>
      </View>

      {/* 6. Cancelled Cheque / Passbook Attachment Card */}
      <TouchableOpacity
        style={[
          styles.uploadCard,
          data.chequeDocName ? styles.uploadCardAttached : null,
        ]}
        activeOpacity={0.8}
        onPress={handleAttachCheque}
      >
        <View style={styles.uploadIconWrap}>
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Path
              d="M3 10h18M7 15h2m4 0h4M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z"
              stroke={data.pennyDropStatus === 'SUCCESS' ? '#2E7D32' : data.chequeDocName ? '#17BE5A' : '#FF5790'}
              strokeWidth={1.8}
            />
          </Svg>
        </View>
        <View style={styles.uploadTextWrap}>
          <Text style={styles.uploadTitle}>
            {data.chequeDocName || 'Upload Cancelled Cheque / Passbook'}
          </Text>
          <Text style={styles.uploadDesc}>
            {data.pennyDropStatus === 'SUCCESS'
              ? `✓ NPCI ₹1 Verified · CBS Name: ${data.pennyDropBeneficiary || data.accountHolderName}`
              : data.chequeDocName
              ? '✓ Cheque Attached · Tap to verify account'
              : 'Verifies account holder name & IFSC via ₹1 Penny Drop'}
          </Text>
        </View>
        <View
          style={[
            styles.statusPill,
            data.pennyDropStatus === 'SUCCESS'
              ? styles.statusPillVerified
              : data.chequeDocName
              ? styles.statusPillDone
              : styles.statusPillPending,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              data.pennyDropStatus === 'SUCCESS'
                ? styles.statusTextVerified
                : data.chequeDocName
                ? styles.statusTextDone
                : styles.statusTextPending,
            ]}
          >
            {data.pennyDropStatus === 'SUCCESS' ? 'VERIFIED' : data.chequeDocName ? 'READY' : 'ATTACH'}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Instant Penny Drop Info Banner */}
      <View style={styles.infoNoteCard}>
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
            stroke="#17BE5A"
            strokeWidth={1.8}
            fill="#EDFDF2"
          />
        </Svg>
        <Text style={styles.infoNoteText}>
          <Text style={{ fontWeight: '700', color: '#17BE5A' }}>₹1 Penny Drop Check: </Text>
          A ₹1.00 test deposit verifies the bank account in real-time with NPCI. The name registered at your bank must match your PAN card to prevent fake accounts.
        </Text>
      </View>

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
          style={[styles.ctaButton, !isValid && styles.ctaButtonDisabled]}
          activeOpacity={0.88}
          disabled={!isValid}
          onPress={onNext}
        >
          <Text style={styles.ctaButtonText}>Save & Continue</Text>
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

      {/* Penny Drop Verification Modal */}
      <PennyDropModal
        visible={showPennyModal}
        accountNumber={data.accountNumber}
        accountHolderName={data.accountHolderName}
        ifscCode={data.ifscCode}
        onClose={() => setShowPennyModal(false)}
        onVerificationComplete={handlePennyDropSuccess}
      />
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
    marginBottom: 18,
  },
  securityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDFDF2',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    gap: 10,
  },
  securityBannerText: {
    flex: 1,
    fontFamily: fonts.nunito.semiBold,
    fontSize: 12,
    color: '#17BE5A',
    lineHeight: 16,
  },
  inputGroup: {
    marginBottom: 18,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    fontFamily: fonts.nunito.bold,
    fontSize: 13.5,
    color: '#181C1F',
    marginBottom: 8,
  },
  required: {
    color: '#FF5790',
  },
  optionalBadge: {
    backgroundColor: '#FFF0F5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  optionalText: {
    fontFamily: fonts.raleway.bold,
    fontSize: 9.5,
    color: '#FF5790',
    letterSpacing: 0.5,
  },
  inputBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    height: 52,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontFamily: fonts.nunito.regular,
    fontSize: 15,
    color: '#181C1F',
    height: '100%',
  },
  monoInput: {
    letterSpacing: 1,
    fontWeight: '700',
  },
  validCheck: {
    marginLeft: 8,
  },
  ifscBadge: {
    backgroundColor: '#EDFDF2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  ifscBadgeText: {
    fontFamily: fonts.raleway.bold,
    fontSize: 10,
    color: '#17BE5A',
  },
  uploadCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    padding: 12,
    marginTop: 6,
    marginBottom: 16,
    gap: 12,
  },
  uploadCardAttached: {
    borderColor: '#17BE5A',
    backgroundColor: '#F7FEFA',
  },
  uploadIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF0F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadTextWrap: {
    flex: 1,
  },
  uploadTitle: {
    fontFamily: fonts.nunito.bold,
    fontSize: 13,
    color: '#181C1F',
  },
  uploadDesc: {
    fontFamily: fonts.nunito.regular,
    fontSize: 11.5,
    color: '#707070',
    marginTop: 2,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusPillPending: {
    backgroundColor: '#FFF0F5',
  },
  statusPillDone: {
    backgroundColor: '#EDFDF2',
  },
  statusPillVerified: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  statusText: {
    fontFamily: fonts.raleway.bold,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  statusTextPending: {
    color: '#FF5790',
  },
  statusTextDone: {
    color: '#17BE5A',
  },
  statusTextVerified: {
    color: '#2E7D32',
  },
  infoNoteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#EDFDF2',
    borderWidth: 1,
    borderColor: '#C3F4D2',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  infoNoteText: {
    flex: 1,
    fontFamily: fonts.nunito.regular,
    fontSize: 12,
    color: '#0F5132',
    lineHeight: 17,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
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
