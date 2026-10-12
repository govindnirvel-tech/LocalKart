import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSelector, useDispatch } from 'react-redux';
import {
  ChevronLeft,
  ChevronDown,
  SquarePen,
  Search,
  Plus,
  MessageSquare,
  Phone,
  Video,
} from 'lucide-react-native';
import { launchCamera } from 'react-native-image-picker';
import { RootState, AppDispatch } from '@/store';
import { RootStackParamList } from '@/navigation/types';
import { fonts } from '@/theme/fonts';
import {
  fetchChatList,
  updateSettingsThunk,
  sendMessage,
} from '../store/chatSlice';
import { setIncomingCall } from '../../call/store/callSlice';
import { ChatListItem } from '../components/ChatListItem';
import { ChatListItemView } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Demo Notes data matching Screen 3 in image
interface UserNote {
  id: string;
  name: string;
  avatar: string;
  thought: string;
  isSelf?: boolean;
}

const INITIAL_NOTES: UserNote[] = [
  {
    id: 'note-self',
    name: 'Your note',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    thought: 'Share a thought...',
    isSelf: true,
  },
  {
    id: 'note-1',
    name: 'Jihoon Song',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    thought: 'Sea ranch this weekend? 🌊',
  },
  {
    id: 'note-2',
    name: 'Ricky Padilla',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    thought: 'Fresh fruits here! 🍓',
  },
  {
    id: 'note-3',
    name: 'Alex Walker',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    thought: 'Boo! 👻',
  },
  {
    id: 'note-4',
    name: 'Ana Thomas',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&auto=format&fit=crop&q=80',
    thought: 'Organic milk in stock 🥛',
  },
];

