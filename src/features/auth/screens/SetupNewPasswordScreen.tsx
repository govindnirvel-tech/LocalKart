import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/types';
import { fonts } from '@/theme/fonts';
import RightTopBubble from '@/assets/svg/right_top_bubble.svg';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width, height } = Dimensions.get('window');

export default function SetupNewPasswordScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [newPassword, setNewPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!newPassword.trim()) {
      setError('Please enter a new password');
      return;
    }
    if (newPassword !== repeatPassword) {
      setError('Passwords do not match');
      return;
    }

    Alert.alert(
      'Password Updated',
      'Your password has been changed successfully. Please login with your new password.',
      [
        {
          text: 'Login Now',
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          },
        },
      ]
    );
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Background: right_top_bubble.svg */}
      <View style={styles.backgroundWrapper} pointerEvents="none">
        <RightTopBubble
          width={width}
          height={width * (262 / 355)}
          preserveAspectRatio="xMidYMin slice"
        />
      </View>

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.content}>
          {/* Top Center: Romina Avatar & Instructions */}
          <View style={styles.centerSection}>
            {/* Romina Circular Avatar */}
            <View style={styles.avatarWrapper}>
              <Image
                source={require('@/assets/png/Group 1000004658 (1).png')}
                style={styles.avatar}
                resizeMode="contain"
              />
            </View>

            {/* Heading & Subtitle */}
            <Text style={styles.title}>Setup New Password</Text>
            <Text style={styles.subtitle}>
              Please, setup a new password for{'\n'}your account
            </Text>

            {/* Input Fields */}
            <View style={styles.form}>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="New Password"
                  placeholderTextColor="#8E8E93"
                  secureTextEntry
                  value={newPassword}
                  onChangeText={(text) => {
                    setNewPassword(text);
                    if (error) setError('');
                  }}
                />
              </View>

              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Repeat Password"
                  placeholderTextColor="#8E8E93"
                  secureTextEntry
                  value={repeatPassword}
                  onChangeText={(text) => {
                    setRepeatPassword(text);
                    if (error) setError('');
                  }}
                />
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}
            </View>
          </View>

          {/* Bottom Actions: Save Button & Cancel */}
          <View style={styles.bottomSection}>
            <TouchableOpacity
              style={styles.saveButton}
              activeOpacity={0.85}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>Save</Text>
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
      </SafeAreaView>
    </View>
  );
}

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
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: height * 0.09,
    paddingBottom: 24,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  centerSection: {
    alignItems: 'center',
    width: '100%',
    marginTop: height * 0.03,
  },
  avatarWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontFamily: fonts.raleway.bold,
    fontSize: 26,
    lineHeight: 32,
    color: '#181C1F',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: fonts.nunito.regular,
    fontSize: 16,
    lineHeight: 24,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 28,
  },
  form: {
    width: '100%',
    gap: 14,
  },
  inputWrapper: {
    backgroundColor: '#F7F7F8',
    borderRadius: 16,
    height: 52,
    paddingHorizontal: 18,
    justifyContent: 'center',
  },
  input: {
    fontFamily: fonts.nunito.regular,
    fontSize: 16,
    color: '#181C1F',
    height: '100%',
    textAlign: 'center',
  },
  errorText: {
    fontFamily: fonts.nunito.regular,
    fontSize: 13,
    color: '#EB5757',
    marginTop: 2,
    textAlign: 'center',
  },
  bottomSection: {
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: '#004BFE',
    height: 56,
    borderRadius: 16,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#004BFE',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  saveButtonText: {
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
