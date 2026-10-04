import React, { useState } from 'react';
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
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Path, Circle } from 'react-native-svg';
import { launchImageLibrary } from 'react-native-image-picker';
import { RootStackParamList } from '@/navigation/types';
import { fonts } from '@/theme/fonts';
import CreateAccountBubble from '@/assets/svg/create_account_bubble.svg';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get('window');

// Eye Icon SVG for password toggle
const EyeIcon = ({ visible = false, color = '#8E8E93', size = 22 }: { visible?: boolean; color?: string; size?: number }) => (
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
        <Path d="M1 1l22 22" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </>
    )}
  </Svg>
);

const CreateAccountScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  const handlePickAvatar = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        selectionLimit: 1,
        quality: 0.8,
      },
      (response) => {
        if (response.assets && response.assets.length > 0 && response.assets[0].uri) {
          setAvatarUri(response.assets[0].uri);
        }
      }
    );
  };

  const handleDone = () => {
    // Navigate to main app
    navigation.reset({
      index: 0,
      routes: [{ name: 'Tabs', params: { screen: 'Home' } }],
    });
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Background Bubbles */}
      <View style={styles.backgroundWrapper} pointerEvents="none">
        <CreateAccountBubble width={width} height={width * (308 / 375)} preserveAspectRatio="xMidYMin slice" />
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
          >
            {/* Title */}
            <View style={styles.header}>
              <Text style={styles.title}>Create{'\n'}Account</Text>
            </View>

            {/* Profile Avatar Picker */}
            <View style={styles.avatarSection}>
              <TouchableOpacity
                style={styles.avatarPickerButton}
                onPress={handlePickAvatar}
                activeOpacity={0.8}
              >
                {avatarUri ? (
                  <View style={styles.avatarCircle}>
                    <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
                  </View>
                ) : (
                  <Image
                    source={require('@/assets/png/Upload Photo.png')}
                    style={styles.uploadPhotoIcon}
                    resizeMode="contain"
                  />
                )}
              </TouchableOpacity>
            </View>

            {/* Form Fields */}
            <View style={styles.form}>
              {/* Email */}
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#8E8E93"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              {/* Password */}
              <View style={styles.passwordWrapper}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Password"
                  placeholderTextColor="#8E8E93"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                  activeOpacity={0.7}
                >
                  <EyeIcon visible={showPassword} />
                </TouchableOpacity>
              </View>

              {/* Phone Number */}
              <View style={styles.phoneWrapper}>
                <View style={styles.flagSection}>
                  <Text style={styles.flagEmoji}>🇬🇧</Text>
                  <Svg width={10} height={6} viewBox="0 0 10 6" fill="none" style={styles.chevron}>
                    <Path d="M1 1L5 5L9 1" stroke="#8E8E93" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </View>
                <View style={styles.phoneDivider} />
                <TextInput
                  style={styles.phoneInput}
                  placeholder="Your number"
                  placeholderTextColor="#8E8E93"
                  keyboardType="phone-pad"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                />
              </View>
            </View>

            {/* Bottom Actions */}
            <View style={styles.bottomSection}>
              <TouchableOpacity
                style={styles.doneButton}
                activeOpacity={0.85}
                onPress={handleDone}
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                activeOpacity={0.7}
                onPress={handleCancel}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

export default CreateAccountScreen;

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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  header: {
    marginLeft: 14,
    marginTop: 115,
    marginBottom: 18,
  },
  title: {
    fontFamily: fonts.raleway.bold,
    fontSize: 44,
    lineHeight: 48,
    color: '#181C1F',
    letterSpacing: -0.5,
  },
  avatarSection: {
    alignItems: 'flex-start',
    marginBottom: 36,
  },
  avatarPickerButton: {
    width: 90,
    height: 90,
    marginLeft: 26,
    marginTop: 55,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadPhotoIcon: {
    width: 90,
    height: 90,
  },
  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  form: {
    gap: 12,
    marginBottom: 24,
  },
  inputWrapper: {
    backgroundColor: '#F7F7F8',
    borderRadius: 16,
    height: 50,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  input: {
    fontFamily: fonts.nunito.regular,
    fontSize: 16,
    color: '#181C1F',
    height: '100%',
  },
  passwordWrapper: {
    backgroundColor: '#F7F7F8',
    borderRadius: 16,
    height: 50,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    fontFamily: fonts.nunito.regular,
    fontSize: 16,
    color: '#181C1F',
    height: '100%',
  },
  eyeButton: {
    padding: 6,
  },
  phoneWrapper: {
    backgroundColor: '#F7F7F8',
    borderRadius: 16,
    height: 50,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  flagSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flagEmoji: {
    fontSize: 20,
    marginRight: 6,
  },
  chevron: {
    marginRight: 10,
  },
  phoneDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#D1D5DB',
    marginRight: 12,
  },
  phoneInput: {
    flex: 1,
    fontFamily: fonts.nunito.regular,
    fontSize: 16,
    color: '#181C1F',
    height: '100%',
  },
  bottomSection: {
    marginTop: 'auto',
    alignItems: 'center',
  },
  doneButton: {
    backgroundColor: '#004BFE',
    height: 56,
    borderRadius: 16,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#004BFE',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  doneButtonText: {
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
