import React from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Platform,
} from 'react-native';
import AppImage from '@/components/AppImage';

export interface TopProductItemData {
  id: string;
  image: string | number; // uri or local require
  title?: string;
}

export interface TopProductCircleProps {
  item: TopProductItemData;
  onPress?: (item: TopProductItemData) => void;
  testID?: string;
}

export const TopProductCircle: React.FC<TopProductCircleProps> = ({
  item,
  onPress,
  testID,
}) => {
  const imageSource =
    typeof item.image === 'string' ? { uri: item.image } : item.image;

  return (
    <TouchableOpacity
      testID={testID}
      style={styles.pillContainer}
      activeOpacity={0.85}
      onPress={() => onPress?.(item)}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={item.title || 'Top Product'}
    >
      <View style={styles.imageWrapper}>
        <AppImage
          source={imageSource}
          style={styles.image}
          borderRadius={25}
          resizeMode="cover"
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  pillContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.04)',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      default: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
    }),
  },
  imageWrapper: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    backgroundColor: '#F2F4F7',
  },
  image: {
    width: 50,
    height: 50,
  },
});

export default TopProductCircle;
