import React from 'react';
import { View, StyleSheet, Text, Platform } from 'react-native';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';

export interface PromoBannerCardProps {
  imageUrl?: string;
  discountText?: string;
}

export const PromoBannerCard: React.FC<PromoBannerCardProps> = ({
  imageUrl = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600',
  discountText = '-20%',
}) => {
  return (
    <View style={styles.cardContainer}>
      <View style={styles.imageContainer}>
        <FastImage
          source={{
            uri: imageUrl,
            priority: FastImage.priority.high,
            cache: FastImage.cacheControl.immutable,
          }}
          style={styles.image}
          resizeMode={FastImage.resizeMode.cover}
        />
        <LinearGradient
          colors={['#F9154B', '#FF5A93']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.badgeContainer}
        >
          <Text style={styles.badgeText}>{discountText}</Text>
        </LinearGradient>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 28,
    marginHorizontal: 20,
    marginBottom: 20,
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
    }),
  },
  imageContainer: {
    borderRadius: 18,
    overflow: 'hidden',
    height: 220,
    width: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badgeContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 20,
  },
  badgeText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 28,
  },
});
