import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import AppImage from '@/components/AppImage';
import { fonts } from '@/theme/fonts';

const CheckIcon = () => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 6L9 17l-5-5"
      stroke="#FFFFFF"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ArrowRightMini = () => (
  <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 18l6-6-6-6"
      stroke="#004CFF"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export interface ToastNotificationProps {
  visible: boolean;
  title: string;
  message?: string;
  image?: string;
  actionText?: string;
  onActionPress?: () => void;
  onDismiss?: () => void;
  duration?: number;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  visible,
  title,
  message,
  image,
  actionText = 'View Cart',
  onActionPress,
  onDismiss,
  duration = 2600,
}) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Spring In
      Animated.parallel([
        Animated.spring(anim, {
          toValue: 1,
          friction: 8,
          tension: 70,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto Dismiss Timer
      const timer = setTimeout(() => {
        Animated.timing(anim, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }).start(() => {
          onDismiss?.();
        });
      }, duration);

      return () => clearTimeout(timer);
    } else {
      Animated.timing(anim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, duration, anim, onDismiss]);

  if (!visible) return null;

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [-90, 0],
  });

  const opacity = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const scale = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.92, 1],
  });

  return (
    <Animated.View
      style={[
        styles.toastWrapper,
        {
          opacity,
          transform: [{ translateY }, { scale }],
        },
      ]}
      pointerEvents="box-none"
    >
      <TouchableOpacity
        style={styles.toastCard}
        activeOpacity={0.92}
        onPress={onActionPress}
      >
        {/* Left Icon or Product Thumbnail */}
        {image ? (
          <View style={styles.thumbWrapper}>
            <AppImage
              source={{ uri: image }}
              style={styles.thumbImage}
              borderRadius={8}
              resizeMode="cover"
            />
            <View style={styles.miniCheckBadge}>
              <CheckIcon />
            </View>
          </View>
        ) : (
          <View style={styles.checkCircle}>
            <CheckIcon />
          </View>
        )}

        {/* Text Details */}
        <View style={styles.textWrap}>
          <Text style={styles.titleText} numberOfLines={1}>
            {title}
          </Text>
          {message ? (
            <Text style={styles.messageText} numberOfLines={1}>
              {message}
            </Text>
          ) : null}
        </View>

        {/* Action Button */}
        {onActionPress && (
          <TouchableOpacity
            style={styles.actionBtn}
            activeOpacity={0.8}
            onPress={onActionPress}
          >
            <Text style={styles.actionText}>{actionText}</Text>
            <ArrowRightMini />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toastWrapper: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 52 : 40,
    left: 14,
    right: 14,
    zIndex: 99999,
    alignItems: 'center',
  },
  toastCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 76, 255, 0.12)',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.16,
        shadowRadius: 14,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  checkCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#00A854',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  thumbWrapper: {
    position: 'relative',
    width: 36,
    height: 36,
    borderRadius: 8,
    overflow: 'visible',
    marginRight: 10,
  },
  thumbImage: {
    width: 36,
    height: 36,
  },
  miniCheckBadge: {
    position: 'absolute',
    bottom: -3,
    right: -3,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#00A854',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  textWrap: {
    flex: 1,
    paddingRight: 8,
  },
  titleText: {
    fontFamily: fonts.raleway.bold,
    fontSize: 13,
    color: '#181C1F',
  },
  messageText: {
    fontFamily: fonts.nunito.regular,
    fontSize: 11,
    color: '#6B7280',
    marginTop: 1,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF4FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 4,
  },
  actionText: {
    fontFamily: fonts.raleway.bold,
    fontSize: 11,
    color: '#004CFF',
  },
});

export default ToastNotification;
