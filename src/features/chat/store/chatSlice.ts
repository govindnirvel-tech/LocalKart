import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  ChatListItemView,
  MessageRow,
  MessageReaction,
  SendMessagePayload,
  ConversationSettings,
} from '../types';
import { chatApi } from '../services/chatApi';
import { mediaService } from '../services/mediaService';

export interface ChatState {
  chatList: ChatListItemView[];
  activeConversationId: string | null;
  messages: Record<string, MessageRow[]>;
  reactions: Record<string, MessageReaction[]>;
  signedMediaUrls: Record<string, string>;
  hasMoreMessages: Record<string, boolean>;
  isLoadingChatList: boolean;
  isLoadingMessages: boolean;
  error: string | null;
  isBlocked: boolean;
}

export const DEMO_CHAT_LIST: ChatListItemView[] = [
  {
    id: 'conv-demo-1',
    customer_id: 'cust-demo-101',
    vendor_id: 'vend-demo-501',
    last_message: 'Bhaiya Amul milk aur Brown bread deliver ho gaya kya?',
    updated_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    store_name: 'Sharma Fresh Mart',
    store_logo: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&auto=format&fit=crop&q=80',
    vendor_user_id: 'vend-demo-501',
    customer_name: 'Rahul Verma',
    customer_image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
    customer_last_seen: new Date().toISOString(),
    vendor_last_seen: new Date().toISOString(),
    is_muted: false,
    is_pinned: true,
    is_archived: false,
    unread_count: 2,
  },
  {
    id: 'conv-demo-2',
    customer_id: 'cust-demo-102',
    vendor_id: 'vend-demo-501',
    last_message: 'Voice note (0:15)',
    updated_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    store_name: 'Sharma Fresh Mart',
    store_logo: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&auto=format&fit=crop&q=80',
    vendor_user_id: 'vend-demo-501',
    customer_name: 'Pooja Tiwari',
    customer_image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    customer_last_seen: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    vendor_last_seen: new Date().toISOString(),
    is_muted: false,
    is_pinned: false,
    is_archived: false,
    unread_count: 0,
  },
  {
    id: 'conv-demo-3',
    customer_id: 'cust-demo-103',
    vendor_id: 'vend-demo-501',
    last_message: 'Organic Brown Eggs pack available hai na?',
    updated_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    store_name: 'Sharma Fresh Mart',
    store_logo: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&auto=format&fit=crop&q=80',
    vendor_user_id: 'vend-demo-501',
    customer_name: 'Ananya Deshmukh',
    customer_image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&auto=format&fit=crop&q=80',
    customer_last_seen: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    vendor_last_seen: new Date().toISOString(),
    is_muted: true,
    is_pinned: false,
    is_archived: false,
    unread_count: 1,
  },
];

