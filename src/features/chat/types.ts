export type MessageType =
  | 'text'
  | 'image'
  | 'video'
  | 'audio'
  | 'file'
  | 'product'
  | 'call'
  | 'system';

export type CallType = 'audio' | 'video';

export type CallStatus =
  | 'ringing'
  | 'ongoing'
  | 'completed'
  | 'missed'
  | 'declined'
  | 'cancelled';

export interface CallMeta {
  call_id: string;
  call_type: CallType;
  status: CallStatus;
  duration?: number;
}

export interface MediaMeta {
  width?: number;
  height?: number;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  call?: CallMeta;
}

export interface MessageReaction {
  message_id: string;
  user_id: string;
  emoji: string;
}

export interface MessageRow {
  id: string;
  conversation_id: string;
  sender_id: string;
  text: string;
  message_type: MessageType;
  media_url: string | null;
  media_duration_seconds: number | null;
  media_meta: MediaMeta | null;
  product_id: string | null;
  reply_to_id: string | null;
  delivered_at: string | null;
  read_at: string | null;
  is_read: boolean;
  edited_at: string | null;
  is_deleted_for_everyone: boolean;
  deleted_at: string | null;
  deleted_for: string[];
  created_at: string;
  // Client-side enriched state
  reactions?: MessageReaction[];
  replyMessage?: MessageRow | null;
  signedMediaUrl?: string | null;
  isOptimistic?: boolean;
  isSendingFailed?: boolean;
}

export interface ConversationSettings {
  conversation_id: string;
  user_id: string;
  is_muted: boolean;
  is_pinned: boolean;
  is_archived: boolean;
}

export interface ChatListItemView {
  id: string;
  customer_id: string;
  vendor_id: string;
  last_message: string | null;
  updated_at: string;
  store_name: string | null;
  store_logo: string | null;
  vendor_user_id: string | null;
  customer_name: string | null;
  customer_image: string | null;
  customer_last_seen: string | null;
  vendor_last_seen: string | null;
  is_muted: boolean;
  is_pinned: boolean;
  is_archived: boolean;
  unread_count: number;
}

export interface ProfileSnippet {
  id: string;
  full_name: string | null;
  image_url: string | null;
  last_seen_at: string | null;
}

export interface ProductPreview {
  id: string;
  title: string;
  price: number;
  discount_price?: number | null;
  image_url?: string | null;
}

export interface SendMessagePayload {
  conversation_id: string;
  sender_id: string;
  text: string;
  message_type?: MessageType;
  media_url?: string | null;
  media_duration_seconds?: number | null;
  media_meta?: MediaMeta | null;
  product_id?: string | null;
  reply_to_id?: string | null;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}
