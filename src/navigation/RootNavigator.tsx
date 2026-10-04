import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '@shopify/restyle';
import { Theme } from '@/theme';
import { fonts } from '@/theme/fonts';
import { RootStackParamList } from '@/navigation/types';
import TabNavigator from '@/navigation/TabNavigator';
import ProductDetailsScreen from '@/features/product/screens/ProductDetailsScreen';
import {
  OnboardingScreen,
  RedirectToLogin,
  CreateAccountScreen,
  LoginScreen,
  PasswordScreen,
  OtpScreen,
  ForgotPasswordScreen,
  SetupNewPasswordScreen,
} from '@/features/auth/screens';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const theme = useTheme<Theme>();

  return (
    <Stack.Navigator
      initialRouteName="Tabs"
      screenOptions={{
        headerShadowVisible: false,
        headerTintColor: theme.colors.textPrimary,
        headerStyle: { backgroundColor: theme.colors.mainBackground },
        headerTitleStyle: { fontFamily: fonts.raleway.bold, fontSize: 18 },
      }}
    >
      {/* 11 & 12 Onboarding Flow */}
      <Stack.Screen
        name="Onboarding"
        component={OnboardingScreen}
        options={{ headerShown: false }}
      />

      {/* 01 Start Screen */}
      <Stack.Screen
        name="Start"
        component={RedirectToLogin}
        options={{ headerShown: false }}
      />

      {/* 02 Create Account Screen */}
      <Stack.Screen
        name="CreateAccount"
        component={CreateAccountScreen}
        options={{ headerShown: false }}
      />

      {/* 03 Login Screen */}
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />

      {/* 04 Password Screen */}
      <Stack.Screen
        name="Password"
        component={PasswordScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{ title: 'Reset Password', headerShown: false }}
      />
      <Stack.Screen
        name="Otp"
        component={OtpScreen}
        options={{ title: 'Verify Code', headerShown: false }}
      />
      <Stack.Screen
        name="SetupNewPassword"
        component={SetupNewPasswordScreen}
        options={{ title: 'Setup New Password', headerShown: false }}
      />

      {/* Main App Tabs */}
      <Stack.Screen
        name="Tabs"
        component={TabNavigator}
        options={{ headerShown: false }}
      />

      {/* Product Details */}
      <Stack.Screen
        name="ProductDetails"
        component={ProductDetailsScreen}
        options={({ route }) => ({ title: route.params.name })}
      />
    </Stack.Navigator>
  );
}