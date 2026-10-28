import React, { useState, useEffect, useRef } from 'react';
import { ActivityIndicator, Image, StyleSheet, Animated } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '@shopify/restyle';
import { Box, Text, Theme } from '@/theme';
import { fonts } from '@/theme/fonts';
import { RootStackParamList } from '@/navigation/types';
import TabNavigator from '@/navigation/TabNavigator';
import ProductDetailsScreen from '@/features/product/screens/ProductDetailsScreen';
import CategoryProductsScreen from '@/features/product/screens/CategoryProductsScreen';
import AllCategoriesScreen from '@/features/home/screens/AllCategoriesScreen';
import FlashSaleScreen from '@/features/product/screens/FlashSaleScreen';
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
import { RoleSelectionScreen } from '@/role';
import {
  VendorOnboardingScreen,
  VendorUnderReviewScreen,
  VendorDashboardScreen,
  VendorNavigator,
  VendorInventoryScreen,
} from '@/vendor';
import { ChatListScreen } from '@/features/chat/screens/ChatListScreen';
import { ChatRoomScreen } from '@/features/chat/screens/ChatRoomScreen';
import { ActiveCallScreen } from '@/features/call/screens/ActiveCallScreen';
import { IncomingCallModal } from '@/features/call/components/IncomingCallModal';
import { useCallSignaling } from '@/features/call/hooks/useCallSignaling';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useAuth, useAuthSubscription } from '@/features/auth/hooks/useAuth';

const Stack = createNativeStackNavigator<RootStackParamList>();

function SplashScreen() {
  const theme = useTheme<Theme>();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  return (
    <Box
      flex={1}
      backgroundColor="mainBackground"
      justifyContent="space-between"
      alignItems="center"
      paddingVertical="xl"
      paddingHorizontal="l"
    >
      {/* Top spacer to balance the footer */}
      <Box height={40} />

      {/* Center Animated Logo & Branding */}
      <Animated.View
        style={{
          alignItems: 'center',
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }}
      >
        <Box
          marginBottom="m"
          alignItems="center"
          justifyContent="center"
          shadowColor="black"
          shadowOffset={{ width: 0, height: 6 }}
          shadowOpacity={0.12}
          shadowRadius={14}
          elevation={8}
        >
          <Image
            source={require('@/assets/png/shop_icon_with_round_circle.png')}
            style={styles.splashLogo}
            resizeMode="contain"
          />
        </Box>

        <Text
          variant="hero"
          color="textPrimary"
          fontSize={38}
          marginBottom="xs"
          textAlign="center"
        >
          LocalKart
        </Text>

        <Text
          variant="caption"
          color="textSecondary"
          style={styles.presentsText}
        >
          PRESENTED BY VIBECRAFT STUDIOS
        </Text>

        <Box marginTop="l">
          <ActivityIndicator size="small" color={theme.colors.primary} />
        </Box>
      </Animated.View>

      {/* Bottom Footer Credit */}
      <Animated.View style={{ opacity: fadeAnim, alignItems: 'center', marginBottom: 12 }}>
        <Text
          variant="caption"
          color="textTertiary"
          style={styles.footerBrand}
        >
          Crafted with ❤️ by VibeCraft Studios
        </Text>
      </Animated.View>
    </Box>
  );
}

