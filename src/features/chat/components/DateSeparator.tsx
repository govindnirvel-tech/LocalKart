import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { fonts } from '@/theme/fonts';

interface DateSeparatorProps {
  dateString: string;
}

export const DateSeparator: React.FC<DateSeparatorProps> = React.memo(({ dateString }) => {
  const getFormattedDate = () => {
    const messageDate = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    }
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }

    return messageDate.toLocaleDateString([], {
      day: 'numeric',
      month: 'short',
      year: messageDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.badge}>
        <Text style={styles.text}>{getFormattedDate()}</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 12,
  },
  badge: {
    backgroundColor: '#E8ECF2',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  text: {
    fontSize: 11,
    fontFamily: fonts.raleway.semiBold,
    color: '#656F7D',
    textTransform: 'uppercase',
  },
});
