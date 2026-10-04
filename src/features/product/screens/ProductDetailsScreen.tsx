import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Box, Text } from '@/theme';
import Button from '@/components/Button';
import { RootStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductDetails'>;

export default function ProductDetailsScreen({ route, navigation }: Props) {
  const { productId, name } = route.params;   

  return (
    <Box flex={1} backgroundColor="mainBackground" padding="m">
      <Text variant="h2">{name}</Text>
      <Text variant="caption" marginBottom="l">
        Product ID: {productId}
      </Text>

      <Button label="Back" onPress={() => navigation.goBack()} />
    </Box>
  );
}