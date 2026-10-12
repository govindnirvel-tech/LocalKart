import React from 'react';
import {
  ActivityIndicator,
  TouchableOpacity,
  TouchableOpacityProps,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { createBox, useTheme } from '@shopify/restyle';
import { Theme, Text } from '@/theme';

const Touchable = createBox<Theme, TouchableOpacityProps>(TouchableOpacity);

export type ButtonProps = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  backgroundColor?: keyof Theme['colors'];
  textColor?: keyof Theme['colors'];
  height?: number;
  style?: StyleProp<ViewStyle>;
};

export default function Button({
  label,
  onPress,
  loading = false,
  disabled = false,
  backgroundColor = 'primary',
  textColor = 'textInverse',
  height,
  style,
}: ButtonProps) {
  const theme = useTheme<Theme>();
  const isButtonDisabled = disabled || loading;

  return (
    <Touchable
      onPress={onPress}
      disabled={isButtonDisabled}
      activeOpacity={0.8}
      backgroundColor={disabled ? 'disabled' : backgroundColor}
      paddingVertical="m"
      paddingHorizontal="m"
      borderRadius="m"
      alignItems="center"
      justifyContent="center"
      height={height}
      style={style}
    >
      {loading ? (
        <ActivityIndicator
          color={theme.colors[textColor] as string}
          size="small"
        />
      ) : (
        <Text variant="button" color={disabled ? 'textSecondary' : textColor}>
          {label}
        </Text>
      )}
    </Touchable>
  );
}