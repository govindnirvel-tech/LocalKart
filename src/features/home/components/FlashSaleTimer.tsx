import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { fonts } from '@/theme/fonts';

// Clock Icon supporting dynamic color
const ClockIcon = ({ size = 20, color = '#004BFE' }: { size?: number; color?: string }) => (
  <Svg width={Math.round(size * (18 / 20))} height={size} viewBox="0 0 18 20" fill="none">
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M11.4 0H5.7V1.9H11.4V0ZM7.6 12.35H9.5V6.65H7.6V12.35ZM15.2285 6.0705L16.5775 4.7215C16.169 4.237 15.7225 3.781 15.238 3.382L13.889 4.731C12.4165 3.553 10.564 2.85 8.55 2.85C3.8285 2.85 0 6.6785 0 11.4C0 16.1215 3.819 19.95 8.55 19.95C13.281 19.95 17.1 16.1215 17.1 11.4C17.1 9.386 16.397 7.5335 15.2285 6.0705ZM8.55 18.05C4.8735 18.05 1.9 15.0765 1.9 11.4C1.9 7.7235 4.8735 4.75 8.55 4.75C12.2265 4.75 15.2 7.7235 15.2 11.4C15.2 15.0765 12.2265 18.05 8.55 18.05Z"
      fill={color}
    />
  </Svg>
);

export interface FlashSaleTimerProps {
  fontSize?: number;
  textColor?: string;
  badgeBackgroundColor?: string;
  badgeWidth?: number;
  badgeHeight?: number;
  clockColor?: string;
  clockSize?: number;
}

export const FlashSaleTimer: React.FC<FlashSaleTimerProps> = ({
  fontSize = 16,
  textColor = '#202020',
  badgeBackgroundColor = '#FFEBEB',
  badgeWidth,
  badgeHeight,
  clockColor = '#004BFE',
  clockSize = 20,
}) => {
  // Starts at 00:36:58 from Figma
  const [secondsRemaining, setSecondsRemaining] = useState(36 * 60 + 58);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const hours = Math.floor(secondsRemaining / 3600)
    .toString()
    .padStart(2, '0');
  const minutes = Math.floor((secondsRemaining % 3600) / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (secondsRemaining % 60)
    .toString()
    .padStart(2, '0');

  const badgeStyle = {
    backgroundColor: badgeBackgroundColor,
    width: badgeWidth ?? (fontSize >= 20 ? 44 : 36),
    height: badgeHeight ?? (fontSize >= 20 ? 32 : 26),
  };

  const textStyle = {
    fontSize,
    color: textColor,
    lineHeight: Math.round(fontSize * 1.25),
  };

  return (
    <View style={styles.timerRow}>
      <ClockIcon size={clockSize} color={clockColor} />
      <View style={[styles.timerBadge, badgeStyle]}>
        <Text style={[styles.timerText, textStyle]}>{hours}</Text>
      </View>
      <View style={[styles.timerBadge, badgeStyle]}>
        <Text style={[styles.timerText, textStyle]}>{minutes}</Text>
      </View>
      <View style={[styles.timerBadge, badgeStyle]}>
        <Text style={[styles.timerText, textStyle]}>{seconds}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timerBadge: {
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    fontFamily: fonts.raleway.bold,
    includeFontPadding: false,
    textAlignVertical: 'center',
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
});

export default FlashSaleTimer;
