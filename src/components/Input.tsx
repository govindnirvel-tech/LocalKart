import React, { useState } from 'react';
import {
  TextInput,
  TextInputProps,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '@shopify/restyle';
import { Box, Text, Theme } from '@/theme';
import { fonts } from '@/theme/fonts';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  rightIcon?: React.ReactNode;
}

export default function Input({
  label,
  error,
  helperText,
  rightIcon,
  secureTextEntry,
  style,
  ...rest
}: InputProps) {
  const theme = useTheme<Theme>();
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordHidden, setIsPasswordHidden] = useState(Boolean(secureTextEntry));

  const borderColor = error
    ? 'danger'
    : isFocused
    ? 'primary'
    : 'border';

  return (
    <Box marginBottom="m">
      {Boolean(label) && (
        <Text variant="label" marginBottom="s" color="textPrimary">
          {label}
        </Text>
      )}

      <Box
        flexDirection="row"
        alignItems="center"
        backgroundColor="cardBackground"
        borderWidth={1}
        borderColor={borderColor}
        borderRadius="m"
        paddingHorizontal="m"
        height={50}
      >
        <TextInput
          style={[
            styles.input,
            {
              color: theme.colors.textPrimary,
              fontFamily: fonts.nunito.regular,
            },
            style,
          ]}
          placeholderTextColor={theme.colors.textTertiary}
          secureTextEntry={secureTextEntry ? isPasswordHidden : false}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...rest}
        />

        {secureTextEntry ? (
          <TouchableOpacity
            onPress={() => setIsPasswordHidden(!isPasswordHidden)}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text variant="captionSemiBold" color="primary">
              {isPasswordHidden ? 'Show' : 'Hide'}
            </Text>
          </TouchableOpacity>
        ) : (
          rightIcon
        )}
      </Box>

      {Boolean(error) && (
        <Text variant="caption" color="danger" marginTop="xs">
          {error}
        </Text>
      )}

      {!error && Boolean(helperText) && (
        <Text variant="caption" color="textSecondary" marginTop="xs">
          {helperText}
        </Text>
      )}
    </Box>
  );
}

const styles = StyleSheet.create({
  input: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    paddingVertical: 0,
  },
});
