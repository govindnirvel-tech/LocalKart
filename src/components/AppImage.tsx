import React, { useState, memo } from 'react';
import {
  StyleSheet,
  View,
  ImageSourcePropType,
  ImageStyle,
  StyleProp,
} from 'react-native';
import FastImage, {
  Source as FastImageSource,
  ResizeMode as FastResizeMode,
  Priority as FastPriority,
} from 'react-native-fast-image';
import ShimmerPlaceholder from './ShimmerPlaceholder';
import { resolveSafeImageUri, getFallbackImage } from '@/utils/imageResolver';

export interface AppImageProps {
  source: ImageSourcePropType | string | { uri: string } | number;
  style?: StyleProp<ImageStyle>;
  resizeMode?: 'contain' | 'cover' | 'stretch' | 'center';
  placeholder?: ImageSourcePropType;
  borderRadius?: number;
  priority?: 'low' | 'normal' | 'high';
}

const mapResizeMode = (mode?: string): FastResizeMode => {
  switch (mode) {
    case 'contain':
      return FastImage.resizeMode.contain;
    case 'stretch':
      return FastImage.resizeMode.stretch;
    case 'center':
      return FastImage.resizeMode.center;
    case 'cover':
    default:
      return FastImage.resizeMode.cover;
  }
};

const mapPriority = (p?: 'low' | 'normal' | 'high'): FastPriority => {
  switch (p) {
    case 'high':
      return FastImage.priority.high;
    case 'low':
      return FastImage.priority.low;
    case 'normal':
    default:
      return FastImage.priority.normal;
  }
};

function AppImageComponent({
  source,
  style,
  resizeMode = 'cover',
  placeholder,
  borderRadius = 0,
  priority = 'normal',
}: AppImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);

  // Extract and sanitize remote URI
  let rawUri: string | undefined;
  if (typeof source === 'string') {
    rawUri = source;
  } else if (typeof source === 'object' && source !== null && 'uri' in source && typeof source.uri === 'string') {
    rawUri = source.uri;
  }

  const isRemote = !!rawUri;
  const safeUri = rawUri ? resolveSafeImageUri(rawUri) : undefined;

  let fastImageSource: FastImageSource | number;
  if (isError) {
    if (placeholder) {
      fastImageSource = placeholder as any;
    } else {
      fastImageSource = {
        uri: getFallbackImage(rawUri),
        priority: FastImage.priority.low,
        cache: FastImage.cacheControl.immutable,
      };
    }
  } else if (safeUri) {
    fastImageSource = {
      uri: safeUri,
      priority: mapPriority(priority),
      cache: FastImage.cacheControl.immutable,
    };
  } else {
    fastImageSource = source as any;
  }

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setIsError(true);
    setIsLoaded(true);
  };

  // Flattened style to extract width, height, and borderRadius for the container
  const flattenedStyle = StyleSheet.flatten(style) || {};

  return (
    <View
      style={[
        styles.container,
        flattenedStyle,
        borderRadius > 0 && { borderRadius },
      ]}
    >
      {/* Show Shimmer while remote image is fetching */}
      {isRemote && !isLoaded && (
        <ShimmerPlaceholder
          width="100%"
          height="100%"
          borderRadius={borderRadius}
          style={StyleSheet.absoluteFill}
        />
      )}

      {/* FastImage: Native Disk & Memory Caching via Glide (Android) & SDWebImage (iOS) */}
      <FastImage
        source={fastImageSource}
        style={[
          styles.image,
          flattenedStyle,
          borderRadius > 0 && { borderRadius },
        ] as any}
        resizeMode={mapResizeMode(resizeMode)}
        onLoad={handleLoad}
        onError={handleError}
      />
    </View>
  );
}

const AppImage = memo(AppImageComponent);
export default AppImage;

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
