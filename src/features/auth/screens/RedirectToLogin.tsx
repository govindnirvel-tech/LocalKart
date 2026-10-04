import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { fonts } from '@/theme/fonts';

import ArrowButtonIcon from '@/assets/svg/Button.svg';
import { RootStackParamList } from '@/navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { height } = Dimensions.get('window');

const RedirectToLogin = () => {
  const navigation = useNavigation<NavigationProp>();

  const handleGetStarted = () => {
    navigation.navigate('CreateAccount');
  };

  const handleAlreadyHaveAccount = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Center Content: Icon + Shoppe Title + Subtitle */}
      <View style={styles.centerContent}>
        {/* Shopping Bag Icon with Round Circle & Shadow */}
        <View style={styles.iconContainer}>
          <Image
            source={require('@/assets/png/shop_icon_with_round_circle.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        {/* Brand Name */}
        <Text style={styles.brandTitle}>LocalKart</Text>

        {/* Subtitles */}
        <Text style={styles.subtitle}>Everything Local,</Text>
        <Text style={styles.subtitleSecondLine}>Right at Your Doorstep</Text>
      </View>

      {/* Bottom Section: Primary Button & Account Link */}
      <View style={styles.bottomSection}>
        {/* "Let's get started" Button */}
        <TouchableOpacity
          style={styles.primaryButton}
          activeOpacity={0.85}
          onPress={handleGetStarted}
        >
          <Text style={styles.buttonText}>Let's get started</Text>
        </TouchableOpacity>

        {/* "I already have an account" + Arrow Button */}
        <TouchableOpacity
          style={styles.alreadyAccountRow}
          activeOpacity={0.7}
          onPress={handleAlreadyHaveAccount}
        >
          <Text style={styles.alreadyAccountText}>
            I already have an account
          </Text>
          <View style={styles.arrowIconWrapper}>
            <ArrowButtonIcon width={32} height={32} />
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default RedirectToLogin;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: height * 0.05,
  },
  iconContainer: {
    marginBottom: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 6,
  },
  logoImage: {
    width: 148,
    height: 148,
  },
  brandTitle: {
    fontFamily: fonts.raleway.bold,
    fontSize: 52,
    lineHeight: 58,
    color: '#181C1F',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: fonts.nunito.regular,
    fontSize: 18,
    lineHeight: 26,
    color: '#333333',
    textAlign: 'center',
  },
  subtitleSecondLine: {
    fontFamily: fonts.nunito.regular,
    fontSize: 18,
    lineHeight: 26,
    color: '#333333',
    textAlign: 'center',
    marginTop: 2,
  },
  bottomSection: {
    paddingBottom: 24,
    width: '100%',
  },
  primaryButton: {
    backgroundColor: '#004BFF',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#004BFF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  buttonText: {
    fontFamily: fonts.nunito.semiBold,
    fontSize: 18,
    color: '#FFFFFF',
  },
  alreadyAccountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  alreadyAccountText: {
    fontFamily: fonts.nunito.regular,
    fontSize: 15,
    color: '#333333',
    marginRight: 10,
  },
  arrowIconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
