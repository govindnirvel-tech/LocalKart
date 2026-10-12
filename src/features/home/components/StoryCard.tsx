import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import AppImage from '@/components/AppImage';
import { fonts } from '@/theme/fonts';
import type { Story } from '@/types/database';

export interface StoryCardProps {
  story: Story;
  width?: number;
  height?: number;
  onPress?: (story: Story) => void;
  testID?: string;
}

const PlayIcon = ({
  size = 12,
  color = '#004CFF',
}: {
  size?: number;
  color?: string;
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Path d="M8 5v14l11-7z" />
  </Svg>
);

export const StoryCard: React.FC<StoryCardProps> = ({
  story,
  width = 120,
  height = 200,
  onPress,
  testID,
}) => {
  return (
    <TouchableOpacity
      testID={testID}
      style={[styles.container, { width, height }]}
      activeOpacity={0.85}
      onPress={() => onPress?.(story)}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`Story by ${story.vendor?.store_name || 'Vendor'}`}
    >
      <View style={styles.imageContainer}>
        <AppImage
          source={{ uri: story.media_url }}
          style={styles.image}
          borderRadius={12}
          resizeMode="cover"
        />
        {story.is_live && (
          <View style={styles.liveBadge}>
            <Text style={styles.liveBadgeText}>Live</Text>
          </View>
        )}
        <View style={styles.playButtonOverlay}>
          <PlayIcon size={12} color="#004CFF" />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginRight: 10,
    backgroundColor: '#FFFFFF',
    padding: 6,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
    }),
  },
  imageContainer: {
    flex: 1,
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  liveBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#00C566',
    paddingHorizontal: 8,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  liveBadgeText: {
    color: '#FFFFFF',
    fontFamily: fonts.nunito.bold,
    fontSize: 10,
  },
  playButtonOverlay: {
    position: 'absolute',
    alignSelf: 'center',
    top: '42%',
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 2,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
});

export default StoryCard;
