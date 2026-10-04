import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/types';
import { fonts } from '@/theme/fonts';
import TopBubblesBackground from '@/assets/svg/Bubbles copy.svg';
import ArrowButtonIcon from '@/assets/svg/Button.svg';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ScreenRouteProp = RouteProp<RootStackParamList, 'Password'>;

const { width, height } = Dimensions.get('window');

const TOTAL_DOTS = 8;
const CORRECT_PASSWORD = 'password'; // Demo correct password, any other triggers wrong state

const PasswordScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRouteProp>();
  const userName = route.params?.name || 'Romina';

  const [password, setPassword] = useState('');
  const [isError, setIsError] = useState(false);
  const inputRef = useRef<any>(null);

  const handlePasswordChange = (text: string) => {
    if (isError) {
      setIsError(false);
    }

    const trimmed = text.slice(0, TOTAL_DOTS);
    setPassword(trimmed);

    // If 8 characters reached, validate
    if (trimmed.length === TOTAL_DOTS) {
      if (trimmed.toLowerCase() === CORRECT_PASSWORD || trimmed === '12345678') {
        setTimeout(() => {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Tabs', params: { screen: 'Home' } }],
          });
        }, 200);
      } else {
        // Trigger 06 Wrong Password state
        setTimeout(() => {
          setIsError(true);
        }, 150);
      }
    }
  };

  const handleNotYou = () => {
    navigation.navigate('Login');
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const isTyping = password.length > 0;

  return (
    <View style={styles.container}>
      {/* Background Bubbles */}
      <View style={styles.backgroundWrapper} pointerEvents="none">
        <TopBubblesBackground width={width} height={height * 0.48} preserveAspectRatio="xMidYMin slice" />
      </View>

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardAvoid}
        >
          <View style={styles.content}>
            {/* Top Center Profile & Greeting Section */}
            <View style={styles.profileSection}>
              {/* Romina Circular Avatar */}
              <View style={styles.avatarWrapper}>
                <Image
                  source={require('@/assets/png/Group 1000004658 (1).png')}
                  style={styles.avatar}
                  resizeMode="contain"
                />
              </View>

              {/* Greeting & Subtitle */}
              <Text style={styles.greetingTitle}>Hello, {userName}!!</Text>
              <Text style={styles.subtitle}>Type your password</Text>

              {/* Hidden TextInput to capture keyboard inputs */}
              <TextInput
                ref={inputRef}
                style={styles.hiddenInput}
                keyboardType="default"
                maxLength={TOTAL_DOTS}
                value={password}
                onChangeText={handlePasswordChange}
                autoFocus
                onSubmitEditing={() => {
                  if (password.length > 0 && password.toLowerCase() !== CORRECT_PASSWORD && password !== '12345678') {
                    setIsError(true);
                  }
                }}
              />

              {/* 04 Initial State: 4 Rounded Boxes (when empty) */}
              {!isTyping && (
                <TouchableOpacity
                  style={styles.emptyBoxesContainer}
                  activeOpacity={1}
                  onPress={() => inputRef.current?.focus()}
                >
                  {[0, 1, 2, 3].map((index) => (
                    <View key={index} style={styles.emptyBox} />
                  ))}
                </TouchableOpacity>
              )}

              {/* 05 Typing State & 06 Wrong Password State: 8 Dots */}
              {isTyping && (
                <View style={styles.dotsContainer}>
                  <TouchableOpacity
                    style={styles.dotsRow}
                    activeOpacity={1}
                    onPress={() => inputRef.current?.focus()}
                  >
                    {Array.from({ length: TOTAL_DOTS }).map((_, index) => {
                      const isFilled = password.length > index;
                      return (
                        <View
                          key={index}
                          style={[
                            styles.dot,
                            isFilled && (isError ? styles.dotRed : styles.dotBlue),
                            !isFilled && styles.dotEmpty,
                          ]}
                        />
                      );
                    })}
                  </TouchableOpacity>

                  {/* 06 Wrong Password: "Forgot your password?" link */}
                  {isError && (
                    <TouchableOpacity
                      style={styles.forgotPasswordButton}
                      activeOpacity={0.7}
                      onPress={handleForgotPassword}
                    >
                      <Text style={styles.forgotPasswordText}>Forgot your password?</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>

            {/* Bottom Link: "Not you?" + Blue Arrow Button */}
            <View style={styles.bottomSection}>
              <TouchableOpacity
                style={styles.notYouRow}
                activeOpacity={0.7}
                onPress={handleNotYou}
              >
                <Text style={styles.notYouText}>Not you?</Text>
                <View style={styles.arrowIconWrapper}>
                  <ArrowButtonIcon width={32} height={32} />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

export default PasswordScreen;

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
    bottom: 0,
  },
  safeArea: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: height * 0.08,
    paddingBottom: 24,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileSection: {
    alignItems: 'center',
    width: '100%',
    marginTop: height * 0.04,
  },
  avatarWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    backgroundColor: '#FFD6DF',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 20,
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
  greetingTitle: {
    fontFamily: fonts.raleway.bold,
    fontSize: 28,
    lineHeight: 34,
    color: '#181C1F',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: fonts.nunito.regular,
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 32,
    textAlign: 'center',
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
  // 04 Empty State (4 Boxes)
  emptyBoxesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 8,
  },
  emptyBox: {
    width: 54,
    height: 54,
    borderRadius: 14,
    backgroundColor: '#F7F8F9',
  },
  // 05 & 06 Dots Container (8 Dots)
  dotsContainer: {
    alignItems: 'center',
    marginTop: 12,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    width: 220,
    height: 17,
  },
  dot: {
    width: 17,
    height: 17,
    borderRadius: 8.5,
  },
  dotBlue: {
    backgroundColor: '#004BFE',
  },
  dotRed: {
    backgroundColor: '#EB5757',
  },
  dotEmpty: {
    backgroundColor: '#E5EBFC',
  },
  forgotPasswordButton: {
    marginTop: 28,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  forgotPasswordText: {
    fontFamily: fonts.nunito.regular,
    fontSize: 15,
    color: '#8E8E93',
    textAlign: 'center',
  },
  bottomSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  notYouRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  notYouText: {
    fontFamily: fonts.nunito.regular,
    fontSize: 16,
    color: '#181C1F',
    marginRight: 10,
  },
  arrowIconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
