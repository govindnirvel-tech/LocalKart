import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Clipboard,
  ActivityIndicator,
  ToastAndroid,
  Alert,
  Modal,
  TouchableOpacity,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { RootStackParamList } from '@/navigation/types';
import {
  fetchMessages,
  sendMessage,
  editMessageThunk,
  deleteMessageForEveryoneThunk,
  deleteMessageForMeThunk,
  clearChatThunk,
  toggleReactionThunk,
  markReadThunk,
  updateSettingsThunk,
  blockUserThunk,
  unblockUserThunk,
  setActiveConversation,
} from '../store/chatSlice';
import { startCallThunk } from '../../call/store/callSlice';
import { chatApi } from '../services/chatApi';
import { mediaService } from '../services/mediaService';
import { useChatRealtime } from '../hooks/useChatRealtime';
import { useTyping } from '../hooks/useTyping';
import { ChatHeader } from '../components/ChatHeader';
import { MessageBubble } from '../components/MessageBubble';
import { MessageComposer } from '../components/MessageComposer';
import { MessageActionSheet } from '../components/MessageActionSheet';
import { DateSeparator } from '../components/DateSeparator';
import { PinnedProductCard } from '../components/PinnedProductCard';
import { MessageRow, ProductPreview, MessageReaction } from '../types';

type ScreenRouteProp = RouteProp<RootStackParamList, 'ChatRoom'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const EMPTY_REACTIONS: MessageReaction[] = [];

/**
 * Fast layout estimator to skip async onLayout measurement passes in FlatList.
 * When getItemLayout is provided, VirtualizedList completely skips onLayout measuring,
 * eliminating blank screens, stutter, and layout calculation overhead during fast scroll.
 */
function estimateMessageHeight(
  msg: MessageRow,
  showDateSeparator: boolean,
  hasReactions: boolean,
  hasReply: boolean
): number {
  let height = 0;

  // 1. Date separator badge
  if (showDateSeparator) {
    height += 48; // 24 marginVertical + 24 badge
  }

  // 2. Call event pill
  if (msg.message_type === 'call') {
    return height + 46;
  }

  // 3. Deleted message bubble
  if (msg.is_deleted_for_everyone) {
    return height + 52;
  }

  // 4. Base bubble padding (top/bottom: 8 + 8 = 16) + outer wrapper margin (marginVertical: 3*2 = 6)
  let bubbleHeight = 22;

  // Quoted reply banner
  if (hasReply) {
    bubbleHeight += 46;
  }

  // Media contents
  if (msg.message_type === 'image' || msg.message_type === 'video') {
    bubbleHeight += 238;
  } else if (msg.message_type === 'audio') {
    bubbleHeight += 48;
  } else if (msg.message_type === 'file') {
    bubbleHeight += 58;
  } else if (msg.message_type === 'product') {
    bubbleHeight += 56;
  }

  // Text message content
  if (msg.text) {
    const textLen = msg.text.length;
    const lines = Math.max(1, Math.ceil(textLen / 32));
    bubbleHeight += lines * 20;
  }

  // Timestamp and ticks meta row
  bubbleHeight += 18;

  // Reaction pill row below bubble
  if (hasReactions) {
    bubbleHeight += 26;
  }

  // Read / Seen status indicator
  if (msg.read_at && msg.sender_id) {
    bubbleHeight += 18;
  }

  return height + bubbleHeight;
}

