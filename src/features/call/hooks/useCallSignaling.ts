import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { supabase } from '@/lib/supabase';
import { RootState, AppDispatch } from '@/store';
import {
  setIncomingCall,
  updateCallStatus,
  incrementDuration,
  expireCallThunk,
} from '../store/callSlice';
import { CallLog, CallParticipant } from '../types';

/**
 * useCallSignaling:
 * Handles real-time Supabase channels for call_logs (signaling)
 * Tracks ringing timeout (45s) and ongoing duration counter
 */
export function useCallSignaling(currentUserId: string | null) {
  const dispatch = useDispatch<AppDispatch>();
  const callState = useSelector((state: RootState) => (state as any).call);
  const { currentCall, uiState, isCaller } = callState;

  const expireTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const durationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 1. Subscribe to Incoming Calls (INSERT where receiver_id = currentUserId)
  useEffect(() => {
    if (!currentUserId) return;

    const incomingChannel = supabase
      .channel(`call:receiver:${currentUserId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'call_logs',
          filter: `receiver_id=eq.${currentUserId}`,
        },
        async (payload) => {
          const callLog = payload.new as CallLog;

          // Only react if call is in ringing state and we are not currently busy in another call
          if (callLog.status === 'ringing') {
            // Fetch caller profile
            let participant: CallParticipant = {
              id: callLog.caller_id,
              name: 'Incoming Caller',
              avatar: null,
              role: 'customer',
            };

            const { data: profile } = await supabase
              .from('profiles')
              .select('id, full_name, image_url, role')
              .eq('id', callLog.caller_id)
              .single();

            if (profile) {
              participant = {
                id: profile.id,
                name: profile.full_name || 'LocalKart User',
                avatar: profile.image_url,
                role: profile.role || 'customer',
              };
            }

            dispatch(setIncomingCall({ callLog, participant }));

            /**
             * TODO (FCM Background Ringing Hook):
             * When the app is in the background or killed, this Supabase Realtime WebSocket
             * connection will be suspended by the OS.
             * A Supabase Database Webhook on `call_logs` INSERT triggers a Supabase Edge Function,
             * which dispatches a high-priority Firebase Cloud Messaging (FCM) data notification
             * to wake the app and display a full-screen native incoming call UI (via CallKeep / Notifee).
             */
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(incomingChannel);
    };
  }, [currentUserId, dispatch]);

  // 2. Subscribe to Call Status Changes for Active Call (UPDATE where id = currentCall.id)
  useEffect(() => {
    if (!currentCall?.id) return;

    const callUpdatesChannel = supabase
      .channel(`call:session:${currentCall.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'call_logs',
          filter: `id=eq.${currentCall.id}`,
        },
        (payload) => {
          const updatedCall = payload.new as CallLog;
          dispatch(updateCallStatus(updatedCall));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(callUpdatesChannel);
    };
  }, [currentCall?.id, dispatch]);

  // 3. 45s Ringing Timeout Auto-Expire (Caller side) + Demo Auto-Answer Simulation
  useEffect(() => {
    if (uiState === 'outgoing_ringing' && isCaller && currentCall?.id) {
      // If demo call, simulate the recipient picking up after 2.5s
      const isDemo =
        currentCall.id.startsWith('call-demo') ||
        currentCall.channel_name?.startsWith('channel-') ||
        currentCall.channel_name?.startsWith('demo-');

      let demoTimer: ReturnType<typeof setTimeout> | null = null;
      if (isDemo) {
        demoTimer = setTimeout(() => {
          dispatch(
            updateCallStatus({
              ...currentCall,
              status: 'ongoing',
              answered_at: new Date().toISOString(),
            })
          );
        }, 2500);
      }

      expireTimerRef.current = setTimeout(() => {
        dispatch(expireCallThunk(currentCall.id));
      }, 45000);

      return () => {
        if (demoTimer) clearTimeout(demoTimer);
        if (expireTimerRef.current) clearTimeout(expireTimerRef.current);
      };
    } else {
      if (expireTimerRef.current) {
        clearTimeout(expireTimerRef.current);
        expireTimerRef.current = null;
      }
    }

    return () => {
      if (expireTimerRef.current) {
        clearTimeout(expireTimerRef.current);
      }
    };
  }, [uiState, isCaller, currentCall, dispatch]);

  // 4. Ongoing Call Duration Timer (1 second interval)
  useEffect(() => {
    if (uiState === 'ongoing') {
      durationIntervalRef.current = setInterval(() => {
        dispatch(incrementDuration());
      }, 1000);
    } else {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
    }

    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, [uiState, dispatch]);
}
