import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
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
import { useTheme } from '@shopify/restyle';
import { Box, Text, Theme } from '@/theme';
import Button from '@/components/Button';
import MaxAttemptsModal from '@/features/auth/components/MaxAttemptsModal';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { RootStackParamList } from '@/navigation/types';
import { supabase } from '@/lib/supabase';
import { getCachedAvatar, getCachedName } from '@/utils/userAvatarStorage';
import { DynamicTopBubbles } from '@/features/auth/components/DynamicBubbles';

import Svg, { Path, Circle } from 'react-native-svg';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ScreenRouteProp = RouteProp<RootStackParamList, 'Password'>;

const { width, height } = Dimensions.get('window');

const EyeIcon = ({
  visible = false,
  color,
  size = 22,
}: {
  visible?: boolean;
  color: string;
  size?: number;
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {visible ? (
      <>
        <Path
          d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8-11-8-11-8z"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.8" />
      </>
    ) : (
      <>
        <Path
          d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M1 1l22 22"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    )}
  </Svg>
);

export default function PasswordScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRouteProp>();
  const theme = useTheme<Theme>();
  const email = route.params?.email || '';
  const role = route.params?.role || 'customer';

  const {
    signIn,
    isLoading,
    error: authError,
    clearError,
    isMaxAttemptsModalVisible,
    dismissMaxAttemptsModal,
  } = useAuth();

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isWrongPassword, setIsWrongPassword] = useState(false);
  const [inlineError, setInlineError] = useState('');
  const inputRef = useRef<any>(null);

  // Actual user name (No email splitting)
  const [displayName, setDisplayName] = useState('Govind');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    // 1. Instantly check cached avatar & name
    getCachedAvatar().then((cached) => {
      if (isMounted && cached) {
        setAvatarUrl(cached);
      }
    });

    getCachedName().then((cachedName) => {
      if (isMounted && cachedName) {
        const firstName = cachedName.trim().split(' ')[0];
        if (firstName) {
          setDisplayName(firstName.charAt(0).toUpperCase() + firstName.slice(1));
        }
      }
    });

    if (!email) return;

    // 2. Fetch from Supabase if available
    const fetchUserProfile = async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('full_name, image_url')
          .eq('email', email.trim().toLowerCase())
          .maybeSingle();

        if (isMounted && data) {
          if (data.full_name) {
            const firstName = data.full_name.trim().split(' ')[0];
            if (firstName) {
              setDisplayName(firstName.charAt(0).toUpperCase() + firstName.slice(1));
            }
          }
          if (data.image_url) {
            setAvatarUrl(data.image_url);
          } else {
            setAvatarUrl(null);
          }
        }
      } catch (e) {
        // silent fallback
      }
    };

    fetchUserProfile();
    return () => {
      isMounted = false;
    };
  }, [email]);

  const handlePasswordChange = (text: string) => {
    if (isWrongPassword) {
      setIsWrongPassword(false);
    }
    if (inlineError) {
      setInlineError('');
    }
    clearError();

    const trimmed = text.slice(0, 8);
    setPassword(trimmed);
  };

  const submitLogin = async (pwdToSubmit: string) => {
    if (!email) {
      setInlineError('Email is missing. Please go back to login.');
      return;
    }

    if (pwdToSubmit.length < 8) {
      setInlineError('Password must be at least 8 characters');
      return;
    }

    try {
      await signIn({
        email,
        password: pwdToSubmit,
      });
    } catch (err: any) {
      setIsWrongPassword(true);
      setInlineError(err?.message || 'Invalid email or password. Please try again.');
    }
  };



  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const isTyping = password.length > 0;

  return (
    <Box flex={1} backgroundColor="mainBackground">
      {/* Background Bubbles (Dynamic Role Color) */}
      <Box position="absolute" top={0} left={0} right={0} pointerEvents="none">
        <DynamicTopBubbles
          role={role}
          width={width}
          height={height * 0.48}
        />
      </Box>

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardAvoid}
        >
          <Box
            flex={1}
            paddingHorizontal="l"
            paddingTop="xl"
            paddingBottom="m"
            justifyContent="space-between"
            alignItems="center"
          >
            {/* Top Center Profile & Generic Greeting Section */}
            <Box alignItems="center" width="100%" style={{ marginTop: 120 }}>
              {/* Circular Avatar */}
              <Box
                width={96}
                height={96}
                borderRadius="xl"
                borderWidth={4}
                borderColor="mainBackground"
                backgroundColor="cardBackground"
                justifyContent="center"
                alignItems="center"
                overflow="hidden"
                marginBottom="m"
                shadowColor="black"
                shadowOffset={{ width: 0, height: 4 }}
                shadowOpacity={0.1}
                shadowRadius={10}
                elevation={6}
              >
                {avatarUrl ? (
                  <Image
                    source={{ uri: avatarUrl }}
                    style={styles.avatar}
                    resizeMode="cover"
                  />
                ) : (
                  <Image
                    source={require('@/assets/png/userImage.png')}
                    style={styles.avatar}
                    resizeMode="cover"
                  />
                )}
              </Box>

              {/* User Greeting (Figma: Hello, Romina!!) */}
              <Text variant="h1" color="textPrimary" marginBottom="xs" textAlign="center">
                Hello, {displayName}!!
              </Text>
              <Text variant="bodyLarge" color="textSecondary" marginBottom="xs" textAlign="center">
                Type your password
              </Text>

              {/* Active email indicator */}
              {email ? (
                <Text variant="captionSemiBold" color="textTertiary" marginBottom="l" textAlign="center">
                  Logging in as: {email}
                </Text>
              ) : (
                <Box marginBottom="m" />
              )}

              {/* Password Square Box with Subtle Gray Border & Eye Icon */}
              <Box width="100%" alignItems="center" marginTop="s">
                <Box
                  width="100%"
                  flexDirection="row"
                  alignItems="center"
                  height={54}
                  paddingHorizontal="m"
                  borderRadius="s"
                  borderWidth={1.2}
                  borderColor={isWrongPassword || inlineError ? 'danger' : 'border'}
                  style={[
                    styles.passwordInputContainer,
                    {
                      borderColor:
                        isWrongPassword || inlineError
                          ? theme.colors.danger
                          : '#D1D5DB',
                    },
                  ]}
                  backgroundColor="mainBackground"
                >
                  <TextInput
                    ref={inputRef}
                    style={[
                      styles.passwordInput,
                      { color: theme.colors.textPrimary },
                    ]}
                    placeholder="Enter your password"
                    placeholderTextColor={theme.colors.textTertiary}
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={handlePasswordChange}
                    onSubmitEditing={() => submitLogin(password)}
                    autoCapitalize="none"
                    maxLength={8}
                    autoFocus
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword((prev) => !prev)}
                    style={styles.eyeButton}
                    activeOpacity={0.7}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <EyeIcon
                      visible={showPassword}
                      color={theme.colors.textPrimary}
                    />
                  </TouchableOpacity>
                </Box>
              </Box>

              {/* Character counter feedback */}
              {isTyping && (
                <Text variant="caption" color="textTertiary" marginTop="s">
                  {password.length === 8
                    ? '8/8 characters entered'
                    : `Enter 8 characters (${password.length}/8)`}
                </Text>
              )}

              {/* Inline Error Message */}
              {(inlineError || authError) && (
                <Box marginTop="s" paddingHorizontal="m">
                  <Text variant="caption" color="danger" textAlign="center">
                    {inlineError || authError}
                  </Text>
                </Box>
              )}

              {/* Always visible Login button */}
              <Box width="100%" marginTop="l">
                <Button
                  label="Login"
                  onPress={() => submitLogin(password)}
                  loading={isLoading}
                  disabled={password.length < 8}
                  backgroundColor={role === 'vendor' ? 'vendor' : 'primary'}
                  style={{ backgroundColor: role === 'vendor' ? '#FF5790' : '#004BFF' }}
                  height={52}
                />
              </Box>

              {/* Forgot Password — always visible */}
              <TouchableOpacity
                style={styles.forgotPasswordButton}
                activeOpacity={0.7}
                onPress={handleForgotPassword}
              >
                <Text
                  variant="body"
                  color={role === 'vendor' ? 'vendor' : 'primary'}
                  style={{ color: role === 'vendor' ? '#FF5790' : '#004BFF' }}
                  textAlign="center"
                >
                  Forgot your password?
                </Text>
              </TouchableOpacity>

              {/* Sign Up — always visible */}
              <TouchableOpacity
                style={styles.signUpButton}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('CreateAccount', { role })}
              >
                <Text variant="body" color="textSecondary" textAlign="center">
                  Don't have an account?{' '}
                  <Text
                    variant="body"
                    color={role === 'vendor' ? 'vendor' : 'primary'}
                    style={[styles.signUpText, { color: role === 'vendor' ? '#FF5790' : '#004BFF' }]}
                  >
                    Sign Up
                  </Text>
                </Text>
              </TouchableOpacity>
            </Box>
          </Box>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <MaxAttemptsModal
        visible={isMaxAttemptsModalVisible}
        onDismiss={dismissMaxAttemptsModal}
      />
    </Box>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  passwordInputContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    paddingVertical: 0,
  },
  eyeButton: {
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  forgotPasswordButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  signUpButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  signUpText: {
    fontWeight: '600',
  },
});