export const ChatRoomScreen: React.FC = () => {
  const route = useRoute<ScreenRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  const insets = useSafeAreaInsets();

  const {
    conversationId: initialConvId,
    vendorId,
    targetUserId,
    title,
    avatarUrl,
    lastSeenAt: initialLastSeen,
    product: initialProduct,
  } = (route.params || {}) as any;

  const authUser = useSelector((state: RootState) => state.auth.user);
  const currentUserId = authUser?.id || '';

  const [conversationId, setConversationId] = useState<string | null>(
    initialConvId || null
  );
  const [pinnedProduct, setPinnedProduct] = useState<ProductPreview | null>(
    initialProduct || null
  );

  const [selectedMessageForAction, setSelectedMessageForAction] =
    useState<MessageRow | null>(null);
  const [replyToMessage, setReplyToMessage] = useState<MessageRow | null>(null);
  const [editingMessage, setEditingMessage] = useState<MessageRow | null>(null);
  const [fullImageUrl, setFullImageUrl] = useState<string | null>(null);

  // Redux chat state
  const chatState = useSelector((state: RootState) => (state as any).chat);
  const messages: MessageRow[] =
    (conversationId && chatState.messages[conversationId]) || [];
  const reactions = chatState.reactions || {};
  const signedMediaUrls = chatState.signedMediaUrls || {};
  const isBlocked = chatState.isBlocked;
  const hasMore = Boolean(conversationId && chatState.hasMoreMessages[conversationId]);
  const isLoading = chatState.isLoadingMessages;

  // Find settings in chatList
  const currentChatView = chatState.chatList.find((c: any) => c.id === conversationId);
  const isPinned = Boolean(currentChatView?.is_pinned);
  const isMuted = Boolean(currentChatView?.is_muted);
  const isArchived = Boolean(currentChatView?.is_archived);

  // 1. Resolve or Create Conversation ID if not passed
  useEffect(() => {
    let isMounted = true;
    async function initConversation() {
      if (!conversationId && vendorId) {
        const res = await chatApi.getOrCreateConversation(vendorId);
        if (res.data && isMounted) {
          setConversationId(res.data);
          dispatch(setActiveConversation(res.data));
          dispatch(fetchMessages({ conversationId: res.data }));
        } else if (res.error) {
          showToast(res.error);
        }
      } else if (conversationId) {
        dispatch(setActiveConversation(conversationId));
        dispatch(fetchMessages({ conversationId }));
        dispatch(markReadThunk(conversationId));
      }

      // Check block status
      if (targetUserId) {
        const blocked = await chatApi.isUserBlocked(currentUserId, targetUserId);
        if (isMounted) {
          dispatch({ type: 'chat/setIsBlocked', payload: blocked });
        }
      }
    }

    initConversation();

    return () => {
      isMounted = false;
      dispatch(setActiveConversation(null));
    };
  }, [conversationId, vendorId, targetUserId, currentUserId, dispatch]);

  // 2. Realtime Subscriptions & Presence
  const messageIds = useMemo(() => messages.map((m) => m.id), [messages]);
  useChatRealtime(conversationId, currentUserId, messageIds);
  const { isOtherUserTyping, sendTyping } = useTyping(
    conversationId,
    currentUserId
  );

  const showToast = (msg: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(msg, ToastAndroid.SHORT);
    } else {
      Alert.alert('Notice', msg);
    }
  };

  // Handlers
  const handleSendText = (text: string) => {
    if (!conversationId) return;

    if (editingMessage) {
      dispatch(
        editMessageThunk({
          messageId: editingMessage.id,
          text,
        })
      );
      setEditingMessage(null);
      return;
    }

    dispatch(
      sendMessage({
        conversation_id: conversationId,
        sender_id: currentUserId,
        text,
        message_type: pinnedProduct ? 'product' : 'text',
        product_id: pinnedProduct ? pinnedProduct.id : undefined,
        reply_to_id: replyToMessage ? replyToMessage.id : undefined,
      })
    );

    setReplyToMessage(null);
    if (pinnedProduct) setPinnedProduct(null);
  };

  const handleSendMedia = async (
    uri: string,
    fileName: string,
    mimeType: string,
    fileSize?: number
  ) => {
    if (!conversationId) return;

    showToast('Uploading media...');
    const uploadRes = await mediaService.uploadMedia(
      conversationId,
      uri,
      fileName,
      mimeType,
      fileSize
    );

    if (uploadRes.error) {
      showToast(uploadRes.error);
      return;
    }

    const isImage = mimeType.startsWith('image/');
    const isVideo = mimeType.startsWith('video/');
    const messageType = isImage ? 'image' : isVideo ? 'video' : 'file';

    dispatch(
      sendMessage({
        conversation_id: conversationId,
        sender_id: currentUserId,
        text: '',
        message_type: messageType,
        media_url: uploadRes.data?.path,
        media_meta: { fileName, fileSize, mimeType },
        reply_to_id: replyToMessage ? replyToMessage.id : undefined,
      })
    );

    setReplyToMessage(null);
  };

  const handleSendVoiceNote = (durationSeconds: number) => {
    if (!conversationId) return;

    dispatch(
      sendMessage({
        conversation_id: conversationId,
        sender_id: currentUserId,
        text: 'Voice message',
        message_type: 'audio',
        media_url: `${conversationId}/voice_${Date.now()}.m4a`,
        media_duration_seconds: durationSeconds,
        reply_to_id: replyToMessage ? replyToMessage.id : undefined,
      })
    );
    setReplyToMessage(null);
  };

  // Calling Handlers
  const handleStartCall = (callType: 'audio' | 'video') => {
    if (!targetUserId) {
      showToast('Recipient details not available.');
      return;
    }

    dispatch(
      startCallThunk({
        receiverId: targetUserId,
        callType,
        participant: {
          id: targetUserId,
          name: title || 'LocalKart User',
          avatar: avatarUrl,
          role: authUser?.role === 'vendor' ? 'customer' : 'vendor',
        },
      })
    );

    navigation.navigate('ActiveCall' as any);
  };

  // Load more messages on inverted list scroll
  const handleLoadMore = () => {
    if (!isLoading && hasMore && conversationId && messages.length > 0) {
      const oldestMessage = messages[messages.length - 1];
      dispatch(
        fetchMessages({
          conversationId,
          beforeTimestamp: oldestMessage.created_at,
        })
      );
    }
  };

  const handleCopyText = (content: string) => {
    Clipboard.setString(content);
    showToast('Copied to clipboard');
  };

  // 1. Stable keyExtractor
  const keyExtractor = useCallback((item: MessageRow) => item.id, []);

  // 2. O(1) Map for reply target lookups (eliminates O(N) array search per row)
  const messageMap = useMemo(() => {
    const map = new Map<string, MessageRow>();
    messages.forEach((m) => map.set(m.id, m));
    return map;
  }, [messages]);

  // 3. Stable callbacks for MessageBubble to avoid re-rendering entire list on scroll
  const handleMessageLongPress = useCallback((msg: MessageRow) => {
    setSelectedMessageForAction(msg);
  }, []);

  const handlePressImage = useCallback((url: string) => {
    setFullImageUrl(url);
  }, []);

  const handleDoubleTapHeart = useCallback((msgId: string) => {
    dispatch(
      toggleReactionThunk({
        messageId: msgId,
        emoji: '❤️',
        userId: currentUserId,
      })
    );
  }, [dispatch, currentUserId]);

  const handlePressProduct = useCallback((prodId: string) => {
    navigation.navigate('ProductDetails', {
      productId: prodId,
      name: 'Product Details',
    });
  }, [navigation]);

  const handlePinnedProductPress = useCallback(() => {
    if (!pinnedProduct) return;
    navigation.navigate('ProductDetails', {
      productId: pinnedProduct.id,
      name: pinnedProduct.title,
    });
  }, [navigation, pinnedProduct]);

  const handleDismissPinnedProduct = useCallback(() => {
    setPinnedProduct(null);
  }, []);

  const handleCancelReply = useCallback(() => {
    setReplyToMessage(null);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingMessage(null);
  }, []);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleAudioCallPress = useCallback(() => {
    handleStartCall('audio');
  }, [handleStartCall]);

  const handleVideoCallPress = useCallback(() => {
    handleStartCall('video');
  }, [handleStartCall]);

  const handleTogglePinPress = useCallback(() => {
    if (!conversationId) return;
    dispatch(
      updateSettingsThunk({
        conversation_id: conversationId,
        user_id: currentUserId,
        is_muted: isMuted,
        is_pinned: !isPinned,
        is_archived: isArchived,
      })
    );
  }, [dispatch, conversationId, currentUserId, isMuted, isPinned, isArchived]);

  const handleToggleMutePress = useCallback(() => {
    if (!conversationId) return;
    dispatch(
      updateSettingsThunk({
        conversation_id: conversationId,
        user_id: currentUserId,
        is_muted: !isMuted,
        is_pinned: isPinned,
        is_archived: isArchived,
      })
    );
  }, [dispatch, conversationId, currentUserId, isMuted, isPinned, isArchived]);

  const handleToggleArchivePress = useCallback(() => {
    if (!conversationId) return;
    dispatch(
      updateSettingsThunk({
        conversation_id: conversationId,
        user_id: currentUserId,
        is_muted: isMuted,
        is_pinned: isPinned,
        is_archived: !isArchived,
      })
    );
  }, [dispatch, conversationId, currentUserId, isMuted, isPinned, isArchived]);

  const handleToggleBlockPress = useCallback(() => {
    if (!targetUserId) return;
    if (isBlocked) {
      dispatch(unblockUserThunk({ blockerId: currentUserId, blockedId: targetUserId }));
    } else {
      dispatch(blockUserThunk({ blockerId: currentUserId, blockedId: targetUserId }));
    }
  }, [dispatch, targetUserId, isBlocked, currentUserId]);

  const handleClearChatPress = useCallback(() => {
    if (!conversationId) return;
    dispatch(clearChatThunk(conversationId));
  }, [dispatch, conversationId]);

  // Precomputed layout offsets array: skips async onLayout measurement passes in FlatList
  const itemLayouts = useMemo(() => {
    if (!messages || messages.length === 0) return [];
    let currentOffset = 0;
    return messages.map((item, index) => {
      const currentMsgDate = new Date(item.created_at).toDateString();
      const nextMsg = messages[index + 1];
      const nextMsgDate = nextMsg ? new Date(nextMsg.created_at).toDateString() : null;
      const showDateSeparator = currentMsgDate !== nextMsgDate;
      const hasReactions = Boolean(reactions[item.id] && reactions[item.id].length > 0);
      const hasReply = Boolean(item.reply_to_id);

      const length = estimateMessageHeight(item, showDateSeparator, hasReactions, hasReply);
      const offset = currentOffset;
      currentOffset += length;
      return { length, offset, index };
    });
  }, [messages, reactions]);

  const getItemLayout = useCallback(
    (_: any, index: number) => {
      const layout = itemLayouts[index];
      if (!layout) {
        return { length: 70, offset: 70 * index, index };
      }
      return layout;
    },
    [itemLayouts]
  );

  const renderListFooter = useCallback(() => {
    if (isLoading && hasMore) {
      return <ActivityIndicator size="small" color="#0095F6" style={{ marginVertical: 12 }} />;
    }
    return null;
  }, [isLoading, hasMore]);

  // 4. Memoized renderItem for FlatList
  const renderMessageItem = useCallback(({ item, index }: { item: MessageRow; index: number }) => {
    const currentMsgDate = new Date(item.created_at).toDateString();
    const nextMsg = messages[index + 1];
    const nextMsgDate = nextMsg ? new Date(nextMsg.created_at).toDateString() : null;
    const showDateSeparator = currentMsgDate !== nextMsgDate;

    // Fast O(1) map lookup
    const replyTarget = item.reply_to_id ? messageMap.get(item.reply_to_id) || null : null;

    return (
      <View>
        {showDateSeparator && <DateSeparator dateString={item.created_at} />}
        <MessageBubble
          message={item}
          currentUserId={currentUserId}
          reactions={reactions[item.id] || EMPTY_REACTIONS}
          replyTargetMessage={replyTarget}
          signedUrl={item.media_url ? (signedMediaUrls[item.media_url] || item.media_url) : null}
          onLongPress={handleMessageLongPress}
          onPressImage={handlePressImage}
          onDoubleTapHeart={handleDoubleTapHeart}
          onPressProduct={handlePressProduct}
        />
      </View>
    );
  }, [
    messages,
    messageMap,
    currentUserId,
    reactions,
    signedMediaUrls,
    handleMessageLongPress,
    handlePressImage,
    handleDoubleTapHeart,
    handlePressProduct,
  ]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* 1. Header Bar */}
      <ChatHeader
        title={title || 'Chat'}
        avatarUrl={avatarUrl}
        isTyping={isOtherUserTyping}
        lastSeenAt={initialLastSeen}
        isPinned={isPinned}
        isMuted={isMuted}
        isArchived={isArchived}
        isBlocked={isBlocked}
        onBack={handleBack}
        onAudioCall={handleAudioCallPress}
        onVideoCall={handleVideoCallPress}
        onTogglePin={handleTogglePinPress}
        onToggleMute={handleToggleMutePress}
        onToggleArchive={handleToggleArchivePress}
        onToggleBlock={handleToggleBlockPress}
        onClearChat={handleClearChatPress}
      />

      {/* 2. Pinned Product Inquired Banner */}
      {pinnedProduct && (
        <PinnedProductCard
          product={pinnedProduct}
          onPress={handlePinnedProductPress}
          onDismiss={handleDismissPinnedProduct}
        />
      )}

      {/* 3. Messages Inverted FlatList */}
      <KeyboardAvoidingView
        style={styles.flexOne}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          data={messages}
          keyExtractor={keyExtractor}
          inverted
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          removeClippedSubviews={Platform.OS === 'android'}
          maxToRenderPerBatch={6}
          windowSize={5}
          initialNumToRender={15}
          updateCellsBatchingPeriod={30}
          getItemLayout={getItemLayout}
          renderItem={renderMessageItem}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={renderListFooter}
          contentContainerStyle={styles.listContent}
        />

        {/* 4. Message Input Composer */}
        <MessageComposer
          conversationId={conversationId || ''}
          isBlocked={isBlocked}
          replyToMessage={replyToMessage}
          editingMessage={editingMessage}
          bottomInset={insets.bottom}
          onSendText={handleSendText}
          onSendMedia={handleSendMedia}
          onSendVoiceNote={handleSendVoiceNote}
          onCancelReply={handleCancelReply}
          onCancelEdit={handleCancelEdit}
          onTyping={sendTyping}
        />
      </KeyboardAvoidingView>

      {/* 5. Long Press Action Sheet Modal */}
      <MessageActionSheet
        visible={Boolean(selectedMessageForAction)}
        message={selectedMessageForAction}
        currentUserId={currentUserId}
        onClose={() => setSelectedMessageForAction(null)}
        onReply={(msg) => setReplyToMessage(msg)}
        onReact={(msgId, emoji) => {
          dispatch(
            toggleReactionThunk({
              messageId: msgId,
              emoji,
              userId: currentUserId,
            })
          );
        }}
        onCopy={handleCopyText}
        onEdit={(msg) => setEditingMessage(msg)}
        onDeleteForMe={(msgId) => {
          if (conversationId) {
            dispatch(deleteMessageForMeThunk({ messageId: msgId, conversationId }));
          }
        }}
        onDeleteForEveryone={(msgId) => {
          dispatch(deleteMessageForEveryoneThunk(msgId));
        }}
      />

      {/* 6. Fullscreen Image Viewer Modal */}
      <Modal
        visible={Boolean(fullImageUrl)}
        transparent
        animationType="fade"
        onRequestClose={() => setFullImageUrl(null)}
      >
        <View style={styles.imageViewerOverlay}>
          <TouchableOpacity
            style={styles.imageViewerCloseBtn}
            onPress={() => setFullImageUrl(null)}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <X size={28} color="#FFFFFF" />
          </TouchableOpacity>
          {Boolean(fullImageUrl) && (
            <FastImage
              source={{
                uri: fullImageUrl!,
                priority: FastImage.priority.high,
                cache: FastImage.cacheControl.immutable,
              }}
              style={styles.fullScreenImage}
              resizeMode={FastImage.resizeMode.contain}
            />
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  flexOne: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 10,
  },
  imageViewerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageViewerCloseBtn: {
    position: 'absolute',
    top: 48,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: 20,
  },
  fullScreenImage: {
    width: '94%',
    height: '80%',
  },
});