export const ChatListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useDispatch<AppDispatch>();

  const authUser = useSelector((state: RootState) => state.auth.user);
  const { chatList, isLoadingChatList } = useSelector(
    (state: RootState) => (state as any).chat
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'messages' | 'channels' | 'requests'>('messages');
  const [notes, setNotes] = useState<UserNote[]>(INITIAL_NOTES);

  const currentUserId = authUser?.id || '';
  const isCustomer = authUser?.role !== 'vendor';
  const usernameHandle = isCustomer ? 'kalindi_rainbows' : 'localkart_merchant';

  useEffect(() => {
    dispatch(fetchChatList());
  }, [dispatch]);

  // Filter and sort items: pinned first, then updated_at desc
  const filteredChats = useMemo(() => {
    return (chatList as ChatListItemView[])
      .filter((item: ChatListItemView) => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const targetName = isCustomer
            ? item.store_name || ''
            : item.customer_name || '';
          return targetName.toLowerCase().includes(q);
        }
        return true;
      })
      .sort((a: ChatListItemView, b: ChatListItemView) => {
        if (a.is_pinned && !b.is_pinned) return -1;
        if (!a.is_pinned && b.is_pinned) return 1;
        return (
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
      });
  }, [chatList, searchQuery, isCustomer]);

  const handleOpenChat = useCallback(
    (item: ChatListItemView) => {
      const targetUserId = isCustomer
        ? item.vendor_user_id || item.vendor_id
        : item.customer_id;

      navigation.navigate('ChatRoom', {
        conversationId: item.id,
        vendorId: item.vendor_id,
        targetUserId,
        title: isCustomer ? item.store_name || 'Store' : item.customer_name || 'Customer',
        avatarUrl: isCustomer ? item.store_logo : item.customer_image,
        lastSeenAt: isCustomer ? item.vendor_last_seen : item.customer_last_seen,
      } as any);
    },
    [isCustomer, navigation]
  );

  // Direct camera snapshot from chat list
  const handleCameraSnap = useCallback(
    async (item: ChatListItemView) => {
      try {
        const result = await launchCamera({
          mediaType: 'photo',
          quality: 0.8,
          saveToPhotos: false,
        });

        if (result.assets && result.assets.length > 0) {
          const asset = result.assets[0];
          if (asset.uri) {
            // Send photo to this conversation
            dispatch(
              sendMessage({
                conversation_id: item.id,
                sender_id: currentUserId,
                text: '',
                message_type: 'image',
                media_url: asset.uri,
                media_meta: {
                  fileName: asset.fileName || 'camera_snap.jpg',
                  mimeType: asset.type || 'image/jpeg',
                  fileSize: asset.fileSize,
                },
              })
            );

            // Open the chat room
            handleOpenChat(item);
          }
        }
      } catch {
        Alert.alert('Notice', 'Unable to launch camera.');
      }
    },
    [currentUserId, dispatch, handleOpenChat]
  );

  const handleTogglePin = useCallback(
    (item: ChatListItemView) => {
      dispatch(
        updateSettingsThunk({
          conversation_id: item.id,
          user_id: currentUserId,
          is_muted: item.is_muted,
          is_pinned: !item.is_pinned,
          is_archived: item.is_archived,
        })
      );
    },
    [currentUserId, dispatch]
  );

  const handleToggleMute = useCallback(
    (item: ChatListItemView) => {
      dispatch(
        updateSettingsThunk({
          conversation_id: item.id,
          user_id: currentUserId,
          is_muted: !item.is_muted,
          is_pinned: item.is_pinned,
          is_archived: item.is_archived,
        })
      );
    },
    [currentUserId, dispatch]
  );

  const handleDeleteChat = useCallback(
    (item: ChatListItemView) => {
      Alert.alert(
        'Delete Conversation?',
        'Are you sure you want to delete this chat?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              // Delete locally
              dispatch({
                type: 'chat/clearChat/fulfilled',
                payload: item.id,
              });
            },
          },
        ]
      );
    },
    [dispatch]
  );

  const keyExtractor = useCallback((item: ChatListItemView) => item.id, []);

  const renderChatItem = useCallback(
    ({ item }: { item: ChatListItemView }) => (
      <ChatListItem
        item={item}
        currentUserId={currentUserId}
        isCustomer={isCustomer}
        onPress={handleOpenChat}
        onCameraPress={handleCameraSnap}
        onTogglePin={handleTogglePin}
        onToggleMute={handleToggleMute}
        onDeleteChat={handleDeleteChat}
      />
    ),
    [
      currentUserId,
      isCustomer,
      handleOpenChat,
      handleCameraSnap,
      handleTogglePin,
      handleToggleMute,
      handleDeleteChat,
    ]
  );

  const handleNotePress = useCallback((note: UserNote) => {
    if (note.isSelf) {
      Alert.prompt
        ? Alert.prompt(
            'Share a thought',
            'What is on your mind today?',
            (text) => {
              if (text && text.trim()) {
                setNotes((prev) =>
                  prev.map((n) => (n.isSelf ? { ...n, thought: text.trim() } : n))
                );
              }
            }
          )
        : Alert.alert('Share a Thought', 'Market thoughts: Fresh vegetables in stock today!');
    }
  }, []);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleHeaderCompose = useCallback(() => {
    if (filteredChats.length > 0) handleOpenChat(filteredChats[0]);
  }, [filteredChats, handleOpenChat]);

  const handleSelectTabMessages = useCallback(() => setActiveTab('messages'), []);
  const handleSelectTabChannels = useCallback(() => setActiveTab('channels'), []);
  const handleSelectTabRequests = useCallback(() => setActiveTab('requests'), []);

  const handleRefresh = useCallback(() => {
    dispatch(fetchChatList());
  }, [dispatch]);

  const renderEmptyComponent = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconWrap}>
          <MessageSquare size={36} color="#0095F6" />
        </View>
        <Text style={styles.emptyTitle}>No messages yet</Text>
        <Text style={styles.emptySub}>
          Start chatting with your neighborhood sellers and customers.
        </Text>
      </View>
    ),
    []
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      {/* 1. Instagram Direct Header Bar (Screen 3) */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleGoBack}
          style={styles.headerBackBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ChevronLeft size={28} strokeWidth={1} color="#262626" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.headerTitleWrap} activeOpacity={0.7}>
          <Text style={styles.headerHandle}>{usernameHandle}</Text>
          <ChevronDown size={18} strokeWidth={1} color="#262626" style={{ marginLeft: 2 }} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.headerComposeBtn}
          accessibilityLabel="New message"
          onPress={handleHeaderCompose}
        >
          <SquarePen size={24} strokeWidth={1} color="#262626" />
        </TouchableOpacity>
      </View>

      {/* 2. Instagram Notes Row (Screen 3 in image!) */}
      <View style={styles.notesContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.notesScrollContent}
        >
          {notes.map((note) => (
            <TouchableOpacity
              key={note.id}
              style={styles.noteItem}
              onPress={() => handleNotePress(note)}
              activeOpacity={0.8}
            >
              {/* Floating Thought Bubble on Top of Avatar */}
              <View style={styles.thoughtBubbleWrap}>
                <View style={styles.thoughtBubble}>
                  <Text style={styles.thoughtText} numberOfLines={2}>
                    {note.thought}
                  </Text>
                </View>
                {/* Speech bubble arrow notch */}
                <View style={styles.thoughtArrowNotch} />
              </View>

              {/* Avatar circle with + badge if self */}
              <View style={styles.noteAvatarWrap}>
                <FastImage
                  source={{
                    uri: note.avatar,
                    priority: FastImage.priority.normal,
                    cache: FastImage.cacheControl.immutable,
                  }}
                  style={styles.noteAvatar}
                  resizeMode={FastImage.resizeMode.cover}
                />
                {note.isSelf && (
                  <View style={styles.noteAddBadge}>
                    <Plus size={12} color="#FFFFFF" strokeWidth={3} />
                  </View>
                )}
              </View>

              <Text style={styles.noteAuthorName} numberOfLines={1}>
                {note.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 3. Filter Tabs Row (Screen 3: Messages, Channels, Requests) */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'messages' && styles.tabBtnActive]}
          onPress={handleSelectTabMessages}
        >
          {activeTab === 'messages' && <View style={styles.tabActiveDot} />}
          <Text
            style={[
              styles.tabBtnText,
              activeTab === 'messages' && styles.tabBtnTextActive,
            ]}
          >
            Messages
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'channels' && styles.tabBtnActive]}
          onPress={handleSelectTabChannels}
        >
          <Text
            style={[
              styles.tabBtnText,
              activeTab === 'channels' && styles.tabBtnTextActive,
            ]}
          >
            Channels
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'requests' && styles.tabBtnActive]}
          onPress={handleSelectTabRequests}
        >
          <Text
            style={[
              styles.tabBtnText,
              activeTab === 'requests' && styles.tabBtnTextActive,
            ]}
          >
            Requests
          </Text>
        </TouchableOpacity>
      </View>

      {/* 4. Search Bar */}
      <View style={styles.searchWrap}>
        <Search size={18} color="#8E8E93" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          placeholderTextColor="#8E8E93"
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
      </View>

      {/* 5. Conversation FlatList */}
      {isLoadingChatList && !chatList.length ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color="#0095F6" />
        </View>
      ) : (
        <FlatList
          data={filteredChats}
          keyExtractor={keyExtractor}
          removeClippedSubviews={Platform.OS === 'android'}
          maxToRenderPerBatch={10}
          windowSize={7}
          initialNumToRender={12}
          updateCellsBatchingPeriod={50}
          renderItem={renderChatItem}
          refreshControl={
            <RefreshControl
              refreshing={isLoadingChatList}
              onRefresh={handleRefresh}
              colors={['#0095F6']}
            />
          }
          ListEmptyComponent={renderEmptyComponent}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  headerBackBtn: {
    padding: 2,
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerHandle: {
    fontSize: 20,
    fontFamily: fonts.raleway.bold,
    color: '#262626',
  },
  headerComposeBtn: {
    padding: 2,
  },

  /* Notes Row (Screen 3) */
  notesContainer: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
  },
  notesScrollContent: {
    paddingHorizontal: 14,
    gap: 16,
    alignItems: 'flex-start',
  },
  noteItem: {
    alignItems: 'center',
    width: 80,
  },
  thoughtBubbleWrap: {
    alignItems: 'center',
    marginBottom: 4,
    minHeight: 44,
    justifyContent: 'flex-end',
  },
  thoughtBubble: {
    backgroundColor: '#F2F4F7',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    maxWidth: 82,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  thoughtText: {
    fontSize: 10,
    fontFamily: fonts.raleway.medium,
    color: '#262626',
    textAlign: 'center',
    lineHeight: 13,
  },
  thoughtArrowNotch: {
    width: 6,
    height: 4,
    backgroundColor: '#F2F4F7',
    transform: [{ rotate: '45deg' }],
    marginTop: -2,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  noteAvatarWrap: {
    position: 'relative',
    marginTop: 2,
  },
  noteAvatar: {
    width: 62,
    height: 62,
    borderRadius: 31,
  },
  noteAddBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#0095F6',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteAuthorName: {
    fontSize: 11,
    fontFamily: fonts.raleway.regular,
    color: '#262626',
    marginTop: 6,
    textAlign: 'center',
  },

  /* Filter Tabs (Messages, Channels, Requests) */
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
  },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#F2F2F2',
  },
  tabBtnActive: {
    backgroundColor: '#EBF5FF',
  },
  tabActiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0095F6',
    marginRight: 6,
  },
  tabBtnText: {
    fontSize: 13,
    fontFamily: fonts.raleway.semiBold,
    color: '#737373',
  },
  tabBtnTextActive: {
    color: '#0095F6',
    fontFamily: fonts.raleway.bold,
  },

  /* Search Bar */
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFEFEF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    paddingHorizontal: 12,
    height: 38,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.raleway.regular,
    color: '#262626',
    paddingVertical: 0,
  },

  centerLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 32,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EBF5FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: fonts.raleway.bold,
    color: '#262626',
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    fontFamily: fonts.raleway.regular,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 18,
  },
});
