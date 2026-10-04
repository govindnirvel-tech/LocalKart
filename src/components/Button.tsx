import React from 'react';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { createBox } from '@shopify/restyle';
import { Theme, Text } from '@/theme';

const Touchable = createBox<Theme, TouchableOpacityProps>(TouchableOpacity);

type Props = {
  label: string;
  onPress: () => void;
};

export default function Button({ label, onPress }: Props) {
  return (
    <Touchable
      onPress={onPress}
      activeOpacity={0.8}
      backgroundColor="primary"
      paddingVertical="s"
      paddingHorizontal="m"
      borderRadius="m"
      alignItems="center"
    >
      <Text variant="button">{label}</Text>
    </Touchable>
  );
}