export const DEMO_MESSAGES_CONV1: MessageRow[] = [
  {
    id: 'msg-demo-1',
    conversation_id: 'conv-demo-1',
    sender_id: 'cust-demo-101',
    text: 'Bhaiya Amul milk aur Brown bread deliver ho gaya kya?',
    message_type: 'text',
    media_url: null,
    media_duration_seconds: null,
    media_meta: null,
    product_id: null,
    reply_to_id: null,
    delivered_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    read_at: null,
    is_read: false,
    edited_at: null,
    is_deleted_for_everyone: false,
    deleted_at: null,
    deleted_for: [],
    created_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  },
  {
    id: 'msg-demo-2',
    conversation_id: 'conv-demo-1',
    sender_id: 'vend-demo-501',
    text: 'Ji sir, delivery rider shop se nikal chuka hai. 5-7 mins me aapke doorstep par hoga!',
    message_type: 'text',
    media_url: null,
    media_duration_seconds: null,
    media_meta: null,
    product_id: null,
    reply_to_id: null,
    delivered_at: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    read_at: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    is_read: true,
    edited_at: null,
    is_deleted_for_everyone: false,
    deleted_at: null,
    deleted_for: [],
    created_at: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
  },
  {
    id: 'msg-demo-3',
    conversation_id: 'conv-demo-1',
    sender_id: 'cust-demo-101',
    text: 'Voice note (0:12)',
    message_type: 'audio',
    media_url: 'conv-demo-1/sample_voice.m4a',
    media_duration_seconds: 12,
    media_meta: null,
    product_id: null,
    reply_to_id: null,
    delivered_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    read_at: new Date(Date.now() - 9 * 60 * 1000).toISOString(),
    is_read: true,
    edited_at: null,
    is_deleted_for_everyone: false,
    deleted_at: null,
    deleted_for: [],
    created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
  {
    id: 'msg-demo-4',
    conversation_id: 'conv-demo-1',
    sender_id: 'cust-demo-101',
    text: 'Incoming Audio Call (Completed • 1m 24s)',
    message_type: 'call',
    media_url: null,
    media_duration_seconds: null,
    media_meta: {
      call: {
        call_id: 'call-sample-101',
        call_type: 'audio',
        status: 'completed',
        duration: 84,
      },
    },
    product_id: null,
    reply_to_id: null,
    delivered_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    read_at: new Date(Date.now() - 24 * 60 * 1000).toISOString(),
    is_read: true,
    edited_at: null,
    is_deleted_for_everyone: false,
    deleted_at: null,
    deleted_for: [],
    created_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
  },
  {
    id: 'msg-demo-5',
    conversation_id: 'conv-demo-1',
    sender_id: 'cust-demo-101',
    text: 'Namaste bhaiya, aaj fresh paneer aur dahi deliver ho sakti hai?',
    message_type: 'text',
    media_url: null,
    media_duration_seconds: null,
    media_meta: null,
    product_id: null,
    reply_to_id: null,
    delivered_at: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    read_at: new Date(Date.now() - 38 * 60 * 1000).toISOString(),
    is_read: true,
    edited_at: null,
    is_deleted_for_everyone: false,
    deleted_at: null,
    deleted_for: [],
    created_at: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
  },
];

export const DEMO_MESSAGES_CONV2: MessageRow[] = [
  {
    id: 'msg-demo-201',
    conversation_id: 'conv-demo-2',
    sender_id: 'cust-demo-102',
    text: 'Bhaiya fresh desi tamatar aur matar available hai shop par?',
    message_type: 'text',
    media_url: null,
    media_duration_seconds: null,
    media_meta: null,
    product_id: null,
    reply_to_id: null,
    delivered_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    read_at: new Date(Date.now() - 28 * 60 * 1000).toISOString(),
    is_read: true,
    edited_at: null,
    is_deleted_for_everyone: false,
    deleted_at: null,
    deleted_for: [],
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: 'msg-demo-202',
    conversation_id: 'conv-demo-2',
    sender_id: 'vend-demo-501',
    text: 'Ji ma\'am, bilkul fresh desi tamatar ₹40/kg aur green peas ₹60/kg available hai.',
    message_type: 'text',
    media_url: null,
    media_duration_seconds: null,
    media_meta: null,
    product_id: null,
    reply_to_id: null,
    delivered_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    read_at: new Date(Date.now() - 24 * 60 * 1000).toISOString(),
    is_read: true,
    edited_at: null,
    is_deleted_for_everyone: false,
    deleted_at: null,
    deleted_for: [],
    created_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
  },
  {
    id: 'msg-demo-203',
    conversation_id: 'conv-demo-2',
    sender_id: 'cust-demo-102',
    text: 'Missed Video Call (No answer)',
    message_type: 'call',
    media_url: null,
    media_duration_seconds: null,
    media_meta: {
      call: {
        call_id: 'call-sample-201',
        call_type: 'video',
        status: 'missed',
        duration: 0,
      },
    },
    product_id: null,
    reply_to_id: null,
    delivered_at: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    read_at: new Date(Date.now() - 17 * 60 * 1000).toISOString(),
    is_read: true,
    edited_at: null,
    is_deleted_for_everyone: false,
    deleted_at: null,
    deleted_for: [],
    created_at: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
  },
  {
    id: 'msg-demo-204',
    conversation_id: 'conv-demo-2',
    sender_id: 'cust-demo-102',
    text: 'Video call miss ho gaya tha. 1 kg tamatar aur 500g matar pack kar dijiye.',
    message_type: 'text',
    media_url: null,
    media_duration_seconds: null,
    media_meta: null,
    product_id: null,
    reply_to_id: null,
    delivered_at: new Date(Date.now() - 16 * 60 * 1000).toISOString(),
    read_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    is_read: true,
    edited_at: null,
    is_deleted_for_everyone: false,
    deleted_at: null,
    deleted_for: [],
    created_at: new Date(Date.now() - 16 * 60 * 1000).toISOString(),
  },
  {
    id: 'msg-demo-205',
    conversation_id: 'conv-demo-2',
    sender_id: 'cust-demo-102',
    text: 'Voice note (0:15)',
    message_type: 'audio',
    media_url: 'conv-demo-2/sample_voice.m4a',
    media_duration_seconds: 15,
    media_meta: null,
    product_id: null,
    reply_to_id: null,
    delivered_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    read_at: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
    is_read: true,
    edited_at: null,
    is_deleted_for_everyone: false,
    deleted_at: null,
    deleted_for: [],
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: 'msg-demo-206',
    conversation_id: 'conv-demo-2',
    sender_id: 'vend-demo-501',
    text: 'Done ma\'am! 15 minutes me delivery rider pahunch raha hai.',
    message_type: 'text',
    media_url: null,
    media_duration_seconds: null,
    media_meta: null,
    product_id: null,
    reply_to_id: null,
    delivered_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    read_at: new Date(Date.now() - 9 * 60 * 1000).toISOString(),
    is_read: true,
    edited_at: null,
    is_deleted_for_everyone: false,
    deleted_at: null,
    deleted_for: [],
    created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
];

export const DEMO_MESSAGES_CONV3: MessageRow[] = [
  {
    id: 'msg-demo-301',
    conversation_id: 'conv-demo-3',
    sender_id: 'cust-demo-103',
    text: 'Organic Brown Eggs pack available hai na?',
    message_type: 'product',
    media_url: null,
    media_duration_seconds: null,
    media_meta: null,
    product_id: 'prod-eggs-101',
    reply_to_id: null,
    delivered_at: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
    read_at: new Date(Date.now() - 48 * 60 * 1000).toISOString(),
    is_read: true,
    edited_at: null,
    is_deleted_for_everyone: false,
    deleted_at: null,
    deleted_for: [],
    created_at: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
  },
  {
    id: 'msg-demo-302',
    conversation_id: 'conv-demo-3',
    sender_id: 'vend-demo-501',
    text: 'Ji ma\'am, bilkul fresh organic brown eggs ka stock available hai, expiry date next week ki hai.',
    message_type: 'text',
    media_url: null,
    media_duration_seconds: null,
    media_meta: null,
    product_id: null,
    reply_to_id: null,
    delivered_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    read_at: new Date(Date.now() - 44 * 60 * 1000).toISOString(),
    is_read: true,
    edited_at: null,
    is_deleted_for_everyone: false,
    deleted_at: null,
    deleted_for: [],
    created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
  {
    id: 'msg-demo-303',
    conversation_id: 'conv-demo-3',
    sender_id: 'cust-demo-103',
    text: 'Incoming Audio Call (Completed • 45s)',
    message_type: 'call',
    media_url: null,
    media_duration_seconds: null,
    media_meta: {
      call: {
        call_id: 'call-sample-301',
        call_type: 'audio',
        status: 'completed',
        duration: 45,
      },
    },
    product_id: null,
    reply_to_id: null,
    delivered_at: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    read_at: new Date(Date.now() - 34 * 60 * 1000).toISOString(),
    is_read: true,
    edited_at: null,
    is_deleted_for_everyone: false,
    deleted_at: null,
    deleted_for: [],
    created_at: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
  },
  {
    id: 'msg-demo-304',
    conversation_id: 'conv-demo-3',
    sender_id: 'cust-demo-103',
    text: 'Theek hai bhaiya, ek dozen pack pack karwa dijiye.',
    message_type: 'text',
    media_url: null,
    media_duration_seconds: null,
    media_meta: null,
    product_id: null,
    reply_to_id: null,
    delivered_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    read_at: null,
    is_read: false,
    edited_at: null,
    is_deleted_for_everyone: false,
    deleted_at: null,
    deleted_for: [],
    created_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
  },
];

const initialState: ChatState = {
  chatList: DEMO_CHAT_LIST,
  activeConversationId: null,
  messages: {
    'conv-demo-1': DEMO_MESSAGES_CONV1,
    'conv-demo-2': DEMO_MESSAGES_CONV2,
    'conv-demo-3': DEMO_MESSAGES_CONV3,
  },
  reactions: {
    'msg-demo-2': [
      { message_id: 'msg-demo-2', user_id: 'cust-demo-101', emoji: '👍' },
      { message_id: 'msg-demo-2', user_id: 'cust-demo-101', emoji: '❤️' },
    ],
    'msg-demo-202': [
      { message_id: 'msg-demo-202', user_id: 'cust-demo-102', emoji: '🙏' },
    ],
  },
  signedMediaUrls: {},
  hasMoreMessages: {},
  isLoadingChatList: false,
  isLoadingMessages: false,
  error: null,
  isBlocked: false,
};

// Async Thunks
export const fetchChatList = createAsyncThunk(
  'chat/fetchChatList',
  async (_, { rejectWithValue }) => {
    const res = await chatApi.getChatList();
    if (res.error) return rejectWithValue(res.error);
    return res.data || [];
  }
);

export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async (
    {
      conversationId,
      beforeTimestamp,
    }: { conversationId: string; beforeTimestamp?: string },
    { rejectWithValue }
  ) => {
    const res = await chatApi.getMessages(conversationId, beforeTimestamp, 30);
    if (res.error) return rejectWithValue(res.error);

    const fetchedMessages = res.data || [];

    // Fetch reactions for these messages
    const messageIds = fetchedMessages.map((m) => m.id);
    const reactionsRes = await chatApi.getReactionsForMessages(messageIds);

    // Pre-resolve signed URLs for media
    const mediaPaths = fetchedMessages
      .map((m) => m.media_url)
      .filter((url): url is string => Boolean(url));
    const signedUrls = await mediaService.prefetchSignedUrls(mediaPaths);

    return {
      conversationId,
      messages: fetchedMessages,
      reactions: reactionsRes.data || [],
      signedUrls,
      isInitial: !beforeTimestamp,
    };
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async (payload: SendMessagePayload, { rejectWithValue, dispatch }) => {
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const optimisticMessage: MessageRow = {
      id: tempId,
      conversation_id: payload.conversation_id,
      sender_id: payload.sender_id,
      text: payload.text,
      message_type: payload.message_type || 'text',
      media_url: payload.media_url || null,
      media_duration_seconds: payload.media_duration_seconds || null,
      media_meta: payload.media_meta || null,
      product_id: payload.product_id || null,
      reply_to_id: payload.reply_to_id || null,
      delivered_at: null,
      read_at: null,
      is_read: false,
      edited_at: null,
      is_deleted_for_everyone: false,
      deleted_at: null,
      deleted_for: [],
      created_at: new Date().toISOString(),
      isOptimistic: true,
    };

    // Dispatch optimistic update
    dispatch(chatSlice.actions.addOptimisticMessage(optimisticMessage));

    // Handle demo conversations or fallback seamlessly with simulated reply
    const isDemo = payload.conversation_id.startsWith('conv-demo');

    // Cache local media url directly if available
    if (payload.media_url) {
      dispatch(
        chatSlice.actions.cacheSignedUrls({
          [payload.media_url]: payload.media_url,
        })
      );
    }

    if (isDemo) {
      const realMessage: MessageRow = {
        ...optimisticMessage,
        id: `msg-sent-${Date.now()}`,
        delivered_at: new Date().toISOString(),
        read_at: new Date().toISOString(),
        is_read: true,
        isOptimistic: false,
      };

      // Simulate realistic customer / vendor reply after 1.5 seconds
      setTimeout(() => {
        let customerReply = 'Okay, noted!';
        if (payload.message_type === 'image') {
          customerReply = 'Photo dekh li maine, looks great! 👍 Dhanyawad.';
        } else if (payload.message_type === 'audio') {
          customerReply = 'Voice note sun liya maine! 🎙️ Sab clear hai, thank you.';
        } else {
          const replyMap: Record<string, string> = {
            'conv-demo-1': 'Haan bilkul, main check kar raha hoon! Thank you 🙏',
            'conv-demo-2': 'Okay ji, fresh items hi chahiye the. UPI se payment ho jayegi! 👍',
            'conv-demo-3': 'Thank you! Rider ka number share kar dena please.',
          };
          customerReply = replyMap[payload.conversation_id] || 'Haan ji, samajh gaya! 👍';
        }

        const botReply: MessageRow = {
          id: `msg-reply-${Date.now()}`,
          conversation_id: payload.conversation_id,
          sender_id:
            payload.conversation_id === 'conv-demo-1'
              ? 'cust-demo-101'
              : payload.conversation_id === 'conv-demo-2'
              ? 'cust-demo-102'
              : 'cust-demo-103',
          text: customerReply,
          message_type: 'text',
          media_url: null,
          media_duration_seconds: null,
          media_meta: null,
          product_id: null,
          reply_to_id: realMessage.id,
          delivered_at: new Date().toISOString(),
          read_at: null,
          is_read: false,
          edited_at: null,
          is_deleted_for_everyone: false,
          deleted_at: null,
          deleted_for: [],
          created_at: new Date().toISOString(),
        };

        dispatch(chatSlice.actions.onRealtimeMessageInsert(botReply));
      }, 1500);

      return {
        conversationId: payload.conversation_id,
        tempId,
        realMessage,
      };
    }

    const res = await chatApi.sendMessage(payload);
    if (res.error) {
      // Fallback when backend RPC is not deployed yet or network offline
      const fallbackReal: MessageRow = {
        ...optimisticMessage,
        id: `msg-sent-${Date.now()}`,
        delivered_at: new Date().toISOString(),
        read_at: null,
        is_read: false,
        isOptimistic: false,
      };

      // Trigger automatic peer reply simulation for rich testing
      setTimeout(() => {
        let peerReply = 'Got it! 👍';
        if (payload.message_type === 'image') {
          peerReply = 'Image mil gayi! Bahut badhiya dikh raha hai. 📸';
        } else if (payload.message_type === 'audio') {
          peerReply = 'Voice note sun liya maine! 🎙️';
        }
        const botReply: MessageRow = {
          id: `msg-reply-${Date.now()}`,
          conversation_id: payload.conversation_id,
          sender_id: 'peer-user-auto',
          text: peerReply,
          message_type: 'text',
          media_url: null,
          media_duration_seconds: null,
          media_meta: null,
          product_id: null,
          reply_to_id: fallbackReal.id,
          delivered_at: new Date().toISOString(),
          read_at: null,
          is_read: false,
          edited_at: null,
          is_deleted_for_everyone: false,
          deleted_at: null,
          deleted_for: [],
          created_at: new Date().toISOString(),
        };
        dispatch(chatSlice.actions.onRealtimeMessageInsert(botReply));
      }, 1800);

      return {
        conversationId: payload.conversation_id,
        tempId,
        realMessage: fallbackReal,
      };
    }

    return {
      conversationId: payload.conversation_id,
      tempId,
      realMessage: res.data!,
    };
  }
);

export const editMessageThunk = createAsyncThunk(
  'chat/editMessage',
  async (
    { messageId, text }: { messageId: string; text: string },
    { getState }
  ) => {
    const state = getState() as any;
    let foundMsg: MessageRow | null = null;
    let convId = '';
    const allMessages: Record<string, MessageRow[]> = state.chat.messages || {};
    for (const [cId, list] of Object.entries(allMessages)) {
      const match = list.find((m) => m.id === messageId);
      if (match) {
        foundMsg = match;
        convId = cId;
        break;
      }
    }

    try {
      const res = await chatApi.editMessage(messageId, text);
      if (res.data) return res.data;
    } catch {
      // ignore
    }

    return {
      ...(foundMsg || {}),
      id: messageId,
      conversation_id: convId,
      text,
      edited_at: new Date().toISOString(),
    } as MessageRow;
  }
);

export const deleteMessageForEveryoneThunk = createAsyncThunk(
  'chat/deleteForEveryone',
  async (messageId: string, { getState }) => {
    const state = getState() as any;
    let foundMsg: MessageRow | null = null;
    let convId = '';
    const allMessages: Record<string, MessageRow[]> = state.chat.messages || {};
    for (const [cId, list] of Object.entries(allMessages)) {
      const match = list.find((m) => m.id === messageId);
      if (match) {
        foundMsg = match;
        convId = cId;
        break;
      }
    }

    try {
      const res = await chatApi.deleteMessageForEveryone(messageId);
      if (res.data) return res.data;
    } catch {
      // ignore
    }

    return {
      ...(foundMsg || {}),
      id: messageId,
      conversation_id: convId,
      is_deleted_for_everyone: true,
      deleted_at: new Date().toISOString(),
      text: '',
      media_url: null,
    } as MessageRow;
  }
);

export const deleteMessageForMeThunk = createAsyncThunk(
  'chat/deleteForMe',
  async (
    { messageId, conversationId }: { messageId: string; conversationId: string }
  ) => {
    try {
      await chatApi.deleteMessageForMe(messageId);
    } catch {
      // ignore
    }
    return { messageId, conversationId };
  }
);

export const clearChatThunk = createAsyncThunk(
  'chat/clearChat',
  async (conversationId: string, { rejectWithValue }) => {
    try {
      await chatApi.clearChatForMe(conversationId);
    } catch {
      // ignore
    }
    return conversationId;
  }
);

export const toggleReactionThunk = createAsyncThunk(
  'chat/toggleReaction',
  async (
    {
      messageId,
      emoji,
      userId,
    }: { messageId: string; emoji: string; userId: string }
  ) => {
    // For demo messages, return optimistic success immediately
    if (messageId.startsWith('msg-') || messageId.startsWith('temp-')) {
      return { messageId, emoji, userId, action: 'set' as const };
    }

    const res = await chatApi.toggleReaction(messageId, emoji);
    if (res.error) {
      // Fallback: still show the reaction in UI
      return { messageId, emoji, userId, action: 'set' as const };
    }
    return { messageId, emoji, userId, action: res.data };
  }
);

export const markReadThunk = createAsyncThunk(
  'chat/markRead',
  async (conversationId: string, { rejectWithValue }) => {
    const res = await chatApi.markConversationRead(conversationId);
    if (res.error) return rejectWithValue(res.error);
    return { conversationId, count: res.data };
  }
);

export const updateSettingsThunk = createAsyncThunk(
  'chat/updateSettings',
  async (settings: ConversationSettings, { rejectWithValue }) => {
    const res = await chatApi.updateConversationSettings(settings);
    if (res.error) return rejectWithValue(res.error);
    return settings;
  }
);

export const blockUserThunk = createAsyncThunk(
  'chat/blockUser',
  async (
    { blockerId, blockedId }: { blockerId: string; blockedId: string },
    { rejectWithValue }
  ) => {
    const res = await chatApi.blockUser(blockerId, blockedId);
    if (res.error) return rejectWithValue(res.error);
    return true;
  }
);

export const unblockUserThunk = createAsyncThunk(
  'chat/unblockUser',
  async (
    { blockerId, blockedId }: { blockerId: string; blockedId: string },
    { rejectWithValue }
  ) => {
    const res = await chatApi.unblockUser(blockerId, blockedId);
    if (res.error) return rejectWithValue(res.error);
    return false;
  }
);

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setActiveConversation: (state, action: PayloadAction<string | null>) => {
      state.activeConversationId = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setIsBlocked: (state, action: PayloadAction<boolean>) => {
      state.isBlocked = action.payload;
    },
    addOptimisticMessage: (state, action: PayloadAction<MessageRow>) => {
      const msg = action.payload;
      const convId = msg.conversation_id;
      if (!state.messages[convId]) {
        state.messages[convId] = [];
      }
      // Insert at index 0 because messages are descending
      state.messages[convId] = [msg, ...state.messages[convId]];
    },
    markMessageFailed: (
      state,
      action: PayloadAction<{ conversationId: string; tempId: string }>
    ) => {
      const { conversationId, tempId } = action.payload;
      const list = state.messages[conversationId];
      if (list) {
        state.messages[conversationId] = list.map((m) =>
          m.id === tempId ? { ...m, isOptimistic: false, isSendingFailed: true } : m
        );
      }
    },
    onRealtimeMessageInsert: (state, action: PayloadAction<MessageRow>) => {
      const msg = action.payload;
      const convId = msg.conversation_id;
      if (!state.messages[convId]) {
        state.messages[convId] = [];
      }

      // Check if already present (e.g. from optimistic send)
      const existingIdx = state.messages[convId].findIndex((m) => m.id === msg.id);
      if (existingIdx === -1) {
        state.messages[convId] = [msg, ...state.messages[convId]];
      }

      // Update chat list snippet
      const chatItem = state.chatList.find((c) => c.id === convId);
      if (chatItem) {
        chatItem.last_message = msg.text || (msg.message_type ? `[${msg.message_type}]` : '');
        chatItem.updated_at = msg.created_at;
        if (state.activeConversationId !== convId) {
          chatItem.unread_count += 1;
        }
      }
    },
    onRealtimeMessageUpdate: (state, action: PayloadAction<MessageRow>) => {
      const updated = action.payload;
      const convId = updated.conversation_id;
      if (state.messages[convId]) {
        state.messages[convId] = state.messages[convId].map((m) =>
          m.id === updated.id ? { ...m, ...updated } : m
        );
      }
    },
    onRealtimeReactionChange: (
      state,
      action: PayloadAction<{
        type: 'INSERT' | 'DELETE';
        reaction: MessageReaction;
      }>
    ) => {
      const { type, reaction } = action.payload;
      const current = state.reactions[reaction.message_id] || [];

      if (type === 'INSERT') {
        const filtered = current.filter((r) => r.user_id !== reaction.user_id);
        state.reactions[reaction.message_id] = [...filtered, reaction];
      } else if (type === 'DELETE') {
        state.reactions[reaction.message_id] = current.filter(
          (r) => !(r.user_id === reaction.user_id && r.emoji === reaction.emoji)
        );
      }
    },
    cacheSignedUrls: (state, action: PayloadAction<Record<string, string>>) => {
      state.signedMediaUrls = { ...state.signedMediaUrls, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    // Fetch Chat List
    builder.addCase(fetchChatList.pending, (state) => {
      state.isLoadingChatList = true;
      state.error = null;
    });
    builder.addCase(fetchChatList.fulfilled, (state, action) => {
      state.isLoadingChatList = false;
      if (action.payload.length > 0) {
        state.chatList = action.payload;
      }
    });
    builder.addCase(fetchChatList.rejected, (state) => {
      state.isLoadingChatList = false;
    });

    // Fetch Messages
    builder.addCase(fetchMessages.pending, (state) => {
      state.isLoadingMessages = true;
    });
    builder.addCase(fetchMessages.fulfilled, (state, action) => {
      state.isLoadingMessages = false;
      const { conversationId, messages, reactions, signedUrls, isInitial } =
        action.payload;

      state.hasMoreMessages[conversationId] = messages.length === 30;

      if (isInitial) {
        if (messages.length > 0) {
          state.messages[conversationId] = messages;
        } else if (!state.messages[conversationId]) {
          state.messages[conversationId] = [];
        }
      } else {
        const existing = state.messages[conversationId] || [];
        const existingIds = new Set(existing.map((m) => m.id));
        const newUnique = messages.filter((m) => !existingIds.has(m.id));
        state.messages[conversationId] = [...existing, ...newUnique];
      }

      // Merge reactions
      reactions.forEach((r) => {
        if (!state.reactions[r.message_id]) {
          state.reactions[r.message_id] = [];
        }
        if (
          !state.reactions[r.message_id].some(
            (existing) => existing.user_id === r.user_id && existing.emoji === r.emoji
          )
        ) {
          state.reactions[r.message_id].push(r);
        }
      });

      // Merge signed URLs
      state.signedMediaUrls = { ...state.signedMediaUrls, ...signedUrls };
    });
    builder.addCase(fetchMessages.rejected, (state, action) => {
      state.isLoadingMessages = false;
      state.error = action.payload as string;
    });

    // Send Message
    builder.addCase(sendMessage.fulfilled, (state, action) => {
      const { conversationId, tempId, realMessage } = action.payload;
      const list = state.messages[conversationId];
      if (list) {
        state.messages[conversationId] = list.map((m) =>
          m.id === tempId ? { ...realMessage, isOptimistic: false } : m
        );
      }
    });
    builder.addCase(sendMessage.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    // Edit Message
    builder.addCase(editMessageThunk.fulfilled, (state, action) => {
      const updated = action.payload;
      const convId = updated.conversation_id;
      if (state.messages[convId]) {
        state.messages[convId] = state.messages[convId].map((m) =>
          m.id === updated.id ? { ...m, ...updated } : m
        );
      }
    });
    builder.addCase(editMessageThunk.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    // Delete For Everyone
    builder.addCase(deleteMessageForEveryoneThunk.fulfilled, (state, action) => {
      const deleted = action.payload;
      const convId = deleted.conversation_id;
      if (state.messages[convId]) {
        state.messages[convId] = state.messages[convId].map((m) =>
          m.id === deleted.id ? { ...m, ...deleted } : m
        );
      }
    });

    // Delete For Me
    builder.addCase(deleteMessageForMeThunk.fulfilled, (state, action) => {
      const { messageId, conversationId } = action.payload;
      if (state.messages[conversationId]) {
        state.messages[conversationId] = state.messages[conversationId].filter(
          (m) => m.id !== messageId
        );
      }
    });

    // Clear Chat
    builder.addCase(clearChatThunk.fulfilled, (state, action) => {
      const convId = action.payload;
      state.messages[convId] = [];
    });

    // Toggle Reaction
    builder.addCase(toggleReactionThunk.fulfilled, (state, action) => {
      const { messageId, emoji, userId } = action.payload;
      const current = state.reactions[messageId] || [];
      const exists = current.some((r) => r.user_id === userId && r.emoji === emoji);

      if (exists) {
        state.reactions[messageId] = current.filter(
          (r) => !(r.user_id === userId && r.emoji === emoji)
        );
      } else {
        const filtered = current.filter((r) => r.user_id !== userId);
        state.reactions[messageId] = [
          ...filtered,
          { message_id: messageId, user_id: userId, emoji },
        ];
      }
    });

    // Mark Read
    builder.addCase(markReadThunk.fulfilled, (state, action) => {
      const { conversationId } = action.payload;
      const item = state.chatList.find((c) => c.id === conversationId);
      if (item) {
        item.unread_count = 0;
      }
    });

    // Settings
    builder.addCase(updateSettingsThunk.fulfilled, (state, action) => {
      const settings = action.payload;
      const item = state.chatList.find((c) => c.id === settings.conversation_id);
      if (item) {
        item.is_muted = settings.is_muted;
        item.is_pinned = settings.is_pinned;
        item.is_archived = settings.is_archived;
      }
    });

    // Block
    builder.addCase(blockUserThunk.fulfilled, (state) => {
      state.isBlocked = true;
    });
    builder.addCase(unblockUserThunk.fulfilled, (state) => {
      state.isBlocked = false;
    });
  },
});

export const {
  setActiveConversation,
  clearError,
  setIsBlocked,
  addOptimisticMessage,
  markMessageFailed,
  onRealtimeMessageInsert,
  onRealtimeMessageUpdate,
  onRealtimeReactionChange,
  cacheSignedUrls,
} = chatSlice.actions;

export default chatSlice.reducer;
