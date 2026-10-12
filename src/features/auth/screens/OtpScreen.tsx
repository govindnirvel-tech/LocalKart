import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { fonts } from '@/theme/fonts';
import { Box, Text } from '@/theme';
import Button from '@/components/Button';
import MaxAttemptsModal from '@/features/auth/components/MaxAttemptsModal';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { getCachedAvatar } from '@/utils/userAvatarStorage';
import { RootStackParamList } from '@/navigation/types';
import RightTopBubble from '@/assets/svg/right_top_bubble.svg';

type Props = NativeStackScreenProps<RootStackParamList, 'Otp'>;

const { width } = Dimensions.get('window');
const OTP_LENGTH = 6;
const COOLDOWN_SECONDS = 60;

export default function OtpScreen({ navigation, route }: Props) {
  const email = route.params?.phoneOrEmail || '';

  const {
    verifyRecoveryOtp,
    resetPassword,
    isLoading,
    error: authError,
    clearError,
    isMaxAttemptsModalVisible,
    dismissMaxAttemptsModal,
  } = useAuth();

  const [code, setCode] = useState('');
  const [cooldown, setCooldown] = useState(COOLDOWN_SECONDS);
  const [inlineError, setInlineError] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const inputRef = useRef<any>(null);

  useEffect(() => {
    getCachedAvatar().then((cached) => {
      setAvatarUrl(cached || null);
    });
  }, []);

  // 60-second cooldown timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (cooldown > 0) {
      interval = setInterval(() => {
        setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [cooldown]);

  const handleCodeChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, OTP_LENGTH);
    setCode(cleaned);
    if (inlineError) setInlineError('');
    clearError();

    if (cleaned.length === OTP_LENGTH) {
      submitCode(cleaned);
    }
  };

  const submitCode = async (otpCode: string) => {
    if (otpCode.length < OTP_LENGTH) {
      setInlineError(`Please enter all ${OTP_LENGTH} digits`);
      return;
    }

    try {
      await verifyRecoveryOtp({
        email,
        token: otpCode,
      });
      navigation.navigate('SetupNewPassword');
    } catch {
      setInlineError('Invalid or expired code. Please try again.');
    }
  };

  const handleSendAgain = async () => {
    if (cooldown > 0) return;
    clearError();
    setInlineError('');

    try {
      await resetPassword(email);
      setCooldown(COOLDOWN_SECONDS);
      setCode('');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } catch {
      // Handled by useAuth (e.g. rate limit modal)
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <Box flex={1} backgroundColor="mainBackground">
      {/* Background Bubble */}
      <Box position="absolute" top={0} left={0} right={0} pointerEvents="none">
        <RightTopBubble
          width={width}
          height={width * (262 / 355)}
          preserveAspectRatio="xMidYMin slice"
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
            {/* Top Center: Circular Avatar & Title */}
            <Box alignItems="center" width="100%" marginTop="l">
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
                marginBottom="l"
                shadowColor="black"
                shadowOffset={{ width: 0, height: 4 }}
                shadowOpacity={0.1}
                shadowRadius={10}
                elevation={6}
              >
                <Image
                  source={
                    avatarUrl
                      ? { uri: avatarUrl }
                      : require('@/assets/png/userImage.png')
                  }
                  style={styles.avatar}
                  resizeMode="cover"
                />
              </Box>

              <Text variant="h2" color="textPrimary" marginBottom="s" textAlign="center">
                Password Recovery
              </Text>
              <Text
                variant="bodyLarge"
                color="textSecondary"
                textAlign="center"
                marginBottom="xs"
                lineHeight={24}
              >
                Enter 6-digit code we sent to
              </Text>
              <Text
                variant="title"
                color="textPrimary"
                textAlign="center"
                marginBottom="l"
              >
                {email || 'your email'}
              </Text>

              {/* 6 Digit Boxes Container with full-overlay TextInput */}
              <Box width="100%" alignItems="center" position="relative" marginTop="s">
                <Box style={styles.digitBoxesRow} pointerEvents="none">
                  {Array.from({ length: OTP_LENGTH }).map((_, index) => {
                    const digit = code[index] || '';
                    const isCurrent = code.length === index;

                    return (
                      <Box
                        key={index}
                        width={44}
                        height={52}
                        borderRadius="m"
                        backgroundColor="cardBackground"
                        justifyContent="center"
                        alignItems="center"
                        borderWidth={isCurrent ? 1.5 : 1}
                        borderColor={
                          inlineError
                            ? 'danger'
                            : isCurrent
                            ? 'primary'
                            : 'border'
                        }
                      >
                        <Text
                          variant="h2"
                          color="textPrimary"
                          textAlign="center"
                        >
                          {digit}
                        </Text>
                      </Box>
                    );
                  })}
                </Box>

                {/* Transparent TextInput covering the full box area */}
                <TextInput
                  ref={inputRef}
                  style={styles.fullOverlayInput}
                  keyboardType="number-pad"
                  maxLength={OTP_LENGTH}
                  value={code}
                  onChangeText={handleCodeChange}
                  autoFocus
                />
              </Box>

              {/* Inline error */}
              {(inlineError || authError) && (
                <Box marginTop="s" paddingHorizontal="m">
                  <Text variant="caption" color="danger" textAlign="center">
                    {inlineError || authError}
                  </Text>
                </Box>
              )}
            </Box>

            {/* Bottom Actions: Send Again with 60s cooldown & Cancel */}
            <Box alignItems="center" width="100%" marginBottom="s">
              <Box width="100%" marginBottom="s">
                <TouchableOpacity
                  style={[
                    styles.sendAgainButton,
                    {
                      backgroundColor:
                        cooldown > 0 ? '#FFA8C4' : '#FF4B81',
                    },
                  ]}
                  activeOpacity={0.85}
                  onPress={handleSendAgain}
                  disabled={cooldown > 0 || isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.sendAgainButtonText}>
                      {cooldown > 0
                        ? `Send Again (${cooldown}s)`
                        : 'Send Again'}
                    </Text>
                  )}
                </TouchableOpacity>
              </Box>

              <TouchableOpacity
                style={styles.cancelButton}
                activeOpacity={0.7}
                onPress={handleCancel}
              >
                <Text variant="bodyLarge" color="textPrimary">
                  Cancel
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
  fullOverlayInput: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.01,
  },
  digitBoxesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  sendAgainButton: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF4B81',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  sendAgainButtonText: {
    fontFamily: fonts.raleway.bold,
    fontSize: 16,
    color: '#FFFFFF',
  },
});
