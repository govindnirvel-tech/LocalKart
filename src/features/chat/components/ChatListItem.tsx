import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import {
  Camera,
  Pin,
  PinOff,
  VolumeX,
  Volume2,
  Trash2,
} from 'lucide-react-native';
import { fonts } from '@/theme/fonts';
import { ChatListItemView } from '../types';

interface ChatListItemProps {
  item: ChatListItemView;
  currentUserId: string;
  isCustomer: boolean;
  onPress: (item: ChatListItemView) => void;
  onLongPress?: (item: ChatListItemView) => void;
  onCameraPress?: (item: ChatListItemView) => void;
  onTogglePin?: (item: ChatListItemView) => void;
  onToggleMute?: (item: ChatListItemView) => void;
  onDeleteChat?: (item: ChatListItemView) => void;
}

export const ChatListItem: React.FC<ChatListItemProps> = React.memo(
  ({
    item,
    currentUserId,
    isCustomer,
    onPress,
    onLongPress,
    onCameraPress,
    onTogglePin,
    onToggleMute,
    onDeleteChat,
  }) => {
    const [actionMenuVisible, setActionMenuVisible] = useState(false);

    // Resolve "Other Person" identity
    const displayName = isCustomer
      ? item.store_name || 'Neighborhood Store'
      : item.customer_name || 'Customer';

    const avatarUrl = isCustomer ? item.store_logo : item.customer_image;
    const lastSeen = isCustomer ? item.vendor_last_seen : item.customer_last_seen;

    // Check online status (< 3 min)
    const isOnline = (() => {
      if (!lastSeen) return false;
      const diffMins = Math.floor(
        (Date.now() - new Date(lastSeen).getTime()) / 60000
      );
      return diffMins < 3;
    })();

    // Format Instagram style relative time snippet (e.g. "now", "3h", "2d")
    const formatTimestamp = (iso: string) => {
      const d = new Date(iso).getTime();
      const now = Date.now();
      const diffMins = Math.floor((now - d) / 60000);

      if (diffMins < 1) return 'now';
      if (diffMins < 60) return `${diffMins}m`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) return `${diffDays}d`;
      return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    const handleItemLongPress = () => {
      setActionMenuVisible(true);
      onLongPress?.(item);
    };

    return (
      <>
        <TouchableOpacity
          style={[styles.container, item.is_pinned && styles.pinnedBg]}
          onPress={() => onPress(item)}
          onLongPress={handleItemLongPress}
          activeOpacity={0.7}
        >
          {/* Avatar with Green Online Dot */}
          <View style={styles.avatarWrap}>
            {avatarUrl ? (
              <FastImage
                source={{
                  uri: avatarUrl,
                  priority: FastImage.priority.normal,
                  cache: FastImage.cacheControl.immutable,
                }}
                style={styles.avatar}
                resizeMode={FastImage.resizeMode.cover}
              />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarFallbackText}>
                  {displayName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            {isOnline && <View style={styles.onlineDot} />}
          </View>

          {/* Content Column */}
          <View style={styles.contentCol}>
            <View style={styles.nameRow}>
              {item.is_pinned && (
                <Pin size={12} strokeWidth={1} color="#0095F6" style={{ marginRight: 4 }} />
              )}
              <Text
                style={[
                  styles.displayName,
                  item.unread_count > 0 && styles.displayNameUnread,
                ]}
                numberOfLines={1}
              >
                {displayName}
              </Text>
            </View>

            <View style={styles.snippetRow}>
              <Text
                style={[
                  styles.lastMessage,
                  item.unread_count > 0 && styles.lastMessageUnread,
                ]}
                numberOfLines={1}
              >
                {item.last_message || 'Active recently'}
              </Text>
              <Text style={styles.bulletSeparator}>•</Text>
              <Text
                style={[
                  styles.timeText,
                  item.unread_count > 0 && styles.timeTextUnread,
                ]}
              >
                {formatTimestamp(item.updated_at)}
              </Text>
            </View>
          </View>

          {/* Right Side: Unread dot + Camera Button (Screen 3 in Image!) */}
          <View style={styles.rightActionsRow}>
            {item.unread_count > 0 && <View style={styles.unreadBlueDot} />}

            {item.is_muted && (
              <VolumeX size={16} strokeWidth={1} color="#8E8E93" style={{ marginRight: 4 }} />
            )}

            <TouchableOpacity
              style={styles.cameraIconBtn}
              onPress={() => onCameraPress?.(item)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityLabel="Open camera for contact"
            >
              <Camera size={22} strokeWidth={1} color="#737373" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        {/* Long Press Action Popup Menu: Pin, Mute, Delete (Screen 3 in Image!) */}
        <Modal
          visible={actionMenuVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setActionMenuVisible(false)}
        >
          <Pressable
            style={styles.actionModalOverlay}
            onPress={() => setActionMenuVisible(false)}
          >
            <View style={styles.actionModalContent}>
              <View style={styles.actionMenuCard}>
                {/* Pin / PinOff button */}
                <TouchableOpacity
                  style={styles.actionMenuBtn}
                  onPress={() => {
                    setActionMenuVisible(false);
                    onTogglePin?.(item);
                  }}
                >
                  {item.is_pinned ? (
                    <PinOff size={18} strokeWidth={1} color="#262626" />
                  ) : (
                    <Pin size={18} strokeWidth={1} color="#262626" />
                  )}
                  <Text style={styles.actionMenuBtnText}>
                    {item.is_pinned ? 'Unpin' : 'Pin'}
                  </Text>
                </TouchableOpacity>

                {/* Mute / Unmute button */}
                <TouchableOpacity
                  style={[styles.actionMenuBtn, styles.actionMenuBtnMiddle]}
                  onPress={() => {
                    setActionMenuVisible(false);
                    onToggleMute?.(item);
                  }}
                >
                  {item.is_muted ? (
                    <Volume2 size={18} strokeWidth={1} color="#262626" />
                  ) : (
                    <VolumeX size={18} strokeWidth={1} color="#262626" />
                  )}
                  <Text style={styles.actionMenuBtnText}>
                    {item.is_muted ? 'Unmute' : 'Mute'}
                  </Text>
                </TouchableOpacity>

                {/* Delete button (Red) */}
                <TouchableOpacity
                  style={[styles.actionMenuBtn, styles.actionMenuBtnDelete]}
                  onPress={() => {
                    setActionMenuVisible(false);
                    onDeleteChat?.(item);
                  }}
                >
                  <Trash2 size={18} strokeWidth={1} color="#FFFFFF" />
                  <Text style={styles.actionMenuDeleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Pressable>
        </Modal>
      </>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  pinnedBg: {
    backgroundColor: '#F8FAFF',
  },
  avatarWrap: {
    position: 'relative',
    marginRight: 14,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  avatarFallback: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#EBEBEB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFallbackText: {
    fontSize: 20,
    fontFamily: fonts.raleway.bold,
    color: '#262626',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  contentCol: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  displayName: {
    fontSize: 15,
    fontFamily: fonts.raleway.semiBold,
    color: '#262626',
  },
  displayNameUnread: {
    fontFamily: fonts.raleway.bold,
  },
  snippetRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    fontFamily: fonts.raleway.regular,
    color: '#737373',
    maxWidth: '70%',
  },
  lastMessageUnread: {
    fontFamily: fonts.raleway.bold,
    color: '#262626',
  },
  bulletSeparator: {
    fontSize: 14,
    color: '#8E8E93',
    marginHorizontal: 5,
  },
  timeText: {
    fontSize: 13,
    fontFamily: fonts.raleway.regular,
    color: '#8E8E93',
  },
  timeTextUnread: {
    fontFamily: fonts.raleway.bold,
    color: '#0095F6',
  },
  rightActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  unreadBlueDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0095F6',
  },
  cameraIconBtn: {
    padding: 4,
  },

  /* Action Popup Card (Screen 3 style) */
  actionModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  actionModalContent: {
    width: '100%',
    maxWidth: 320,
  },
  actionMenuCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  actionMenuBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 4,
    backgroundColor: '#F8F9FA',
  },
  actionMenuBtnMiddle: {
    backgroundColor: '#EDEDED',
  },
  actionMenuBtnDelete: {
    backgroundColor: '#ED4956',
  },
  actionMenuBtnText: {
    fontSize: 13,
    fontFamily: fonts.raleway.bold,
    color: '#262626',
  },
  actionMenuDeleteText: {
    fontSize: 13,
    fontFamily: fonts.raleway.bold,
    color: '#FFFFFF',
  },
});
