import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Box, Text } from '@/theme';

export default function CartScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Box flex={1} backgroundColor="mainBackground" padding="m">
        <Text variant="h2">Cart</Text>
      </Box>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});