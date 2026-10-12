import React from 'react';
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
import { BusinessType, StoreCategory, VendorBusinessData } from '../../types/onboarding';

interface BusinessInfoStepProps {
  data: VendorBusinessData;
  onChange: (fields: Partial<VendorBusinessData>) => void;
  onNext: () => void;
}

const BUSINESS_TYPES: Array<{ key: BusinessType; label: string; desc: string }> = [
  {
    key: 'individual',
    label: 'Individual / Proprietor',
    desc: 'Sole proprietor or single store owner (Simplest KYC)',
  },
  {
    key: 'partnership',
    label: 'Partnership Firm',
    desc: 'Joint ownership with registered partnership deed',
  },
  {
    key: 'pvt_ltd',
    label: 'Private Limited / LLP',
    desc: 'Incorporated company with CIN / LLPIN',
  },
];

const CATEGORIES: Array<{ key: StoreCategory; icon: string }> = [
  { key: 'Groceries & Daily Needs', icon: '🥬' },
  { key: 'Fresh Dairy & Eggs', icon: '🥛' },
  { key: 'Fruits & Vegetables', icon: '🍎' },
  { key: 'Bakery & Snacks', icon: '🥖' },
  { key: 'Pharmacy & Wellness', icon: '💊' },
  { key: 'Fashion & Boutique', icon: '👗' },
  { key: 'Electronics & Mobile', icon: '📱' },
  { key: 'Home & Kitchen', icon: '🍳' },
];

export const BusinessInfoStep = ({
  data,
  onChange,
  onNext,
}: BusinessInfoStepProps) => {
  const isValid = data.storeName.trim().length >= 3;

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Eyebrow & Hero Header */}
      <View style={styles.eyebrowBadge}>
        <Text style={styles.eyebrowText}>STEP 1 · STORE IDENTITY</Text>
      </View>
      <Text style={styles.title}>Tell us about your business</Text>
      <Text style={styles.subtitle}>
        This information will be displayed to neighborhood shoppers on LocalKart.
      </Text>

      {/* 1. Store / Business Name */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          Store Name <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.inputBox}>
          <TextInput
            style={styles.input}
            placeholder="e.g. Sharma Fresh Mart"
            placeholderTextColor="#8D8D8D"
            value={data.storeName}
            onChangeText={(text) => onChange({ storeName: text })}
            autoCapitalize="words"
          />
        </View>
      </View>

      {/* 2. Business Type Selector */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          Business Structure <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.businessTypesList}>
          {BUSINESS_TYPES.map((item) => {
            const isSelected = data.businessType === item.key;
            return (
              <TouchableOpacity
                key={item.key}
                style={[
                  styles.typeCard,
                  isSelected && styles.typeCardSelected,
                ]}
                activeOpacity={0.8}
                onPress={() => onChange({ businessType: item.key })}
              >
                <View style={styles.typeRadio}>
                  <View
                    style={[
                      styles.radioOuter,
                      isSelected && styles.radioOuterSelected,
                    ]}
                  >
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                </View>
                <View style={styles.typeTextWrap}>
                  <Text
                    style={[
                      styles.typeLabel,
                      isSelected && styles.typeLabelSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                  <Text style={styles.typeDesc}>{item.desc}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 3. Primary Store Category */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          Store Category <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.categoriesGrid}>
          {CATEGORIES.map((cat) => {
            const isSelected = data.category === cat.key;
            return (
              <TouchableOpacity
                key={cat.key}
                style={[
                  styles.categoryChip,
                  isSelected && styles.categoryChipSelected,
                ]}
                activeOpacity={0.75}
                onPress={() => onChange({ category: cat.key })}
              >
                <Text style={styles.categoryIcon}>{cat.icon}</Text>
                <Text
                  style={[
                    styles.categoryText,
                    isSelected && styles.categoryTextSelected,
                  ]}
                  numberOfLines={1}
                >
                  {cat.key}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 4. Year of Establishment */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Year of Establishment</Text>
        <View style={styles.inputBox}>
          <TextInput
            style={styles.input}
            placeholder="e.g. 2018"
            placeholderTextColor="#8D8D8D"
            keyboardType="numeric"
            maxLength={4}
            value={data.yearOfEstablishment}
            onChangeText={(text) => onChange({ yearOfEstablishment: text })}
          />
        </View>
      </View>

      {/* 5. Business Description */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Store Description</Text>
        <View style={[styles.inputBox, styles.textAreaBox]}>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Briefly describe what your store offers (specialities, fresh stock, etc.)"
            placeholderTextColor="#8D8D8D"
            multiline
            numberOfLines={3}
            value={data.description}
            onChangeText={(text) => onChange({ description: text })}
          />
        </View>
      </View>

      {/* Bottom CTA */}
      <View style={styles.buttonSection}>
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
  label: {
    fontFamily: fonts.nunito.bold,
    fontSize: 13.5,
    color: '#181C1F',
    marginBottom: 8,
  },
  required: {
    color: '#FF5790',
  },
  inputBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    height: 52,
    paddingHorizontal: 16,
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  input: {
    fontFamily: fonts.nunito.regular,
    fontSize: 15,
    color: '#181C1F',
    height: '100%',
  },
  textAreaBox: {
    height: 88,
    paddingVertical: 12,
  },
  textArea: {
    textAlignVertical: 'top',
  },
  businessTypesList: {
    gap: 10,
  },
  typeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  typeCardSelected: {
    borderColor: '#FF5790',
    backgroundColor: '#FFF0F5',
  },
  typeRadio: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.8,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  radioOuterSelected: {
    borderColor: '#FF5790',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF5790',
  },
  typeTextWrap: {
    flex: 1,
  },
  typeLabel: {
    fontFamily: fonts.nunito.bold,
    fontSize: 14,
    color: '#181C1F',
    marginBottom: 2,
  },
  typeLabelSelected: {
    color: '#FF5790',
  },
  typeDesc: {
    fontFamily: fonts.nunito.regular,
    fontSize: 12,
    color: '#707070',
    lineHeight: 16,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 6,
  },
  categoryChipSelected: {
    backgroundColor: '#FFF0F5',
    borderColor: '#FF5790',
  },
  categoryIcon: {
    fontSize: 16,
  },
  categoryText: {
    fontFamily: fonts.nunito.semiBold,
    fontSize: 13,
    color: '#707070',
  },
  categoryTextSelected: {
    fontFamily: fonts.nunito.bold,
    color: '#FF5790',
  },
  buttonSection: {
    marginTop: 12,
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
