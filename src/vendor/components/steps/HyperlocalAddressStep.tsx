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
import { VendorAddressData } from '../../types/onboarding';

interface HyperlocalAddressStepProps {
  data: VendorAddressData;
  onChange: (fields: Partial<VendorAddressData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const RADIUS_OPTIONS = [1, 2, 3, 5, 8, 10];

export const HyperlocalAddressStep = ({
  data,
  onChange,
  onNext,
  onPrev,
}: HyperlocalAddressStepProps) => {
  const isValid =
    data.addressLine1.trim().length >= 4 &&
    data.city.trim().length >= 2 &&
    data.pincode.trim().length === 6;

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Eyebrow & Hero Header */}
      <View style={styles.eyebrowBadge}>
        <Text style={styles.eyebrowText}>STEP 2 · HYPERLOCAL ZONE</Text>
      </View>
      <Text style={styles.title}>Where is your store located?</Text>
      <Text style={styles.subtitle}>
        Pinpoint your store address and configure your neighborhood express delivery radius.
      </Text>

      {/* GPS Location Map Card Preview */}
      <View style={styles.mapCard}>
        <View style={styles.mapPinRow}>
          <View style={styles.pinIconCircle}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path
                d="M12 21s-8-7.5-8-12a8 8 0 1 1 16 0c0 4.5-8 12-8 12z"
                stroke="#FF5790"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Circle cx={12} cy={9} r={2.5} fill="#FF5790" />
            </Svg>
          </View>
          <View style={styles.mapTextWrap}>
            <Text style={styles.mapCardTitle}>Store GPS Location</Text>
            <Text style={styles.mapCardSub}>
              {data.city || 'Indore'}, MP · Lat: {data.latitude.toFixed(3)}, Lng: {data.longitude.toFixed(3)}
            </Text>
          </View>
          <View style={styles.livePill}>
            <View style={styles.liveDot} />
            <Text style={styles.livePillText}>PINNED</Text>
          </View>
        </View>
      </View>

      {/* 1. Address Line 1 */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          Shop / Building No. & Market Name <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.inputBox}>
          <TextInput
            style={styles.input}
            placeholder="e.g. Shop 4B, Galaxy Market"
            placeholderTextColor="#8D8D8D"
            value={data.addressLine1}
            onChangeText={(text) => onChange({ addressLine1: text })}
          />
        </View>
      </View>

      {/* 2. Address Line 2 / Landmark */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Colony / Road / Landmark</Text>
        <View style={styles.inputBox}>
          <TextInput
            style={styles.input}
            placeholder="e.g. Near Anand Bazar Circle"
            placeholderTextColor="#8D8D8D"
            value={data.addressLine2}
            onChangeText={(text) => onChange({ addressLine2: text })}
          />
        </View>
      </View>

      {/* 3. City & Pincode Row */}
      <View style={styles.row}>
        <View style={[styles.inputGroup, styles.flex1]}>
          <Text style={styles.label}>
            City <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              placeholder="e.g. Indore"
              placeholderTextColor="#8D8D8D"
              value={data.city}
              onChangeText={(text) => onChange({ city: text })}
            />
          </View>
        </View>

        <View style={[styles.inputGroup, styles.flex1]}>
          <Text style={styles.label}>
            Pincode <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              placeholder="6 digits"
              placeholderTextColor="#8D8D8D"
              keyboardType="numeric"
              maxLength={6}
              value={data.pincode}
              onChangeText={(text) => onChange({ pincode: text })}
            />
          </View>
        </View>
      </View>

      {/* 4. Interactive Hyperlocal Radius Selector */}
      <View style={styles.inputGroup}>
        <View style={styles.radiusHeader}>
          <Text style={styles.label}>Hyperlocal Delivery Radius</Text>
          <Text style={styles.radiusActiveText}>{data.deliveryRadiusKm} KM Zone</Text>
        </View>
        <Text style={styles.fieldHelp}>
          Choose how far around your shop LocalKart will deliver orders.
        </Text>

        <View style={styles.radiusPillRow}>
          {RADIUS_OPTIONS.map((km) => {
            const isSelected = data.deliveryRadiusKm === km;
            return (
              <TouchableOpacity
                key={km}
                style={[
                  styles.radiusPill,
                  isSelected && styles.radiusPillSelected,
                ]}
                activeOpacity={0.8}
                onPress={() => onChange({ deliveryRadiusKm: km })}
              >
                <Text
                  style={[
                    styles.radiusPillText,
                    isSelected && styles.radiusPillTextSelected,
                  ]}
                >
                  {km} km
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Dynamic SLA Badge */}
        <View style={styles.slaBadge}>
          <Text style={styles.slaIcon}>⚡</Text>
          <Text style={styles.slaText}>
            Guaranteed {data.deliveryRadiusKm <= 3 ? '15-20 Min' : '20-30 Min'} Express Delivery to customers
          </Text>
        </View>
      </View>

      {/* 5. Order Value Thresholds */}
      <View style={styles.row}>
        <View style={[styles.inputGroup, styles.flex1]}>
          <Text style={styles.label}>Min Order Amount (₹)</Text>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              placeholder="99"
              placeholderTextColor="#8D8D8D"
              keyboardType="numeric"
              value={data.minOrderAmount.toString()}
              onChangeText={(text) =>
                onChange({ minOrderAmount: parseInt(text, 10) || 0 })
              }
            />
          </View>
        </View>

        <View style={[styles.inputGroup, styles.flex1]}>
          <Text style={styles.label}>Free Delivery Above (₹)</Text>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              placeholder="299"
              placeholderTextColor="#8D8D8D"
              keyboardType="numeric"
              value={data.freeDeliveryThreshold.toString()}
              onChangeText={(text) =>
                onChange({ freeDeliveryThreshold: parseInt(text, 10) || 0 })
              }
            />
          </View>
        </View>
      </View>

      {/* 6. Pickup Address Match Checkbox */}
      <TouchableOpacity
        style={styles.checkboxRow}
        activeOpacity={0.8}
        onPress={() => onChange({ sameForPickup: !data.sameForPickup })}
      >
        <View
          style={[
            styles.checkboxBox,
            data.sameForPickup && styles.checkboxBoxChecked,
          ]}
        >
          {data.sameForPickup && (
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
        <Text style={styles.checkboxLabel}>
          Rider pickup location is the same as this store address
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
    marginBottom: 20,
  },
  mapCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: '#FFD6E5',
    padding: 14,
    marginBottom: 20,
    shadowColor: '#FF5790',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  mapPinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pinIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF0F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapTextWrap: {
    flex: 1,
  },
  mapCardTitle: {
    fontFamily: fonts.nunito.bold,
    fontSize: 14,
    color: '#181C1F',
  },
  mapCardSub: {
    fontFamily: fonts.nunito.regular,
    fontSize: 12,
    color: '#707070',
    marginTop: 2,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDFDF2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 5,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#17BE5A',
  },
  livePillText: {
    fontFamily: fonts.raleway.bold,
    fontSize: 9.5,
    color: '#17BE5A',
    letterSpacing: 0.5,
  },
  inputGroup: {
    marginBottom: 18,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flex1: {
    flex: 1,
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
  fieldHelp: {
    fontFamily: fonts.nunito.regular,
    fontSize: 12,
    color: '#707070',
    marginBottom: 10,
  },
  inputBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    height: 52,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  input: {
    fontFamily: fonts.nunito.regular,
    fontSize: 15,
    color: '#181C1F',
    height: '100%',
  },
  radiusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  radiusActiveText: {
    fontFamily: fonts.nunito.bold,
    fontSize: 13,
    color: '#FF5790',
  },
  radiusPillRow: {
    flexDirection: 'row',
    gap: 8,
  },
  radiusPill: {
    flex: 1,
    height: 42,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radiusPillSelected: {
    backgroundColor: '#FFF0F5',
    borderColor: '#FF5790',
  },
  radiusPillText: {
    fontFamily: fonts.nunito.semiBold,
    fontSize: 13,
    color: '#707070',
  },
  radiusPillTextSelected: {
    fontFamily: fonts.nunito.bold,
    color: '#FF5790',
  },
  slaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 10,
    gap: 6,
  },
  slaIcon: {
    fontSize: 14,
  },
  slaText: {
    fontFamily: fonts.nunito.semiBold,
    fontSize: 12,
    color: '#181C1F',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 10,
    paddingVertical: 4,
  },
  checkboxBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.8,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxBoxChecked: {
    backgroundColor: '#FF5790',
    borderColor: '#FF5790',
  },
  checkboxLabel: {
    flex: 1,
    fontFamily: fonts.nunito.regular,
    fontSize: 13,
    color: '#181C1F',
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
