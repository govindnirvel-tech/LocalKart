import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Box, Text } from '@/theme';
import Button from '@/components/Button';
import ArrowButtonIcon from '@/assets/svg/Button.svg';
import { RootStackParamList } from '@/navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { height } = Dimensions.get('window');

export default function RedirectToLogin() {
  const navigation = useNavigation<NavigationProp>();

  const handleGetStarted = () => {
    navigation.navigate('RoleSelection');
  };

  const handleAlreadyHaveAccount = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Center Content: Icon + Shoppe Title + Subtitle */}
      <Box
        flex={1}
        justifyContent="center"
        alignItems="center"
        marginTop="m"
        style={{ marginTop: height * 0.05 }}
      >
        {/* Shopping Bag Icon with Round Circle & Shadow */}
        <Box
          marginBottom="l"
          alignItems="center"
          justifyContent="center"
          shadowColor="black"
          shadowOffset={{ width: 0, height: 6 }}
          shadowOpacity={0.1}
          shadowRadius={14}
          elevation={6}
        >
          <Image
            source={require('@/assets/png/shop_icon_with_round_circle.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </Box>

        {/* Brand Name */}
        <Text variant="hero" color="textPrimary" marginBottom="s">
          LocalKart
        </Text>

        {/* Subtitles */}
        <Text variant="bodyLarge" color="textSecondary" textAlign="center">
          Everything Local,
        </Text>
        <Text
          variant="bodyLarge"
          color="textSecondary"
          textAlign="center"
          marginTop="xs"
        >
          Right at Your Doorstep
        </Text>
      </Box>

      {/* Bottom Section: Primary Button & Account Link */}
      <Box paddingBottom="l" width="100%">
        {/* "Let's get started" Button */}
        <Box marginBottom="l">
          <Button
            label="Let's get started"
            onPress={handleGetStarted}
            height={56}
          />
        </Box>

        {/* "I already have an account" + Arrow Button */}
        <TouchableOpacity
          style={styles.alreadyAccountRow}
          activeOpacity={0.7}
          onPress={handleAlreadyHaveAccount}
        >
          <Text variant="body" color="textSecondary" marginRight="s">
            I already have an account
          </Text>
          <Box justifyContent="center" alignItems="center">
            <ArrowButtonIcon width={30} height={30} />
          </Box>
        </TouchableOpacity>
      </Box>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  logoImage: {
    width: 148,
    height: 148,
  },
  alreadyAccountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
});
