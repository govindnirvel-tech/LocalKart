import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
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

const { width } = Dimensions.get('window');

const setupNewPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type SetupNewPasswordFormData = z.infer<typeof setupNewPasswordSchema>;

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

export default function SetupNewPasswordScreen() {
  const navigation = useNavigation<NavigationProp>();
  const theme = useTheme<Theme>();

  const {
    updatePassword,
    signOut,
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

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SetupNewPasswordFormData>({
    resolver: zodResolver(setupNewPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: SetupNewPasswordFormData) => {
    clearError();
    try {
      await updatePassword(data.password);
      await signOut();
      Alert.alert(
        'Password Updated',
        'Your password has been changed successfully. Please log in with your new password.',
        [
          {
            text: 'Login',
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            },
          },
        ]
      );
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
            {/* Top Center: Circular Avatar & Instructions */}
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
                Setup New Password
              </Text>
              <Text
                variant="bodyLarge"
                color="textSecondary"
                textAlign="center"
                marginBottom="l"
                lineHeight={24}
              >
                Please, setup a new password for{'\n'}your account
              </Text>

              {/* Input Fields */}
              <Box width="100%" maxWidth={320} style={styles.formGap}>
                {/* New Password */}
                <Box>
                  <Controller
                    control={control}
                    name="password"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Box
                        backgroundColor="cardBackground"
                        borderRadius="l"
                        height={50}
                        paddingHorizontal="m"
                        flexDirection="row"
                        alignItems="center"
                        borderWidth={errors.password ? 1 : 0}
                        borderColor="danger"
                      >
                        <TextInput
                          style={[
                            styles.input,
                            { color: theme.colors.textPrimary },
                          ]}
                          placeholder="New Password"
                          placeholderTextColor={theme.colors.textTertiary}
                          secureTextEntry={!showPassword}
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          autoCapitalize="none"
                          maxLength={8}
                        />
                        <TouchableOpacity
                          onPress={() => setShowPassword(!showPassword)}
                          style={styles.eyeButton}
                          activeOpacity={0.7}
                        >
                          <EyeIcon
                            visible={showPassword}
                            color={theme.colors.textTertiary}
                          />
                        </TouchableOpacity>
                      </Box>
                    )}
                  />
                  {errors.password && (
                    <Text variant="caption" color="danger" marginTop="xs" marginLeft="s">
                      {errors.password.message}
                    </Text>
                  )}
                </Box>

                {/* Confirm Password */}
                <Box>
                  <Controller
                    control={control}
                    name="confirmPassword"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Box
                        backgroundColor="cardBackground"
                        borderRadius="l"
                        height={50}
                        paddingHorizontal="m"
                        flexDirection="row"
                        alignItems="center"
                        borderWidth={errors.confirmPassword ? 1 : 0}
                        borderColor="danger"
                      >
                        <TextInput
                          style={[
                            styles.input,
                            { color: theme.colors.textPrimary },
                          ]}
                          placeholder="Repeat Password"
                          placeholderTextColor={theme.colors.textTertiary}
                          secureTextEntry={!showConfirmPassword}
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          autoCapitalize="none"
                          maxLength={8}
                        />
                        <TouchableOpacity
                          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                          style={styles.eyeButton}
                          activeOpacity={0.7}
                        >
                          <EyeIcon
                            visible={showConfirmPassword}
                            color={theme.colors.textTertiary}
                          />
                        </TouchableOpacity>
                      </Box>
                    )}
                  />
                  {errors.confirmPassword && (
                    <Text variant="caption" color="danger" marginTop="xs" marginLeft="s">
                      {errors.confirmPassword.message}
                    </Text>
                  )}
                </Box>

                {/* Error Banner */}
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

            {/* Bottom Actions: Save Button & Cancel */}
            <Box alignItems="center" width="100%" marginBottom="s">
              <Box width="100%" marginBottom="s">
                <Button
                  label="Save"
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
  formGap: {
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  eyeButton: {
    padding: 6,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
});
