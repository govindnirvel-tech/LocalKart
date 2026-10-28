import React from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTheme } from '@shopify/restyle';
import { Box, Text, Theme } from '@/theme';
import Button from '@/components/Button';
import { RootStackParamList } from '@/navigation/types';
import { DynamicLoginBubbles } from '@/features/auth/components/DynamicBubbles';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type LoginRouteProp = RouteProp<RootStackParamList, 'Login'>;

const { width, height } = Dimensions.get('window');

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<LoginRouteProp>();
  const role = route.params?.role || 'customer';
  const theme = useTheme<Theme>();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
    },
  });

  const handleNext = (data: LoginFormData) => {
    navigation.navigate('Password', {
      email: data.email.trim(),
      role,
    });
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <Box flex={1} backgroundColor="mainBackground">
      {/* Background Bubbles (Dynamic Role Color) */}
      <Box position="absolute" top={0} left={0} right={0} bottom={0} pointerEvents="none">
        <DynamicLoginBubbles role={role} width={width} height={height} />
      </Box>

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 25}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <Box style={styles.formWrapper}>
                {/* Top spacer to keep content at bottom when keyboard is hidden */}
                <Box flex={1} minHeight={60} />

                <Box paddingHorizontal="l" paddingBottom="l">
                  {/* Header: Title & Subtitle */}
                  <Box marginBottom="m">
                    <Text
                      variant="display"
                      fontSize={46}
                      lineHeight={62}
                      color="textPrimary"
                      marginBottom="s"
                      style={styles.loginTitle}
                    >
                      Login
                    </Text>
                    <Text variant="bodyLarge" color="textSecondary">
                      Good to see you back! 🖤
                    </Text>
                  </Box>

                  {/* Email Input Field with react-hook-form + zod */}
                  <Box marginBottom="l">
                    <Controller
                      control={control}
                      name="email"
                      render={({ field: { onChange, onBlur, value } }) => (
                        <Box
                          backgroundColor="cardBackground"
                          borderRadius="l"
                          height={56}
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

                  {/* Bottom Actions: Next Button & Cancel */}
                  <Box alignItems="center" width="100%">
                    <Box width="100%" marginBottom="s">
                      <Button
                        label="Next"
                        onPress={handleSubmit(handleNext)}
                        backgroundColor={role === 'vendor' ? 'vendor' : 'primary'}
                        style={{ backgroundColor: role === 'vendor' ? '#FF5790' : '#004BFF' }}
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
                </Box>
              </Box>
            </TouchableWithoutFeedback>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
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
  },
  formWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  input: {
    fontSize: 16,
    height: '100%',
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  loginTitle: {
    paddingBottom: 8,
    includeFontPadding: false,
  },
});
