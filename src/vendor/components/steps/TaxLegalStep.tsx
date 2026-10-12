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
import { VendorDocumentData, StoreCategory } from '../../types/onboarding';
import { DocumentUploadModal, DocumentType } from '../common/DocumentUploadModal';

interface TaxLegalStepProps {
  data: VendorDocumentData;
  category: StoreCategory;
  onChange: (fields: Partial<VendorDocumentData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const TaxLegalStep = ({
  data,
  category,
  onChange,
  onNext,
  onPrev,
}: TaxLegalStepProps) => {
  const [activeDocModal, setActiveDocModal] = useState<DocumentType | null>(null);

  // PAN validation: 10 chars
  const isPanValid = data.panNumber.trim().length === 10;
  const isFoodCategory = [
    'Groceries & Daily Needs',
    'Fresh Dairy & Eggs',
    'Fruits & Vegetables',
    'Bakery & Snacks',
  ].includes(category);

  const handleAttachPan = () => {
    setActiveDocModal('pan');
  };

  const handleAttachGst = () => {
    setActiveDocModal('gst');
  };

  const handleAttachFssai = () => {
    setActiveDocModal('fssai');
  };

  const handleDocConfirmed = (docInfo: {
    fileName: string;
    fileSize: string;
    extractedNumber: string;
    extractedName: string;
    isVerified: boolean;
    verificationAgency: string;
  }) => {
    if (activeDocModal === 'pan') {
      onChange({
        panDocName: docInfo.fileName,
        panVerified: docInfo.isVerified,
        panAgency: docInfo.verificationAgency,
        panExtractedName: docInfo.extractedName,
        panNumber: data.panNumber || docInfo.extractedNumber,
      });
    } else if (activeDocModal === 'gst') {
      onChange({
        gstDocName: docInfo.fileName,
        gstVerified: docInfo.isVerified,
        gstAgency: docInfo.verificationAgency,
        gstin: data.gstin || docInfo.extractedNumber,
      });
    } else if (activeDocModal === 'fssai') {
      onChange({
        fssaiDocName: docInfo.fileName,
        fssaiVerified: docInfo.isVerified,
        fssaiAgency: docInfo.verificationAgency,
        fssaiNumber: data.fssaiNumber || docInfo.extractedNumber,
      });
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Eyebrow & Hero Header */}
      <View style={styles.eyebrowBadge}>
        <Text style={styles.eyebrowText}>STEP 3 · COMPLIANCE & KYC</Text>
      </View>
      <Text style={styles.title}>Tax & Legal Verification</Text>
      <Text style={styles.subtitle}>
        Provide your legal registration details to ensure trusted payouts and compliance.
      </Text>

      {/* 1. PAN Number */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          Business / Proprietor PAN Number <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.inputBox}>
          <TextInput
            style={[styles.input, styles.monoInput]}
            placeholder="ABCDE1234F"
            placeholderTextColor="#8D8D8D"
            maxLength={10}
            autoCapitalize="characters"
            value={data.panNumber}
            onChangeText={(text) =>
              onChange({ panNumber: text.toUpperCase().trim() })
            }
          />
          {isPanValid && (
            <View style={styles.validCheck}>
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
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

        {/* PAN Document Upload Card */}
        <TouchableOpacity
          style={[
            styles.uploadCard,
            data.panDocName ? styles.uploadCardAttached : null,
          ]}
          activeOpacity={0.8}
          onPress={handleAttachPan}
        >
          <View style={styles.uploadIconWrap}>
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
              <Path
                d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                stroke={data.panDocName ? '#17BE5A' : '#FF5790'}
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d="M14 2v6h6M12 18v-6M9 15l3-3 3 3"
                stroke={data.panDocName ? '#17BE5A' : '#FF5790'}
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>
          <View style={styles.uploadTextWrap}>
            <Text style={styles.uploadTitle}>
              {data.panDocName || 'Upload PAN Card Photo / PDF'}
            </Text>
            <Text style={styles.uploadDesc}>
              {data.panVerified
                ? `✓ Verified by ${data.panAgency || 'NSDL'} · ${data.panExtractedName || 'Authentic'}`
                : data.panDocName
                ? '✓ Attached · Tap to verify or replace'
                : 'Max size 5 MB · PDF, JPG or PNG'}
            </Text>
          </View>
          <View
            style={[
              styles.statusPill,
              data.panVerified
                ? styles.statusPillVerified
                : data.panDocName
                ? styles.statusPillDone
                : styles.statusPillPending,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                data.panVerified
                  ? styles.statusTextVerified
                  : data.panDocName
                  ? styles.statusTextDone
                  : styles.statusTextPending,
              ]}
            >
              {data.panVerified ? 'VERIFIED' : data.panDocName ? 'READY' : 'UPLOAD'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* 2. GSTIN (Optional) */}
      <View style={styles.inputGroup}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>GSTIN (GST Number)</Text>
          <View style={styles.optionalBadge}>
            <Text style={styles.optionalText}>OPTIONAL</Text>
          </View>
        </View>
        <Text style={styles.fieldHelp}>
          Not mandatory for small local vendors with annual turnover under ₹40 Lakhs.
        </Text>
        <View style={styles.inputBox}>
          <TextInput
            style={[styles.input, styles.monoInput]}
            placeholder="23AAAAA0000A1Z5"
            placeholderTextColor="#8D8D8D"
            maxLength={15}
            autoCapitalize="characters"
            value={data.gstin || ''}
            onChangeText={(text) =>
              onChange({ gstin: text.toUpperCase().trim() })
            }
          />
        </View>

        {/* GST Certificate Upload Card */}
        {data.gstin && data.gstin.length > 5 && (
          <TouchableOpacity
            style={[
              styles.uploadCard,
              data.gstDocName ? styles.uploadCardAttached : null,
              { marginTop: 10 },
            ]}
            activeOpacity={0.8}
            onPress={handleAttachGst}
          >
            <View style={styles.uploadIconWrap}>
              <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z"
                  stroke={data.gstDocName ? '#17BE5A' : '#FF5790'}
                  strokeWidth={1.8}
                />
              </Svg>
            </View>
            <View style={styles.uploadTextWrap}>
              <Text style={styles.uploadTitle}>
                {data.gstDocName || 'Upload GST Registration Certificate'}
              </Text>
              <Text style={styles.uploadDesc}>
                {data.gstVerified
                  ? `✓ Verified by ${data.gstAgency || 'GSTN Portal'} · Active Entity`
                  : data.gstDocName
                  ? '✓ Attached · Tap to replace'
                  : 'Tap to upload official GST REG-06'}
              </Text>
            </View>
            <View
              style={[
                styles.statusPill,
                data.gstVerified ? styles.statusPillVerified : styles.statusPillDone,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  data.gstVerified ? styles.statusTextVerified : styles.statusTextDone,
                ]}
              >
                {data.gstVerified ? 'VERIFIED' : 'READY'}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* 3. FSSAI License (If Food / Grocery Category) */}
      {isFoodCategory && (
        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>FSSAI Food License Number</Text>
            <View style={styles.foodBadge}>
              <Text style={styles.foodBadgeText}>FOOD SAFETY</Text>
            </View>
          </View>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              placeholder="14-digit FSSAI Number"
              placeholderTextColor="#8D8D8D"
              keyboardType="numeric"
              maxLength={14}
              value={data.fssaiNumber || ''}
              onChangeText={(text) => onChange({ fssaiNumber: text.trim() })}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.uploadCard,
              data.fssaiDocName ? styles.uploadCardAttached : null,
              { marginTop: 10 },
            ]}
            activeOpacity={0.8}
            onPress={handleAttachFssai}
          >
            <View style={styles.uploadIconWrap}>
              <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                  stroke={data.fssaiDocName ? '#17BE5A' : '#FF5790'}
                  strokeWidth={1.8}
                />
              </Svg>
            </View>
            <View style={styles.uploadTextWrap}>
              <Text style={styles.uploadTitle}>
                {data.fssaiDocName || 'Attach FSSAI License Copy'}
              </Text>
              <Text style={styles.uploadDesc}>
                {data.fssaiVerified
                  ? `✓ Verified by ${data.fssaiAgency || 'FoSCoS'}`
                  : data.fssaiDocName
                  ? '✓ Attached successfully'
                  : 'Optional for small homemade sellers'}
              </Text>
            </View>
            <View
              style={[
                styles.statusPill,
                data.fssaiVerified ? styles.statusPillVerified : styles.statusPillDone,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  data.fssaiVerified ? styles.statusTextVerified : styles.statusTextDone,
                ]}
              >
                {data.fssaiVerified ? 'VERIFIED' : 'READY'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* Security note card */}
      <View style={styles.infoNoteCard}>
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
            stroke="#004BFF"
            strokeWidth={1.8}
            fill="#EFF6FF"
          />
        </Svg>
        <Text style={styles.infoNoteText}>
          <Text style={{ fontWeight: '700', color: '#004BFF' }}>Govt API Cross-Check: </Text>
          PAN and GST documents are verified against NSDL & GSTN records in real-time to prevent fake documents and ensure trusted buyer payouts.
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
          style={[styles.ctaButton, !isPanValid && styles.ctaButtonDisabled]}
          activeOpacity={0.88}
          disabled={!isPanValid}
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

      {/* Document Upload Modal */}
      <DocumentUploadModal
        visible={activeDocModal !== null}
        docType={activeDocModal || 'pan'}
        title={
          activeDocModal === 'pan'
            ? 'PAN Card Verification'
            : activeDocModal === 'gst'
            ? 'GST Certificate (REG-06)'
            : activeDocModal === 'fssai'
            ? 'FSSAI Food License'
            : 'Document Verification'
        }
        expectedNumber={
          activeDocModal === 'pan'
            ? data.panNumber
            : activeDocModal === 'gst'
            ? data.gstin
            : activeDocModal === 'fssai'
            ? data.fssaiNumber
            : ''
        }
        onClose={() => setActiveDocModal(null)}
        onConfirmDocument={handleDocConfirmed}
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
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
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
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  optionalText: {
    fontFamily: fonts.raleway.bold,
    fontSize: 9.5,
    color: '#707070',
    letterSpacing: 0.5,
  },
  foodBadge: {
    backgroundColor: '#EDFDF2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  foodBadgeText: {
    fontFamily: fonts.raleway.bold,
    fontSize: 9.5,
    color: '#17BE5A',
    letterSpacing: 0.5,
  },
  fieldHelp: {
    fontFamily: fonts.nunito.regular,
    fontSize: 12,
    color: '#707070',
    marginBottom: 8,
    lineHeight: 16,
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
    letterSpacing: 1.2,
    fontWeight: '700',
  },
  validCheck: {
    marginLeft: 8,
  },
  uploadCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    padding: 12,
    marginTop: 10,
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
    backgroundColor: '#F0F5FF',
    borderWidth: 1,
    borderColor: '#D4E2FF',
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
    marginBottom: 6,
  },
  infoNoteText: {
    flex: 1,
    fontFamily: fonts.nunito.regular,
    fontSize: 12,
    color: '#1E3A8A',
    lineHeight: 17,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
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
