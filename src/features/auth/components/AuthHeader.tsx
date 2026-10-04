import React from 'react';
import { Box, Text } from '@/theme';

interface AuthHeaderProps {
  title: string;
  subtitle?: string;
}

export default function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  return (
    <Box marginBottom="l">
      <Text variant="h1" marginBottom="s">
        {title}
      </Text>
      {Boolean(subtitle) && (
        <Text variant="caption" color="textSecondary">
          {subtitle}
        </Text>
      )}
    </Box>
  );
}
