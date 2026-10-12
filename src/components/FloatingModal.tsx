import React from 'react';
import { Image, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { fonts } from '@/theme/fonts';
import { Text } from '@/theme';

export interface FloatingModalProps {
  visible: boolean;
  onDismiss: () => void;
  message?: string;
  buttonText?: string;
  badgeSource?: any;
  showExclamation?: boolean;
}

const WhiteExclamationIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 6V13"
      stroke="#FFFFFF"
      strokeWidth="2.8"
      strokeLinecap="round"
    />
    <Circle cx="12" cy="17.5" r="1.4" fill="#FFFFFF" />
  </Svg>
);

export const FloatingModal: React.FC<FloatingModalProps> = ({
  visible,
  onDismiss,
  message = "You reached out maximum\namount of attempts.\nPlease, try later.",
  buttonText = 'Okay',
  badgeSource = require('@/assets/png/newgroupmodal.png'),
  showExclamation = true,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <View style={styles.cardContainer}>
          {/* Top Floating Badge */}
          <View style={styles.floatingBadgeWrapper}>
            <Image
              source={badgeSource}
              style={styles.badgeImage}
              resizeMode="contain"
            />
            {showExclamation ? (
              <View style={styles.exclamationWrapper} pointerEvents="none">
                <WhiteExclamationIcon />
              </View>
            ) : null}
          </View>

          {/* Title / Description */}
          <Text style={styles.messageText}>
            {message}
          </Text>

          {/* Dark #202020 Okay Button */}
          <TouchableOpacity
            style={styles.okayButton}
            activeOpacity={0.85}
            onPress={onDismiss}
          >
            <Text style={styles.okayButtonText}>{buttonText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default FloatingModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 52,
    paddingBottom: 24,
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
  floatingBadgeWrapper: {
    position: 'absolute',
    top: -44,
    alignSelf: 'center',
    width: 88,
    height: 84,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeImage: {
    width: 88,
    height: 84,
  },
  exclamationWrapper: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4, // Aligns precisely with the center pink circle accounting for bottom shadow
  },
  messageText: {
    fontFamily: fonts.raleway.medium,
    fontSize: 18,
    lineHeight: 26,
    color: '#202020',
    textAlign: 'center',
    marginBottom: 24,
  },
  okayButton: {
    width: '100%',
    height: 52,
    backgroundColor: '#202020',
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  okayButtonText: {
    fontFamily: fonts.nunito.light,
    fontSize: 22,
    color: '#FFFFFF',
  },
});
