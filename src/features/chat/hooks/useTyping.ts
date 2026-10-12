import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export function useTyping(conversationId: string | null, currentUserId: string) {
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const lastSentTimeRef = useRef<number>(0);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!conversationId) return;

    // Reset state
    setIsOtherUserTyping(false);

    // Channel name: typing:<conversationId>
    const channelName = `typing:${conversationId}`;
    const channel = supabase.channel(channelName, {
      config: { broadcast: { self: false } },
    });

    channel
      .on('broadcast', { event: 'typing' }, (payload: { payload: { uid: string } }) => {
        if (payload?.payload?.uid && payload.payload.uid !== currentUserId) {
          setIsOtherUserTyping(true);

          // Clear existing timer and hide after 3 seconds of no broadcast
          if (hideTimeoutRef.current) {
            clearTimeout(hideTimeoutRef.current);
          }
          hideTimeoutRef.current = setTimeout(() => {
            setIsOtherUserTyping(false);
          }, 3000);
        }
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [conversationId, currentUserId]);

  /**
   * Broadcast typing event throttled to once every 2 seconds
   */
  const sendTyping = useCallback(() => {
    if (!channelRef.current || !conversationId) return;

    const now = Date.now();
    if (now - lastSentTimeRef.current >= 2000) {
      lastSentTimeRef.current = now;
      channelRef.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: { uid: currentUserId },
      });
    }
  }, [conversationId, currentUserId]);

  return { isOtherUserTyping, sendTyping };
}
