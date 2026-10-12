import { supabase } from '@/lib/supabase';
import {
  ApiResponse,
  ChatListItemView,
  MessageRow,
  MessageReaction,
  SendMessagePayload,
  ConversationSettings,
  ProductPreview,
} from '../types';

export const chatApi = {
  /**
   * Helper: extract clean Hinglish/English error message from Supabase response
   */
  formatError(error: any): string {
    if (!error) return 'Kuch galat ho gaya, dobara koshish karein.';
    if (typeof error === 'string') return error;
    if (error.message) return error.message;
    if (error.details) return error.details;
    return 'An unexpected error occurred';
  },

  /**
   * Fetch chat list from chat_list_view
   */
  async getChatList(): Promise<ApiResponse<ChatListItemView[]>> {
    try {
      const { data, error } = await supabase
        .from('chat_list_view')
        .select('*');

      if (error) throw error;
      return { data: (data as ChatListItemView[]) || [], error: null };
    } catch (err: any) {
      return { data: null, error: chatApi.formatError(err) };
    }
  },

  /**
   * Create or fetch existing conversation via RPC
   */
  async getOrCreateConversation(vendorId: string): Promise<ApiResponse<string>> {
    try {
      const { data, error } = await supabase.rpc('get_or_create_conversation', {
        p_vendor_id: vendorId,
      });

      if (error) throw error;
      return { data: data as string, error: null };
    } catch (err: any) {
      return { data: null, error: chatApi.formatError(err) };
    }
  },

  /**
   * Fetch paginated messages (latest 30 by created_at desc)
   * Cursor pagination using beforeTimestamp
   */
  async getMessages(
    conversationId: string,
    beforeTimestamp?: string,
    limit = 30
  ): Promise<ApiResponse<MessageRow[]>> {
    try {
      let query = supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (beforeTimestamp) {
        query = query.lt('created_at', beforeTimestamp);
      }

      const { data, error } = await query;
      if (error) throw error;

      return { data: (data as MessageRow[]) || [], error: null };
    } catch (err: any) {
      return { data: null, error: chatApi.formatError(err) };
    }
  },

  /**
   * Fetch reactions for given messages
   */
  async getReactionsForMessages(
    messageIds: string[]
  ): Promise<ApiResponse<MessageReaction[]>> {
    try {
      if (!messageIds.length) return { data: [], error: null };
      const { data, error } = await supabase
        .from('message_reactions')
        .select('*')
        .in('message_id', messageIds);

      if (error) throw error;
      return { data: (data as MessageReaction[]) || [], error: null };
    } catch (err: any) {
      return { data: null, error: chatApi.formatError(err) };
    }
  },

  /**
   * Insert a new message (Client only inserts, never updates/deletes directly)
   */
  async sendMessage(payload: SendMessagePayload): Promise<ApiResponse<MessageRow>> {
    try {
      if (payload.text.length > 4000) {
        return { data: null, error: 'Message 4000 characters se bada nahi ho sakta.' };
      }

      const insertPayload: any = {
        conversation_id: payload.conversation_id,
        sender_id: payload.sender_id,
        text: payload.text,
        message_type: payload.message_type || 'text',
        media_url: payload.media_url || null,
        media_duration_seconds: payload.media_duration_seconds || null,
        media_meta: payload.media_meta || null,
        product_id: payload.product_id || null,
        reply_to_id: payload.reply_to_id || null,
      };

      const { data, error } = await supabase
        .from('messages')
        .insert(insertPayload)
        .select()
        .single();

      if (error) throw error;
      return { data: data as MessageRow, error: null };
    } catch (err: any) {
      return { data: null, error: chatApi.formatError(err) };
    }
  },

  /**
   * Edit message via RPC (own text message only, within 15 min)
   */
  async editMessage(messageId: string, newText: string): Promise<ApiResponse<MessageRow>> {
    try {
      const { data, error } = await supabase.rpc('edit_message', {
        p_id: messageId,
        p_text: newText,
      });

      if (error) throw error;
      return { data: data as MessageRow, error: null };
    } catch (err: any) {
      return { data: null, error: chatApi.formatError(err) };
    }
  },

  /**
   * Delete message for everyone via RPC (own message only)
   */
  async deleteMessageForEveryone(messageId: string): Promise<ApiResponse<MessageRow>> {
    try {
      const { data, error } = await supabase.rpc('delete_message_for_everyone', {
        p_id: messageId,
      });

      if (error) throw error;
      return { data: data as MessageRow, error: null };
    } catch (err: any) {
      return { data: null, error: chatApi.formatError(err) };
    }
  },

  /**
   * Delete message for me via RPC
   */
  async deleteMessageForMe(messageId: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase.rpc('delete_message_for_me', {
        p_id: messageId,
      });

      if (error) throw error;
      return { data: null, error: null };
    } catch (err: any) {
      return { data: null, error: chatApi.formatError(err) };
    }
  },

  /**
   * Clear entire chat for current user via RPC
   */
  async clearChatForMe(conversationId: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase.rpc('clear_chat_for_me', {
        p_conv: conversationId,
      });

      if (error) throw error;
      return { data: null, error: null };
    } catch (err: any) {
      return { data: null, error: chatApi.formatError(err) };
    }
  },

  /**
   * Mark all unread messages in conversation as read via RPC
   */
  async markConversationRead(conversationId: string): Promise<ApiResponse<number>> {
    try {
      const { data, error } = await supabase.rpc('mark_conversation_read', {
        p_conv: conversationId,
      });

      if (error) throw error;
      return { data: data as number, error: null };
    } catch (err: any) {
      return { data: null, error: chatApi.formatError(err) };
    }
  },

  /**
   * Mark all delivered on app foreground via RPC
   */
  async markAllDelivered(): Promise<ApiResponse<number>> {
    try {
      const { data, error } = await supabase.rpc('mark_all_delivered');
      if (error) throw error;
      return { data: data as number, error: null };
    } catch (err: any) {
      return { data: null, error: chatApi.formatError(err) };
    }
  },

  /**
   * Toggle emoji reaction via RPC
   */
  async toggleReaction(
    messageId: string,
    emoji: string
  ): Promise<ApiResponse<'set' | 'removed'>> {
    try {
      const { data, error } = await supabase.rpc('toggle_reaction', {
        p_message: messageId,
        p_emoji: emoji,
      });

      if (error) throw error;
      return { data: data as 'set' | 'removed', error: null };
    } catch (err: any) {
      return { data: null, error: chatApi.formatError(err) };
    }
  },

  /**
   * Update current user's last_seen_at
   */
  async updateLastSeen(): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase.rpc('update_last_seen');
      if (error) throw error;
      return { data: null, error: null };
    } catch (err: any) {
      return { data: null, error: chatApi.formatError(err) };
    }
  },

  /**
   * Upsert conversation settings (pinned, muted, archived)
   */
  async updateConversationSettings(
    settings: ConversationSettings
  ): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('conversation_settings')
        .upsert(settings, { onConflict: 'conversation_id,user_id' });

      if (error) throw error;
      return { data: null, error: null };
    } catch (err: any) {
      return { data: null, error: chatApi.formatError(err) };
    }
  },

  /**
   * Block / Unblock user
   */
  async blockUser(blockerId: string, blockedId: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('user_blocks')
        .insert({ blocker_id: blockerId, blocked_id: blockedId });

      if (error) throw error;
      return { data: null, error: null };
    } catch (err: any) {
      return { data: null, error: chatApi.formatError(err) };
    }
  },

  async unblockUser(blockerId: string, blockedId: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('user_blocks')
        .delete()
        .match({ blocker_id: blockerId, blocked_id: blockedId });

      if (error) throw error;
      return { data: null, error: null };
    } catch (err: any) {
      return { data: null, error: chatApi.formatError(err) };
    }
  },

  async isUserBlocked(currentUserId: string, targetUserId: string): Promise<boolean> {
    try {
      const { data } = await supabase
        .from('user_blocks')
        .select('*')
        .or(
          `and(blocker_id.eq.${currentUserId},blocked_id.eq.${targetUserId}),and(blocker_id.eq.${targetUserId},blocked_id.eq.${currentUserId})`
        );

      return Boolean(data && data.length > 0);
    } catch {
      return false;
    }
  },

  /**
   * Fetch Product details preview for product cards
   */
  async getProductPreview(productId: string): Promise<ProductPreview | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, title, price, discount_price, images')
        .eq('id', productId)
        .single();

      if (error || !data) return null;
      return {
        id: data.id,
        title: data.title,
        price: Number(data.price),
        discount_price: data.discount_price ? Number(data.discount_price) : null,
        image_url: Array.isArray(data.images) && data.images.length > 0 ? data.images[0] : null,
      };
    } catch {
      return null;
    }
  },
};