export default function RootNavigator() {
  const theme = useTheme<Theme>();
  useAuthSubscription();
  const { isAuthenticated, isInitialized } = useAuth();
  const authUser = useSelector((state: RootState) => state.auth.user);
  const { currentMode, approvalStatus } = useSelector(
    (state: RootState) => state.vendorOnboarding
  );

  // Real-time call signaling listener for incoming calls
  useCallSignaling(authUser?.id || null);

  // Smooth 2.2s minimum splash display timer
  const [minSplashElapsed, setMinSplashElapsed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMinSplashElapsed(true);
    }, 2200);
    return () => clearTimeout(timer);
  }, []);

  if (!isInitialized || !minSplashElapsed) {
    return <SplashScreen />;
  }

  return (
    <>
      <Stack.Navigator
      screenOptions={{
        animation: 'slide_from_right',
        headerShadowVisible: false,
        headerTintColor: theme.colors.textPrimary,
        headerStyle: { backgroundColor: theme.colors.mainBackground },
        headerTitleStyle: { fontFamily: fonts.raleway.bold, fontSize: 18 },
      }}
    >
      {isAuthenticated ? (
        currentMode === 'vendor' ? (
          // Authenticated Vendor Stack
          <>
            {approvalStatus === 'APPROVED' ? (
              <>
                <Stack.Screen
                  name="VendorTabs"
                  component={VendorNavigator}
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="VendorInventory"
                  component={VendorInventoryScreen}
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="VendorDashboard"
                  component={VendorDashboardScreen}
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="VendorOnboarding"
                  component={VendorOnboardingScreen}
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="VendorUnderReview"
                  component={VendorUnderReviewScreen}
                  options={{ headerShown: false }}
                />
              </>
            ) : approvalStatus === 'UNDER_REVIEW' ? (
              <>
                <Stack.Screen
                  name="VendorUnderReview"
                  component={VendorUnderReviewScreen}
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="VendorTabs"
                  component={VendorNavigator}
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="VendorDashboard"
                  component={VendorDashboardScreen}
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="VendorOnboarding"
                  component={VendorOnboardingScreen}
                  options={{ headerShown: false }}
                />
              </>
            ) : (
              <>
                <Stack.Screen
                  name="VendorOnboarding"
                  component={VendorOnboardingScreen}
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="VendorUnderReview"
                  component={VendorUnderReviewScreen}
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="VendorTabs"
                  component={VendorNavigator}
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="VendorDashboard"
                  component={VendorDashboardScreen}
                  options={{ headerShown: false }}
                />
              </>
            )}
            <Stack.Screen
              name="ChatList"
              component={ChatListScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ChatRoom"
              component={ChatRoomScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ActiveCall"
              component={ActiveCallScreen}
              options={{ headerShown: false, animation: 'fade' }}
            />
          </>
        ) : (
          // Authenticated Customer Stack (100% untouched)
          <>
            <Stack.Screen
              name="Tabs"
              component={TabNavigator}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ProductDetails"
              component={ProductDetailsScreen}
              options={{
                headerShown: false,
                animation: 'slide_from_bottom',
              }}
            />
            <Stack.Screen
              name="CategoryProducts"
              component={CategoryProductsScreen}
              options={{
                headerShown: false,
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="AllCategories"
              component={AllCategoriesScreen}
              options={{
                headerShown: false,
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="FlashSale"
              component={FlashSaleScreen}
              options={{
                headerShown: false,
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="ChatList"
              component={ChatListScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ChatRoom"
              component={ChatRoomScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ActiveCall"
              component={ActiveCallScreen}
              options={{ headerShown: false, animation: 'fade' }}
            />
          </>
        )
      ) : (
        // Auth Stack
        <>
          <Stack.Screen
            name="Start"
            component={RedirectToLogin}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="RoleSelection"
            component={RoleSelectionScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Password"
            component={PasswordScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="CreateAccount"
            component={CreateAccountScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="VendorOnboarding"
            component={VendorOnboardingScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="VendorUnderReview"
            component={VendorUnderReviewScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="VendorTabs"
            component={VendorNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="VendorInventory"
            component={VendorInventoryScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="VendorDashboard"
            component={VendorDashboardScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ForgotPassword"
            component={ForgotPasswordScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Otp"
            component={OtpScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="SetupNewPassword"
            component={SetupNewPasswordScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ChatList"
            component={ChatListScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ChatRoom"
            component={ChatRoomScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ActiveCall"
            component={ActiveCallScreen}
            options={{ headerShown: false, animation: 'fade' }}
          />
        </>
      )}
    </Stack.Navigator>
    <IncomingCallModal />
    </>
  );
}

const styles = StyleSheet.create({
  splashLogo: {
    width: 120,
    height: 120,
  },
  presentsText: {
    letterSpacing: 2.2,
    fontSize: 11,
    fontFamily: fonts.raleway.bold,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  footerBrand: {
    letterSpacing: 0.8,
    fontSize: 12,
    fontFamily: fonts.raleway.medium,
  },
});