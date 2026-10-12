import React, { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Path, Circle } from 'react-native-svg';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTheme } from '@shopify/restyle';
import { Box, Text, Theme } from '@/theme';
import { fonts } from '@/theme/fonts';
import Button from '@/components/Button';
import MaxAttemptsModal from '@/features/auth/components/MaxAttemptsModal';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useDispatch } from 'react-redux';
import { startOnboarding } from '@/vendor/store/vendorOnboardingSlice';
import { RootStackParamList } from '@/navigation/types';
import { DynamicCreateAccountBubble } from '@/features/auth/components/DynamicBubbles';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type CreateAccountRouteProp = RouteProp<RootStackParamList, 'CreateAccount'>;

const { width } = Dimensions.get('window');

const createAccountSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().optional(),
});

type CreateAccountFormData = z.infer<typeof createAccountSchema>;

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

export default function CreateAccountScreen() {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useDispatch();
  const route = useRoute<CreateAccountRouteProp>();
  const role = route.params?.role || 'customer';
  const theme = useTheme<Theme>();
  const {
    signUp,
    isLoading,
    error: authError,
    clearError,
    isMaxAttemptsModalVisible,
    dismissMaxAttemptsModal,
  } = useAuth();

  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateAccountFormData>({
    resolver: zodResolver(createAccountSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      phone: '',
    },
  });

  const onSubmit = async (data: CreateAccountFormData) => {
    clearError();

    if (role === 'vendor') {
      try {
        await signUp({
          email: data.email,
          password: data.password,
          fullName: data.fullName,
          phone: data.phone,
          role,
        });
      } catch {
        // Continue to onboarding UI seamlessly
      }
      dispatch(startOnboarding());
      return;
    }

    try {
      const res = await signUp({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        phone: data.phone,
        role,
      });

      if (!res.session) {
        Alert.alert(
          'Account Created',
          'Please check your email inbox to confirm your account before logging in.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Login', { role }),
            },
          ]
        );
      }
    } catch {
      // Error handled by useAuth
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <Box flex={1} backgroundColor="mainBackground">
      {/* Background Bubbles (Dynamic Role Color) */}
      <Box position="absolute" top={0} left={0} right={0} pointerEvents="none">
        <DynamicCreateAccountBubble
          role={role}
          width={width}
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
            {/* Title */}
            <Box marginLeft="s" marginTop="xl" marginBottom="l">
              <Text
                variant="display"
                fontSize={role === 'vendor' ? 36 : 42}
                lineHeight={role === 'vendor' ? 42 : 46}
                color="textPrimary"
              >
                {role === 'vendor' ? 'Create Merchant\nAccount' : 'Create\nAccount'}
              </Text>
            </Box>

            {/* Form Fields */}
            <Box style={styles.formContainer}>
              {/* Full Name */}
              <Box>
                <Controller
                  control={control}
                  name="fullName"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Box
                      backgroundColor="cardBackground"
                      borderRadius="l"
                      height={50}
                      paddingHorizontal="m"
                      justifyContent="center"
                      borderWidth={errors.fullName ? 1 : 0}
                      borderColor="danger"
                    >
                      <TextInput
                        style={[
                          styles.input,
                          { color: theme.colors.textPrimary },
                        ]}
                        placeholder="Name"
                        placeholderTextColor={theme.colors.textTertiary}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        autoCapitalize="words"
                      />
                    </Box>
                  )}
                />
                {errors.fullName && (
                  <Text variant="caption" color="danger" marginTop="xs" marginLeft="s">
                    {errors.fullName.message}
                  </Text>
                )}
              </Box>

              {/* Email */}
              <Box>
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Box
                      backgroundColor="cardBackground"
                      borderRadius="l"
                      height={50}
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
                        placeholder="Email"
                        placeholderTextColor={theme.colors.textTertiary}
                        value={value}
                        onChangeText={onChange}
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
              </Box>

              {/* Password */}
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
                          styles.passwordInput,
                          { color: theme.colors.textPrimary },
                        ]}
                        placeholder="Password (8 characters)"
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

              {/* Phone Number (Optional) */}
              <Box>
                <Controller
                  control={control}
                  name="phone"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Box
                      backgroundColor="cardBackground"
                      borderRadius="l"
                      height={50}
                      paddingHorizontal="m"
                      flexDirection="row"
                      alignItems="center"
                    >
                      <Box flexDirection="row" alignItems="center">
                        <Text fontSize={20} marginRight="xs">
                          🇮🇳
                        </Text>
                        <Svg
                          width={10}
                          height={6}
                          viewBox="0 0 10 6"
                          fill="none"
                          style={styles.chevron}
                        >
                          <Path
                            d="M1 1L5 5L9 1"
                            stroke={theme.colors.textTertiary}
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </Svg>
                      </Box>
                      <Box
                        width={1}
                        height={24}
                        backgroundColor="border"
                        marginRight="m"
                      />
                      <TextInput
                        style={[
                          styles.phoneInput,
                          { color: theme.colors.textPrimary },
                        ]}
                        placeholder="Your number"
                        placeholderTextColor={theme.colors.textTertiary}
                        keyboardType="phone-pad"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                      />
                    </Box>
                  )}
                />
              </Box>

              {/* General auth error display */}
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

            {/* Bottom Actions */}
            <Box style={styles.bottomSection}>
              <Box width="100%" marginBottom="s">
                <Button
                  label="Done"
                  onPress={handleSubmit(onSubmit)}
                  loading={isLoading}
                  backgroundColor={role === 'vendor' ? 'vendor' : 'primary'}
                  style={{ backgroundColor: role === 'vendor' ? '#FF5790' : '#004BFF' }}
                  height={56}
                />
              </Box>

              <TouchableOpacity
                style={styles.alreadyAccountRow}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('Login', { role })}
              >
                <Text variant="body" color="textSecondary">
                  I already have an account ·{' '}
                  <Text
                    variant="body"
                    color={role === 'vendor' ? 'vendor' : 'primary'}
                    style={{ color: role === 'vendor' ? '#FF5790' : '#004BFF' }}
                    fontFamily={fonts.nunito.bold}
                  >
                    Log In
                  </Text>
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                activeOpacity={0.7}
                onPress={handleCancel}
              >
                <Text variant="bodyLarge" color="textTertiary">
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  formContainer: {
    gap: 12,
    marginBottom: 24,
  },
  input: {
    fontSize: 16,
    height: '100%',
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  eyeButton: {
    padding: 6,
  },
  chevron: {
    marginRight: 10,
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  cancelButton: {
    paddingVertical: 6,
    paddingHorizontal: 20,
  },
  alreadyAccountRow: {
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomSection: {
    marginTop: 'auto',
    alignItems: 'center',
  },
});
