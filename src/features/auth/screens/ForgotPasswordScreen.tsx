import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Path, Circle } from 'react-native-svg';
import { RootStackParamList } from '@/navigation/types';
import { fonts } from '@/theme/fonts';
import RightTopBubble from '@/assets/svg/right_top_bubble.svg';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width, height } = Dimensions.get('window');

// Checkmark icon for selected option
const CheckCircleIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="12" fill="#004BFE" />
    <Path
      d="M7 12.5L10.5 16L17 8.5"
      stroke="#FFFFFF"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default function ForgotPasswordScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [selectedMethod, setSelectedMethod] = useState<'sms' | 'email'>('sms');

  const handleNext = () => {
    // Navigate to OTP verification screen
    navigation.navigate('Otp', {
      phoneOrEmail: selectedMethod === 'sms' ? '+44 7911 123456' : 'romina@example.com',
    });
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Background: right_top_bubble.svg */}
      <View style={styles.backgroundWrapper} pointerEvents="none">
        <RightTopBubble
          width={width}
          height={width * (262 / 355)}
          preserveAspectRatio="xMidYMin slice"
        />
      </View>

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.content}>
          {/* Top Center: Romina Avatar & Titles */}
          <View style={styles.centerSection}>
            {/* Romina Circular Avatar */}
            <View style={styles.avatarWrapper}>
              <Image
                source={require('@/assets/png/Group 1000004658 (1).png')}
                style={styles.avatar}
                resizeMode="contain"
              />
            </View>

            {/* Heading & Subtitle */}
            <Text style={styles.title}>Password Recovery</Text>
            <Text style={styles.subtitle}>
              How you would like to restore{'\n'}your password?
            </Text>

            {/* Recovery Methods Pills */}
            <View style={styles.optionsContainer}>
              {/* SMS Option */}
              <TouchableOpacity
                style={[
                  styles.optionPill,
                  styles.smsPill,
                  selectedMethod === 'sms' && styles.optionPillSelected,
                ]}
                activeOpacity={0.8}
                onPress={() => setSelectedMethod('sms')}
              >
                <Text
                  style={[
                    styles.optionText,
                    selectedMethod === 'sms' ? styles.optionTextSms : styles.optionTextInactive,
                  ]}
                >
                  SMS
                </Text>
                <View style={styles.iconSlot}>
                  {selectedMethod === 'sms' ? (
                    <CheckCircleIcon />
                  ) : (
                    <View style={styles.radioEmpty} />
                  )}
                </View>
              </TouchableOpacity>

              {/* Email Option */}
              <TouchableOpacity
                style={[
                  styles.optionPill,
                  styles.emailPill,
                  selectedMethod === 'email' && styles.optionPillSelected,
                ]}
                activeOpacity={0.8}
                onPress={() => setSelectedMethod('email')}
              >
                <Text
                  style={[
                    styles.optionText,
                    selectedMethod === 'email' ? styles.optionTextEmail : styles.optionTextInactive,
                  ]}
                >
                  Email
                </Text>
                <View style={styles.iconSlot}>
                  {selectedMethod === 'email' ? (
                    <CheckCircleIcon />
                  ) : (
                    <View style={styles.radioEmptyPink} />
                  )}
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Bottom Actions: Next Button & Cancel */}
          <View style={styles.bottomSection}>
            <TouchableOpacity
              style={styles.nextButton}
              activeOpacity={0.85}
              onPress={handleNext}
            >
              <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              activeOpacity={0.7}
              onPress={handleCancel}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  backgroundWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: height * 0.09,
    paddingBottom: 24,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  centerSection: {
    alignItems: 'center',
    width: '100%',
    marginTop: height * 0.03,
  },
  avatarWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontFamily: fonts.raleway.bold,
    fontSize: 26,
    lineHeight: 32,
    color: '#181C1F',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: fonts.nunito.regular,
    fontSize: 16,
    lineHeight: 24,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 36,
  },
  optionsContainer: {
    width: '100%',
    maxWidth: 320,
    gap: 16,
  },
  optionPill: {
    height: 52,
    borderRadius: 26,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  smsPill: {
    backgroundColor: '#E8EEFB',
  },
  emailPill: {
    backgroundColor: '#FDEEEF',
  },
  optionPillSelected: {
    // Subtle shadow on active
    shadowColor: '#004BFE',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  optionText: {
    fontFamily: fonts.nunito.bold,
    fontSize: 16,
    textAlign: 'center',
  },
  optionTextSms: {
    color: '#004BFE',
  },
  optionTextEmail: {
    color: '#181C1F',
  },
  optionTextInactive: {
    color: '#8E8E93',
  },
  iconSlot: {
    position: 'absolute',
    right: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioEmpty: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#C5D3F0',
  },
  radioEmptyPink: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E8D4D6',
  },
  bottomSection: {
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  nextButton: {
    backgroundColor: '#004BFE',
    height: 56,
    borderRadius: 16,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#004BFE',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  nextButtonText: {
    fontFamily: fonts.nunito.bold,
    fontSize: 18,
    color: '#FFFFFF',
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  cancelButtonText: {
    fontFamily: fonts.nunito.regular,
    fontSize: 16,
    color: '#181C1F',
  },
});
