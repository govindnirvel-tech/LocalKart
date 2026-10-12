import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  Pressable,
  Alert,
} from 'react-native';
import {
  Reply,
  Copy,
  Edit3,
  Trash2,
  Trash,
  X,
} from 'lucide-react-native';
import { fonts } from '@/theme/fonts';
import { MessageRow } from '../types';

interface MessageActionSheetProps {
  visible: boolean;
  message: MessageRow | null;
  currentUserId: string;
  onClose: () => void;
  onReply: (message: MessageRow) => void;
  onReact: (messageId: string, emoji: string) => void;
  onCopy: (text: string) => void;
  onEdit: (message: MessageRow) => void;
  onDeleteForMe: (messageId: string) => void;
  onDeleteForEveryone: (messageId: string) => void;
}

const QUICK_EMOJIS = ['❤️', '👍', '😂', '😮', '😢', '🙏', '🔥'];

export const MessageActionSheet: React.FC<MessageActionSheetProps> = ({
  visible,
  message,
  currentUserId,
  onClose,
  onReply,
  onReact,
  onCopy,
  onEdit,
  onDeleteForMe,
  onDeleteForEveryone,
}) => {
  if (!message) return null;

  const isMyMessage = message.sender_id === currentUserId;
  const isDeleted = message.is_deleted_for_everyone;

  // Edit condition: own message, text type, not deleted, within 15 minutes
  const isEditable = (() => {
    if (!isMyMessage || message.message_type !== 'text' || isDeleted) return false;
    const diffMs = Date.now() - new Date(message.created_at).getTime();
    return diffMs <= 15 * 60 * 1000;
  })();

  const handleDeleteForEveryoneConfirm = () => {
    Alert.alert(
      'Delete for Everyone?',
      'Are you sure you want to unsend and delete this message for everyone in this chat?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete for Everyone',
          style: 'destructive',
          onPress: () => {
            onClose();
            onDeleteForEveryone(message.id);
          },
        },
      ]
    );
  };

  const handleDeleteForMeConfirm = () => {
    Alert.alert(
      'Delete for You?',
      'This message will be removed from your device only.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete for Me',
          style: 'destructive',
          onPress: () => {
            onClose();
            onDeleteForMe(message.id);
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.sheetBox}>
          {/* Reaction Bar (Instagram quick floating reactions) */}
          {!isDeleted && (
            <View style={styles.reactionBar}>
              {QUICK_EMOJIS.map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  style={styles.emojiBtn}
                  onPress={() => {
                    onClose();
                    onReact(message.id, emoji);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.emojiText}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Action List */}
          <View style={styles.actionList}>
            {/* Reply */}
            {!isDeleted && (
              <TouchableOpacity
                style={styles.actionItem}
                onPress={() => {
                  onClose();
                  onReply(message);
                }}
                activeOpacity={0.7}
              >
                <Reply size={20} color="#262626" />
                <Text style={styles.actionLabel}>Reply</Text>
              </TouchableOpacity>
            )}

            {/* Copy */}
            {!isDeleted && Boolean(message.text) && (
              <TouchableOpacity
                style={styles.actionItem}
                onPress={() => {
                  onClose();
                  onCopy(message.text);
                }}
                activeOpacity={0.7}
              >
                <Copy size={20} color="#262626" />
                <Text style={styles.actionLabel}>Copy Text</Text>
              </TouchableOpacity>
            )}

            {/* Edit (Screen 1 trigger) */}
            {isEditable && (
              <TouchableOpacity
                style={styles.actionItem}
                onPress={() => {
                  onClose();
                  onEdit(message);
                }}
                activeOpacity={0.7}
              >
                <Edit3 size={20} color="#0095F6" />
                <Text style={[styles.actionLabel, { color: '#0095F6' }]}>
                  Edit Message
                </Text>
              </TouchableOpacity>
            )}

            {/* Delete for Me */}
            <TouchableOpacity
              style={styles.actionItem}
              onPress={handleDeleteForMeConfirm}
              activeOpacity={0.7}
            >
              <Trash size={20} color="#ED4956" />
              <Text style={[styles.actionLabel, { color: '#ED4956' }]}>
                Delete for Me
              </Text>
            </TouchableOpacity>

            {/* Delete for Everyone */}
            {isMyMessage && !isDeleted && (
              <TouchableOpacity
                style={[styles.actionItem, styles.actionItemLast]}
                onPress={handleDeleteForEveryoneConfirm}
                activeOpacity={0.7}
              >
                <Trash2 size={20} color="#ED4956" />
                <Text style={[styles.actionLabel, { color: '#ED4956' }]}>
                  Delete for Everyone
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  sheetBox: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    paddingBottom: 32,
    paddingHorizontal: 16,
  },
  reactionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F3F4F6',
    borderRadius: 30,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 16,
  },
  emojiBtn: {
    padding: 6,
    borderRadius: 20,
  },
  emojiText: {
    fontSize: 24,
  },
  actionList: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    overflow: 'hidden',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  actionItemLast: {
    borderBottomWidth: 0,
  },
  actionLabel: {
    fontSize: 15,
    fontFamily: fonts.raleway.semiBold,
    color: '#262626',
  },
});
