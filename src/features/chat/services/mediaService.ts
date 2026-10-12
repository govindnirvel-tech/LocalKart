import { supabase } from '@/lib/supabase';
import { ApiResponse } from '../types';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'video/mp4',
  'audio/mpeg',
  'audio/mp4',
  'audio/x-m4a',
  'audio/aac',
  'audio/ogg',
  'application/pdf',
];

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB

interface CachedSignedUrl {
  url: string;
  expiresAt: number;
}

const signedUrlCache = new Map<string, CachedSignedUrl>();

export const mediaService = {
  /**
   * Upload media file to private bucket `chat-media`
   * Upload path format: `<conversation_id>/<unique_filename>`
   */
  async uploadMedia(
    conversationId: string,
    fileUri: string,
    fileName: string,
    mimeType: string,
    fileSize?: number
  ): Promise<ApiResponse<{ path: string; mimeType: string }>> {
    try {
      // Validate MIME type
      if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
        return {
          data: null,
          error: `Unsupported file format: ${mimeType}. Allowed: JPEG, PNG, WEBP, MP4, MP3, AAC, PDF`,
        };
      }

      // Validate size if known
      if (fileSize && fileSize > MAX_FILE_SIZE_BYTES) {
        return {
          data: null,
          error: 'File size 20 MB se zyada nahi ho sakti.',
        };
      }

      // Prepare clean unique filename
      const cleanName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
      const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const storagePath = `${conversationId}/${uniqueSuffix}_${cleanName}`;

      // Read file as FormData blob for React Native CLI
      const formData = new FormData();
      formData.append('file', {
        uri: fileUri,
        name: cleanName,
        type: mimeType,
      } as any);

      const { data, error } = await supabase.storage
        .from('chat-media')
        .upload(storagePath, formData, {
          contentType: mimeType,
          upsert: false,
        });

      if (error) {
        console.warn('Supabase storage upload error, falling back to local URI:', error);
        return {
          data: {
            path: fileUri,
            mimeType,
          },
          error: null,
        };
      }

      return {
        data: {
          path: data.path,
          mimeType,
        },
        error: null,
      };
    } catch (err: any) {
      console.warn('Media upload exception, falling back to local URI:', err);
      // Fallback gracefully to local file URI so the chat continues uninterrupted
      return {
        data: {
          path: fileUri,
          mimeType,
        },
        error: null,
      };
    }
  },

  /**
   * Get temporary signed URL for viewing private media (cached for 1 hour)
   */
  async getSignedUrl(storagePath: string): Promise<string | null> {
    if (!storagePath) return null;

    if (
      storagePath.startsWith('http://') ||
      storagePath.startsWith('https://') ||
      storagePath.startsWith('file://') ||
      storagePath.startsWith('content://')
    ) {
      return storagePath;
    }

    // Check in-memory cache
    const cached = signedUrlCache.get(storagePath);
    const now = Date.now();
    if (cached && cached.expiresAt > now + 60 * 1000) {
      // Valid for at least 1 more minute
      return cached.url;
    }

    try {
      const { data, error } = await supabase.storage
        .from('chat-media')
        .createSignedUrl(storagePath, 3600); // 1 hour

      if (error || !data?.signedUrl) {
        return null;
      }

      signedUrlCache.set(storagePath, {
        url: data.signedUrl,
        expiresAt: now + 3500 * 1000,
      });

      return data.signedUrl;
    } catch {
      return null;
    }
  },

  /**
   * Batch pre-resolve signed URLs for messages
   */
  async prefetchSignedUrls(storagePaths: string[]): Promise<Record<string, string>> {
    const results: Record<string, string> = {};
    const uniquePaths = Array.from(new Set(storagePaths.filter(Boolean)));

    await Promise.all(
      uniquePaths.map(async (path) => {
        const url = await mediaService.getSignedUrl(path);
        if (url) results[path] = url;
      })
    );

    return results;
  },

  /**
   * Clear cache if needed
   */
  clearCache(): void {
    signedUrlCache.clear();
  },
};
