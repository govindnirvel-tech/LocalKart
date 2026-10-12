import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Svg, { Path, Circle } from 'react-native-svg';
import { useTheme } from '@shopify/restyle';
import { Box, Text, Theme } from '@/theme';
import Button from '@/components/Button';
import MaxAttemptsModal from '@/features/auth/components/MaxAttemptsModal';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { getCachedAvatar } from '@/utils/userAvatarStorage';
import { RootStackParamList } from '@/navigation/types';
import RightTopBubble from '@/assets/svg/right_top_bubble.svg';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ScreenRouteProp = RouteProp<RootStackParamList, 'ForgotPassword'>;

const { width } = Dimensions.get('window');

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

const CheckCircleIcon = ({
  fill,
  checkColor,
}: {
  fill: string;
  checkColor: string;
}) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="12" fill={fill} />
    <Path
      d="M7 12.5L10.5 16L17 8.5"
      stroke={checkColor}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default function ForgotPasswordScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRouteProp>();
  const theme = useTheme<Theme>();
  const initialEmail = (route.params as any)?.email || '';

  const {
    resetPassword,
    isLoading,
    error: authError,
    clearError,
    isMaxAttemptsModalVisible,
    dismissMaxAttemptsModal,
  } = useAuth();

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    clearError();
    getCachedAvatar().then((cached) => {
      setAvatarUrl(cached || null);
    });
  }, [clearError]);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: initialEmail,
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    clearError();
    try {
      await resetPassword(data.email);
      navigation.navigate('Otp', {
        phoneOrEmail: data.email.trim(),
      });
    } catch {
      // Error handled by useAuth
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
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Top Center: Generic Avatar & Titles */}
            <Box alignItems="center" width="100%" marginTop="l">
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

              {/* Heading & Subtitle */}
              <Text variant="h2" color="textPrimary" marginBottom="s" textAlign="center">
                Password Recovery
              </Text>
              <Text
                variant="bodyLarge"
                color="textSecondary"
                textAlign="center"
                marginBottom="l"
                lineHeight={24}
              >
                How you would like to restore{'\n'}your password?
              </Text>

              {/* Recovery Method: Email Only (SMS option hidden per requirements) */}
              <Box width="100%" maxWidth={320} marginBottom="m">
                <Box
                  height={52}
                  borderRadius="xl"
                  paddingHorizontal="m"
                  flexDirection="row"
                  alignItems="center"
                  justifyContent="center"
                  backgroundColor="primarySoft"
                  borderWidth={1}
                  borderColor="primary"
                >
                  <Text variant="button" color="primary" textAlign="center">
                    Email
                  </Text>
                  <Box position="absolute" right={18}>
                    <CheckCircleIcon
                      fill={theme.colors.primary}
                      checkColor={theme.colors.white as string}
                    />
                  </Box>
                </Box>
              </Box>

              {/* Email Input Field */}
              <Box width="100%" maxWidth={320} marginBottom="m">
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Box
                      backgroundColor="cardBackground"
                      borderRadius="l"
                      height={52}
                      paddingHorizontal="m"
                      justifyContent="center"
                      borderWidth={errors.email ? 1 : 0}
                      borderColor="danger"
                    >
                      <TextInput
                        style={[
                          styles.input,
                          { color: theme.colors.textPrimary },
                        ]}
                        placeholder="Enter your email"
                        placeholderTextColor={theme.colors.textTertiary}
                        value={value}
                        onChangeText={(text) => {
                          onChange(text);
                          if (authError) clearError();
                        }}
                        onBlur={onBlur}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        autoCorrect={false}
                      />
                    </Box>
                  )}
                />
                {errors.email && (
                  <Text variant="caption" color="danger" marginTop="xs" marginLeft="s">
                    {errors.email.message}
                  </Text>
                )}
                {authError && (
                  <Box
                    backgroundColor="dangerLight"
                    padding="s"
                    borderRadius="m"
                    marginTop="xs"
                  >
                    <Text variant="caption" color="danger" textAlign="center">
                      {authError}
                    </Text>
                  </Box>
                )}
              </Box>
            </Box>

            {/* Bottom Actions: Next Button & Cancel */}
            <Box alignItems="center" width="100%" marginBottom="s">
              <Box width="100%" marginBottom="s">
                <Button
                  label="Next"
                  onPress={handleSubmit(onSubmit)}
                  loading={isLoading}
                  height={56}
                />
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
          </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 24,
    paddingBottom: 24,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  input: {
    fontSize: 16,
    height: '100%',
    textAlign: 'center',
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
});
