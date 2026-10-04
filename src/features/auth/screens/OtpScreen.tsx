import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  Dimensions,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Svg, { Path, Circle } from 'react-native-svg';
import { RootStackParamList } from '@/navigation/types';
import { fonts } from '@/theme/fonts';
import RightTopBubble from '@/assets/svg/right_top_bubble.svg';

type Props = NativeStackScreenProps<RootStackParamList, 'Otp'>;

const { width, height } = Dimensions.get('window');

// Exclamation mark icon for max attempts modal
const ExclamationIcon = () => (
  <Svg width={48} height={48} viewBox="0 0 48 48" fill="none">
    <Circle cx="24" cy="24" r="24" fill="#FDEEEF" />
    <Circle cx="24" cy="24" r="16" stroke="#EB5757" strokeWidth="2.5" />
    <Path d="M24 16V25" stroke="#EB5757" strokeWidth="2.5" strokeLinecap="round" />
    <Circle cx="24" cy="30" r="1.5" fill="#EB5757" />
  </Svg>
);

export default function OtpScreen({ navigation }: Props) {
  const [code, setCode] = useState('');
  const [resendCount, setResendCount] = useState(0);
  const [showMaxAttempts, setShowMaxAttempts] = useState(false);
  const inputRef = useRef<any>(null);

  const handleCodeChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, 4);
    setCode(cleaned);

    // When 4 digits entered, automatically navigate to 09 Setup New Password
    if (cleaned.length === 4) {
      setTimeout(() => {
        navigation.navigate('SetupNewPassword');
      }, 250);
    }
  };

  const handleSendAgain = () => {
    const nextCount = resendCount + 1;
    setResendCount(nextCount);

    if (nextCount >= 3) {
      // 10 Maximum Attempts popup
      setShowMaxAttempts(true);
    } else {
      setCode('');
    }
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
            <Text style={styles.title}>Password Recovery</Text>
            <Text style={styles.subtitle}>
              Enter 4-digits code we sent you{'\n'}on your phone number
            </Text>

            {/* Masked Contact Number */}
            <Text style={styles.phoneText}>+98*******00</Text>

            {/* Hidden Input to capture 4-digit code */}
            <TextInput
              ref={inputRef}
              style={styles.hiddenInput}
              keyboardType="number-pad"
              maxLength={4}
              value={code}
              onChangeText={handleCodeChange}
              autoFocus
            />

            {/* 4 Code Dots (● ● ● ●) */}
            <TouchableOpacity
              style={styles.dotsRow}
              activeOpacity={1}
              onPress={() => inputRef.current?.focus()}
            >
              {[0, 1, 2, 3].map((index) => {
                const isFilled = code.length > index;
                return (
                  <View
                    key={index}
                    style={[
                      styles.dot,
                      isFilled ? styles.dotFilled : styles.dotEmpty,
                    ]}
                  />
                );
              })}
            </TouchableOpacity>
          </View>

          {/* Bottom Actions: Send Again Button & Cancel */}
          <View style={styles.bottomSection}>
            <TouchableOpacity
              style={styles.sendAgainButton}
              activeOpacity={0.85}
              onPress={handleSendAgain}
            >
              <Text style={styles.sendAgainButtonText}>Send Again</Text>
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

      {/* 10 Maximum Attempts Modal */}
      <Modal
        visible={showMaxAttempts}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMaxAttempts(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {/* Exclamation Icon */}
            <View style={styles.modalIconWrapper}>
              <ExclamationIcon />
            </View>

            {/* Message */}
            <Text style={styles.modalTitle}>
              You reached out maximum{'\n'}amount of attempts.{'\n'}Please, try later.
            </Text>

            {/* Okay Button */}
            <TouchableOpacity
              style={styles.okayButton}
              activeOpacity={0.85}
              onPress={() => setShowMaxAttempts(false)}
            >
              <Text style={styles.okayButtonText}>Okay</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    marginBottom: 16,
  },
  phoneText: {
    fontFamily: fonts.nunito.bold,
    fontSize: 17,
    color: '#181C1F',
    marginBottom: 32,
    textAlign: 'center',
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  dotFilled: {
    backgroundColor: '#004BFE',
  },
  dotEmpty: {
    backgroundColor: '#E5EBFC',
  },
  bottomSection: {
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  sendAgainButton: {
    backgroundColor: '#FF5B84',
    height: 52,
    borderRadius: 16,
    width: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#FF5B84',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  sendAgainButtonText: {
    fontFamily: fonts.nunito.bold,
    fontSize: 17,
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
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  modalCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalIconWrapper: {
    marginBottom: 20,
  },
  modalTitle: {
    fontFamily: fonts.nunito.semiBold,
    fontSize: 16,
    lineHeight: 24,
    color: '#333333',
    textAlign: 'center',
    marginBottom: 28,
  },
  okayButton: {
    backgroundColor: '#222222',
    height: 50,
    borderRadius: 14,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  okayButtonText: {
    fontFamily: fonts.nunito.bold,
    fontSize: 16,
    color: '#FFFFFF',
  },
});
