import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/types';
import { fonts } from '@/theme/fonts';
import BubblesBackground from '@/assets/svg/Bubbles.svg';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width, height } = Dimensions.get('window');

const LoginScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [email, setEmail] = useState('');

  const handleNext = () => {
    // Navigate to Onboarding screen for review
    navigation.navigate('Onboarding');

    // Purana login/password logic (commented out as requested):
    // navigation.navigate('Password', {
    //   email: email.trim() || 'romina@example.com',
    //   name: 'Romina',
    // });
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Background Bubbles */}
      <View style={styles.backgroundWrapper} pointerEvents="none">
        <BubblesBackground width={width} height={height} preserveAspectRatio="xMidYMin slice" />
      </View>

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardAvoid}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={styles.content}>
                {/* Header: Title & Subtitle */}
                <View style={styles.header}>
                  <Text style={styles.title}>Login</Text>
                  <Text style={styles.subtitle}>Good to see you back! 🖤</Text>
                </View>

                {/* Email Input Field */}
                <View style={styles.formSection}>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      placeholder="Email"
                      placeholderTextColor="#8E8E93"
                      value={email}
                      onChangeText={setEmail}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      autoCorrect={false}
                    />
                  </View>
                </View>

                {/* Bottom Actions: Next Button & Cancel */}
                <View style={styles.bottomSection}>
                  <TouchableOpacity
                    style={styles.nextButton}
                    activeOpacity={0.85}
                    onPress={handleNext}
                  >
                    <Text style={styles.nextButtonText}>Next</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.cancelButton}
                    activeOpacity={0.7}
                    onPress={handleCancel}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

export default LoginScreen;

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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  content: {
    paddingHorizontal: 28,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontFamily: fonts.raleway.bold,
    fontSize: 52,
    lineHeight: 58,
    color: '#181C1F',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: fonts.nunito.regular,
    fontSize: 18,
    lineHeight: 24,
    color: '#333333',
  },
  formSection: {
    marginBottom: 20,
  },
  inputWrapper: {
    backgroundColor: '#F7F8F9',
    borderRadius: 16,
    height: 56,
    paddingHorizontal: 18,
    justifyContent: 'center',
  },
  input: {
    fontFamily: fonts.nunito.regular,
    fontSize: 16,
    color: '#181C1F',
    height: '100%',
  },
  bottomSection: {
    alignItems: 'center',
    width: '100%',
  },
  nextButton: {
    backgroundColor: '#004BFE',
    height: 56,
    borderRadius: 16,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#004BFE',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  nextButtonText: {
    fontFamily: fonts.nunito.bold,
    fontSize: 18,
    color: '#FFFFFF',
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  cancelButtonText: {
    fontFamily: fonts.nunito.regular,
    fontSize: 16,
    color: '#181C1F',
  },
});
