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
  ChevronLeft,
  Phone,
  Video,
  MoreVertical,
  Pin,
  PinOff,
  VolumeX,
  Volume2,
  Archive,
  Ban,
  Trash2,
} from 'lucide-react-native';
import { fonts } from '@/theme/fonts';

interface ChatHeaderProps {
  title: string;
  avatarUrl: string | null;
  isTyping: boolean;
  lastSeenAt: string | null;
  isPinned: boolean;
  isMuted: boolean;
  isArchived: boolean;
  isBlocked: boolean;
  onBack: () => void;
  onAudioCall: () => void;
  onVideoCall: () => void;
  onTogglePin: () => void;
  onToggleMute: () => void;
  onToggleArchive: () => void;
  onToggleBlock: () => void;
  onClearChat: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  title,
  avatarUrl,
  isTyping,
  lastSeenAt,
  isPinned,
  isMuted,
  isArchived,
  isBlocked,
  onBack,
  onAudioCall,
  onVideoCall,
  onTogglePin,
  onToggleMute,
  onToggleArchive,
  onToggleBlock,
  onClearChat,
}) => {
  const [menuVisible, setMenuVisible] = useState(false);

  // Status subtitle computation
  const getSubtitle = () => {
    if (isBlocked) return 'Blocked';
    if (isTyping) return 'typing...';
    if (!lastSeenAt) return 'offline';

    const lastSeenDate = new Date(lastSeenAt).getTime();
    const diffMins = Math.floor((Date.now() - lastSeenDate) / 60000);

    if (diffMins < 2) {
      return 'online';
    }
    if (diffMins < 60) {
      return `last seen ${diffMins}m ago`;
    }
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) {
      return `last seen ${diffHours}h ago`;
    }
    return `last seen ${new Date(lastSeenAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}`;
  };

  const subtitle = getSubtitle();
  const isOnline = subtitle === 'online' || subtitle === 'typing...';

  return (
    <View style={styles.container}>
      {/* Back button */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={onBack}
        accessibilityLabel="Go back"
      >
        <ChevronLeft size={28} strokeWidth={1} color="#262626" />
      </TouchableOpacity>

      {/* Avatar with live status indicator */}
      <View style={styles.avatarWrap}>
        {avatarUrl ? (
          <FastImage
            source={{
              uri: avatarUrl,
              priority: FastImage.priority.high,
              cache: FastImage.cacheControl.immutable,
            }}
            style={styles.avatar}
            resizeMode={FastImage.resizeMode.cover}
          />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarFallbackText}>
              {title.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        {isOnline && <View style={styles.onlineDot} />}
      </View>

      {/* Name and Presence */}
      <View style={styles.metaCol}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text
          style={[
            styles.subtitle,
            isOnline && styles.subtitleActive,
            isTyping && styles.subtitleTyping,
          ]}
          numberOfLines={1}
        >
          {subtitle}
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={onAudioCall}
          accessibilityLabel="Audio Call"
          disabled={isBlocked}
        >
          <Phone size={22} strokeWidth={1} color={isBlocked ? '#C4C4C4' : '#262626'} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconBtn}
          onPress={onVideoCall}
          accessibilityLabel="Video Call"
          disabled={isBlocked}
        >
          <Video size={23} strokeWidth={1} color={isBlocked ? '#C4C4C4' : '#262626'} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => setMenuVisible(true)}
          accessibilityLabel="More options"
        >
          <MoreVertical size={20} strokeWidth={1} color="#181C1F" />
        </TouchableOpacity>
      </View>

      {/* Dropdown Options Modal */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuBox}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                onTogglePin();
              }}
            >
              {isPinned ? (
                <PinOff size={18} strokeWidth={1} color="#181C1F" />
              ) : (
                <Pin size={18} strokeWidth={1} color="#181C1F" />
              )}
              <Text style={styles.menuText}>
                {isPinned ? 'Unpin Chat' : 'Pin Chat'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                onToggleMute();
              }}
            >
              {isMuted ? (
                <Volume2 size={18} strokeWidth={1} color="#181C1F" />
              ) : (
                <VolumeX size={18} strokeWidth={1} color="#181C1F" />
              )}
              <Text style={styles.menuText}>
                {isMuted ? 'Unmute Notifications' : 'Mute Notifications'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                onToggleArchive();
              }}
            >
              <Archive size={18} color="#181C1F" />
              <Text style={styles.menuText}>
                {isArchived ? 'Unarchive Chat' : 'Archive Chat'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                onClearChat();
              }}
            >
              <Trash2 size={18} color="#F63C3C" />
              <Text style={[styles.menuText, { color: '#F63C3C' }]}>
                Clear Chat
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, styles.menuItemLast]}
              onPress={() => {
                setMenuVisible(false);
                onToggleBlock();
              }}
            >
              <Ban size={18} color="#F63C3C" />
              <Text style={[styles.menuText, { color: '#F63C3C' }]}>
                {isBlocked ? 'Unblock Contact' : 'Block Contact'}
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 64,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  backBtn: {
    padding: 6,
    marginRight: 4,
  },
  avatarWrap: {
    position: 'relative',
    marginRight: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  avatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EBF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFallbackText: {
    fontSize: 16,
    fontFamily: fonts.raleway.bold,
    color: '#004BFF',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: '#17BE5A',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  metaCol: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontFamily: fonts.raleway.bold,
    color: '#181C1F',
  },
  subtitle: {
    fontSize: 12,
    fontFamily: fonts.raleway.regular,
    color: '#707070',
    marginTop: 1,
  },
  subtitleActive: {
    color: '#17BE5A',
    fontFamily: fonts.raleway.semiBold,
  },
  subtitleTyping: {
    color: '#004BFF',
    fontStyle: 'italic',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  iconBtn: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 54,
    paddingRight: 16,
  },
  menuBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: 200,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 14,
    gap: 12,
  },
  menuItemLast: {
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  menuText: {
    fontSize: 13,
    fontFamily: fonts.raleway.medium,
    color: '#181C1F',
  },
});
