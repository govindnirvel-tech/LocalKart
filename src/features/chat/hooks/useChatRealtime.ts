import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useDispatch } from 'react-redux';
import { supabase } from '@/lib/supabase';
import { AppDispatch } from '@/store';
import {
  onRealtimeMessageInsert,
  onRealtimeMessageUpdate,
  onRealtimeReactionChange,
  fetchMessages,
  fetchChatList,
} from '../store/chatSlice';
import { chatApi } from '../services/chatApi';
import { MessageRow, MessageReaction } from '../types';

export function useChatRealtime(
  conversationId: string | null,
  currentUserId: string,
  messageIds: string[]
) {
  const dispatch = useDispatch<AppDispatch>();
  const messageIdsRef = useRef<string[]>(messageIds);
  messageIdsRef.current = messageIds;

  // 1. App Foreground & Last Seen Interval Sync
  useEffect(() => {
    // Initial sync
    chatApi.markAllDelivered();
    chatApi.updateLastSeen();

    // 60-second periodic last seen updater
    const interval = setInterval(() => {
      chatApi.updateLastSeen();
    }, 60000);

    const subscription = AppState.addEventListener(
      'change',
      (nextState: AppStateStatus) => {
        if (nextState === 'active') {
          chatApi.markAllDelivered();
          chatApi.updateLastSeen();
          dispatch(fetchChatList());
          if (conversationId) {
            dispatch(fetchMessages({ conversationId }));
          }
        }
      }
    );

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [conversationId, dispatch]);

  // 2. Realtime Subscription for Active Conversation
  useEffect(() => {
    if (!conversationId) return;

    // A. Channel for Messages (INSERT & UPDATE)
    const messagesChannel = supabase
      .channel(`chat:messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMsg = payload.new as MessageRow;
          dispatch(onRealtimeMessageInsert(newMsg));
          // If message is incoming and chat is focused, mark read
          if (newMsg.sender_id !== currentUserId) {
            chatApi.markConversationRead(conversationId);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const updatedMsg = payload.new as MessageRow;
          dispatch(onRealtimeMessageUpdate(updatedMsg));
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          // Trigger read receipt on initial subscription
          chatApi.markConversationRead(conversationId);
        }
      });

    // B. Channel for Message Reactions (INSERT & DELETE with REPLICA IDENTITY FULL)
    const reactionsChannel = supabase
      .channel(`chat:reactions:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'message_reactions',
        },
        (payload) => {
          const newReaction = payload.new as MessageReaction;
          if (messageIdsRef.current.includes(newReaction.message_id)) {
            dispatch(
              onRealtimeReactionChange({
                type: 'INSERT',
                reaction: newReaction,
              })
            );
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'message_reactions',
        },
        (payload) => {
          const oldReaction = payload.old as MessageReaction;
          if (messageIdsRef.current.includes(oldReaction.message_id)) {
            dispatch(
              onRealtimeReactionChange({
                type: 'DELETE',
                reaction: oldReaction,
              })
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(reactionsChannel);
    };
  }, [conversationId, currentUserId, dispatch]);

  // 3. Channel for Global Conversations UPDATE (for Chat List sync)
  useEffect(() => {
    const convChannel = supabase
      .channel('chat:conversations:global')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversations',
        },
        () => {
          dispatch(fetchChatList());
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(convChannel);
    };
  }, [dispatch]);
}
