declare module '*.svg' {
  import React from 'react';
  import { SvgProps } from 'react-native-svg';
  const content: React.FC<SvgProps>;
  export default content;
}

declare module '*.png' {
  const content: any;
  export default content;
}

declare module '*.jpg' {
  const content: any;
  export default content;
}

declare module '*.jpeg' {
  const content: any;
  export default content;
}

declare module '@env' {
  export const SUPABASE_URL: string;
  export const SUPABASE_ANON_KEY: string;
}

declare module 'react-native-fast-image' {
  import React from 'react';
  import { StyleProp } from 'react-native';
  import {
    Source as D11Source,
    ResizeMode as D11ResizeMode,
    Priority as D11Priority,
    OnLoadEvent,
    OnProgressEvent,
    OnErrorEvent,
  } from '@d11/react-native-fast-image';

  export type Source = D11Source;
  export type ResizeMode = D11ResizeMode;
  export type Priority = D11Priority;

  export interface FastImageProps {
    source: Source | number;
    style?: StyleProp<any>;
    resizeMode?: ResizeMode;
    fallback?: boolean;
    onLoadStart?: () => void;
    onProgress?: (event: OnProgressEvent) => void;
    onLoad?: (event: OnLoadEvent) => void;
    onError?: (event: OnErrorEvent) => void;
    onLoadEnd?: () => void;
    tintColor?: string | number;
    testID?: string;
    children?: React.ReactNode;
  }

  const FastImage: React.ComponentType<FastImageProps> & {
    resizeMode: {
      contain: 'contain';
      cover: 'cover';
      stretch: 'stretch';
      center: 'center';
    };
    priority: {
      low: 'low';
      normal: 'normal';
      high: 'high';
    };
    cacheControl: {
      immutable: 'immutable';
      web: 'web';
      cacheOnly: 'cacheOnly';
    };
    preload: (sources: Source[]) => void;
    clearMemoryCache: () => Promise<void>;
    clearDiskCache: () => Promise<void>;
  };

  export default FastImage;
}

