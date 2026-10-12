import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  Keyboard,
  Animated,
  Modal,
  Pressable,
} from 'react-native';
import {
  Camera,
  Images,
  Mic,
  Paperclip,
  X,
  Smile,
  Trash2,
  ArrowUp,
  FileText,
} from 'lucide-react-native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { fonts } from '@/theme/fonts';
import { MessageRow } from '../types';

interface MessageComposerProps {
  conversationId: string;
  isBlocked: boolean;
  replyToMessage: MessageRow | null;
  editingMessage: MessageRow | null;
  bottomInset?: number;
  onSendText: (text: string) => void;
  onSendMedia: (
    uri: string,
    fileName: string,
    mimeType: string,
    fileSize?: number
  ) => void;
  onSendVoiceNote: (durationSeconds: number) => void;
  onCancelReply: () => void;
  onCancelEdit: () => void;
  onTyping: () => void;
}

const EMOJI_LIST = [
  '❤️', '🙌', '🔥', '👏', '😢', '😍', '😮', '😂', '👍',
  '🎉', '✨', '🙏', '🛒', '⚡', '💯', '😎', '🥳', '🤤',
];

export const MessageComposer: React.FC<MessageComposerProps> = ({
  isBlocked,
  replyToMessage,
  editingMessage,
  bottomInset = 0,
  onSendText,
  onSendMedia,
  onSendVoiceNote,
  onCancelReply,
  onCancelEdit,
  onTyping,
}) => {
  const [text, setText] = useState('');
  const [editText, setEditText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  // Voice recording state
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceSeconds, setVoiceSeconds] = useState(0);
  const voiceTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Pulse animation for recording dot
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isRecordingVoice) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.3,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecordingVoice, pulseAnim]);

  // Track keyboard visibility
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, () => setIsKeyboardVisible(true));
    const hideSub = Keyboard.addListener(hideEvent, () => setIsKeyboardVisible(false));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Update edit text when editingMessage changes
  useEffect(() => {
    if (editingMessage) {
      setEditText(editingMessage.text);
    } else {
      setEditText('');
    }
  }, [editingMessage]);

  const handleTextChange = (val: string) => {
    setText(val);
    if (val.trim()) {
      onTyping();
    }
  };

  const handleSend = () => {
    if (!text.trim()) return;
    onSendText(text.trim());
    setText('');
    setShowEmojiPicker(false);
  };

  const handleSaveEdit = () => {
    if (!editText.trim()) return;
    onSendText(editText.trim());
    setEditText('');
    onCancelEdit();
  };

  // Attachment document send
  const handleSendDocument = () => {
    setShowAttachmentModal(false);
    onSendMedia(
      'file://local/Invoice_Order.pdf',
      'Invoice_Order.pdf',
      'application/pdf',
      185000
    );
  };

  // Image library picker
  const handlePickImage = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 1,
        quality: 0.8,
      });

      if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        if (asset.uri) {
          onSendMedia(
            asset.uri,
            asset.fileName || `image_${Date.now()}.jpg`,
            asset.type || 'image/jpeg',
            asset.fileSize
          );
        }
      }
    } catch {
      Alert.alert('Error', 'Unable to pick photo from gallery.');
    }
  };

  // Camera capture
  const handleCaptureCamera = async () => {
    try {
      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.8,
        saveToPhotos: false,
      });

      if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        if (asset.uri) {
          onSendMedia(
            asset.uri,
            asset.fileName || `camera_${Date.now()}.jpg`,
            asset.type || 'image/jpeg',
            asset.fileSize
          );
        }
      }
    } catch {
      Alert.alert('Error', 'Camera open nahi ho paya. Permissions check karein.');
    }
  };

  // Voice note recording
  const handleStartVoiceRecording = () => {
    setIsRecordingVoice(true);
    setVoiceSeconds(0);
    voiceTimerRef.current = setInterval(() => {
      setVoiceSeconds((prev) => prev + 1);
    }, 1000);
  };

  const handleCancelVoiceRecording = () => {
    if (voiceTimerRef.current) {
      clearInterval(voiceTimerRef.current);
      voiceTimerRef.current = null;
    }
    setIsRecordingVoice(false);
    setVoiceSeconds(0);
  };

  const handleStopAndSendVoiceRecording = () => {
    if (voiceTimerRef.current) {
      clearInterval(voiceTimerRef.current);
      voiceTimerRef.current = null;
    }
    const finalDuration = Math.max(1, voiceSeconds);
    setIsRecordingVoice(false);
    setVoiceSeconds(0);
    onSendVoiceNote(finalDuration);
  };

  if (isBlocked) {
    return (
      <View style={styles.blockedBanner}>
        <Text style={styles.blockedText}>
          You cannot message this account because they are blocked.
        </Text>
      </View>
    );
  }

  const computedPaddingBottom = isKeyboardVisible
    ? 6
    : Math.max(bottomInset || 0, 12) + 4;

  return (
    <View style={[styles.container, { paddingBottom: computedPaddingBottom }]}>
      {/* 1. Reply Quote Banner */}
      {replyToMessage && (
        <View style={styles.replyBanner}>
          <View style={styles.replyBarAccent} />
          <View style={styles.replyMeta}>
            <Text style={styles.replyTitle}>
              Replying to {replyToMessage.sender_id ? 'message' : 'user'}
            </Text>
            <Text style={styles.replyPreview} numberOfLines={1}>
              {replyToMessage.text || `[${replyToMessage.message_type}]`}
            </Text>
          </View>
          <TouchableOpacity onPress={onCancelReply} style={styles.bannerCloseBtn}>
            <X size={18} color="#8E8E93" />
          </TouchableOpacity>
        </View>
      )}

      {/* 2. Instagram Exact "Edit message" Panel (Matches Screen 1 in Image!) */}
      {editingMessage && (
        <View style={styles.editMessageModalCard}>
          <View style={styles.editHeaderRow}>
            <Text style={styles.editHeaderTitle}>Edit message</Text>
            <TouchableOpacity onPress={onCancelEdit} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <X size={18} color="#8E8E93" />
            </TouchableOpacity>
          </View>
          <View style={styles.editInputRow}>
            <TextInput
              style={styles.editTextInput}
              value={editText}
              onChangeText={setEditText}
              autoFocus
              multiline
              maxLength={4000}
            />
            <TouchableOpacity
              style={styles.doneBtn}
              onPress={handleSaveEdit}
              disabled={!editText.trim()}
            >
              <Text
                style={[
                  styles.doneBtnText,
                  !editText.trim() && { color: '#B0C4DE' },
                ]}
              >
                Done
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* 3. Quick Emoji Row */}
      {showEmojiPicker && !isRecordingVoice && !editingMessage && (
        <View style={styles.emojiPickerContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.emojiScrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {EMOJI_LIST.map((emoji, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.emojiPickerBtn}
                onPress={() => setText((prev) => prev + emoji)}
                activeOpacity={0.6}
              >
                <Text style={styles.emojiPickerText}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* 4. Bottom Composer Row (Instagram Direct Style) */}
      {!editingMessage && (
        <View style={styles.composerRow}>
          {isRecordingVoice ? (
            /* Live Voice Recording Bar */
            <View style={styles.voiceRecordingContainer}>
              <TouchableOpacity
                style={styles.voiceCancelBtn}
                onPress={handleCancelVoiceRecording}
                accessibilityLabel="Cancel recording"
              >
                <Trash2 size={20} color="#ED4956" />
              </TouchableOpacity>

              <View style={styles.voiceTimerWrap}>
                <Animated.View
                  style={[styles.recordingRedDot, { opacity: pulseAnim }]}
                />
                <Text style={styles.recordingTimerText}>
                  0:{String(voiceSeconds).padStart(2, '0')}
                </Text>
                {/* Simulated live audio wave spikes */}
                <View style={styles.voiceMiniWaves}>
                  {[8, 16, 22, 14, 20, 10, 18, 12].map((h, i) => (
                    <View
                      key={i}
                      style={[
                        styles.waveSpike,
                        { height: ((voiceSeconds + i) % 4) * 4 + 6 },
                      ]}
                    />
                  ))}
                </View>
              </View>

              <TouchableOpacity
                style={styles.voiceSendCircleBtn}
                onPress={handleStopAndSendVoiceRecording}
                accessibilityLabel="Send voice note"
              >
                <ArrowUp size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Instagram Circular Blue Camera Button */}
              <TouchableOpacity
                style={styles.cameraCircleBtn}
                onPress={handleCaptureCamera}
                accessibilityLabel="Take Camera Photo"
                activeOpacity={0.8}
              >
                <Camera size={22} strokeWidth={1} color="#FFFFFF" />
              </TouchableOpacity>

              {/* Instagram Input Pill Bar */}
              <View style={styles.inputPill}>
                <TextInput
                  style={styles.input}
                  placeholder="Message..."
                  placeholderTextColor="#8E8E93"
                  value={text}
                  onChangeText={handleTextChange}
                  multiline
                  maxLength={4000}
                />

                {/* Right actions inside the pill */}
                {text.trim() ? (
                  <TouchableOpacity
                    style={styles.sendTextBtn}
                    onPress={handleSend}
                    activeOpacity={0.7}
                    accessibilityLabel="Send Message"
                  >
                    <Text style={styles.sendTextLabel}>Send</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.pillActions}>
                    {/* Voice Mic Icon */}
                    <TouchableOpacity
                      style={styles.pillIconBtn}
                      onPress={handleStartVoiceRecording}
                      accessibilityLabel="Record voice message"
                    >
                      <Mic size={22} strokeWidth={1} color="#262626" />
                    </TouchableOpacity>

                    {/* Image Gallery Icon (Images) */}
                    <TouchableOpacity
                      style={styles.pillIconBtn}
                      onPress={handlePickImage}
                      accessibilityLabel="Pick photo"
                    >
                      <Images size={22} strokeWidth={1} color="#262626" />
                    </TouchableOpacity>

                    {/* Attachment Paperclip Icon (Replaces Heart) */}
                    <TouchableOpacity
                      style={styles.pillIconBtn}
                      onPress={() => setShowAttachmentModal(true)}
                      accessibilityLabel="Add attachment"
                    >
                      <Paperclip size={22} strokeWidth={1} color="#262626" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </>
          )}
        </View>
      )}

      {/* Attachment Action Sheet Modal */}
      <Modal
        visible={showAttachmentModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAttachmentModal(false)}
      >
        <Pressable
          style={styles.attachmentModalOverlay}
          onPress={() => setShowAttachmentModal(false)}
        >
          <View style={styles.attachmentSheet}>
            <View style={styles.attachmentHeader}>
              <Text style={styles.attachmentTitle}>Share Content</Text>
              <TouchableOpacity
                onPress={() => setShowAttachmentModal(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <X size={18} strokeWidth={1} color="#8E8E93" />
              </TouchableOpacity>
            </View>

            <View style={styles.attachmentOptionsRow}>
              {/* Document Option */}
              <TouchableOpacity
                style={styles.attachmentOptionBtn}
                onPress={handleSendDocument}
              >
                <View style={[styles.attachmentIconCircle, { backgroundColor: '#5856D6' }]}>
                  <FileText size={24} strokeWidth={1} color="#FFFFFF" />
                </View>
                <Text style={styles.attachmentOptionLabel}>Document</Text>
              </TouchableOpacity>

              {/* Gallery Option */}
              <TouchableOpacity
                style={styles.attachmentOptionBtn}
                onPress={() => {
                  setShowAttachmentModal(false);
                  handlePickImage();
                }}
              >
                <View style={[styles.attachmentIconCircle, { backgroundColor: '#0095F6' }]}>
                  <Images size={24} strokeWidth={1} color="#FFFFFF" />
                </View>
                <Text style={styles.attachmentOptionLabel}>Gallery</Text>
              </TouchableOpacity>

              {/* Camera Option */}
              <TouchableOpacity
                style={styles.attachmentOptionBtn}
                onPress={() => {
                  setShowAttachmentModal(false);
                  handleCaptureCamera();
                }}
              >
                <View style={[styles.attachmentIconCircle, { backgroundColor: '#FF2D55' }]}>
                  <Camera size={24} strokeWidth={1} color="#FFFFFF" />
                </View>
                <Text style={styles.attachmentOptionLabel}>Camera</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 6,
  },
  blockedBanner: {
    backgroundColor: '#FFF0F5',
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  blockedText: {
    fontSize: 12,
    fontFamily: fonts.raleway.medium,
    color: '#ED4956',
    textAlign: 'center',
  },
  replyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    marginHorizontal: 12,
    marginBottom: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  replyBarAccent: {
    width: 3,
    height: '100%',
    backgroundColor: '#0095F6',
    borderRadius: 2,
    marginRight: 8,
  },
  replyMeta: {
    flex: 1,
  },
  replyTitle: {
    fontSize: 11,
    fontFamily: fonts.raleway.bold,
    color: '#0095F6',
  },
  replyPreview: {
    fontSize: 12,
    fontFamily: fonts.raleway.regular,
    color: '#262626',
    marginTop: 1,
  },
  bannerCloseBtn: {
    padding: 4,
  },

  /* Screen 1: Inline "Edit message" panel above keyboard */
  editMessageModalCard: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 10,
    borderRadius: 14,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  editHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  editHeaderTitle: {
    fontSize: 14,
    fontFamily: fonts.raleway.bold,
    color: '#262626',
  },
  editInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  editTextInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.raleway.regular,
    color: '#262626',
    minHeight: 38,
    maxHeight: 100,
    paddingVertical: 6,
  },
  doneBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  doneBtnText: {
    fontSize: 15,
    fontFamily: fonts.raleway.bold,
    color: '#0095F6',
  },

  /* Emoji bar */
  emojiPickerContainer: {
    backgroundColor: '#F8F9FA',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  emojiScrollContent: {
    gap: 8,
    paddingHorizontal: 6,
  },
  emojiPickerBtn: {
    padding: 6,
  },
  emojiPickerText: {
    fontSize: 22,
  },

  /* Main Composer Row */
  composerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 10,
  },

  /* Instagram Blue Circular Camera Button */
  cameraCircleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0095F6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0095F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },

  /* Instagram Input Pill Bar */
  inputPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F2',
    borderRadius: 24,
    paddingHorizontal: 14,
    minHeight: 44,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: fonts.raleway.regular,
    color: '#262626',
    paddingVertical: 8,
    maxHeight: 100,
  },
  pillActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginLeft: 6,
  },
  pillIconBtn: {
    padding: 2,
  },
  sendTextBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  sendTextLabel: {
    fontSize: 15,
    fontFamily: fonts.raleway.bold,
    color: '#0095F6',
  },

  /* Live Voice Recording UI */
  voiceRecordingContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F2',
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 4,
    minHeight: 44,
    gap: 10,
  },
  voiceCancelBtn: {
    padding: 6,
  },
  voiceTimerWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recordingRedDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ED4956',
  },
  recordingTimerText: {
    fontSize: 14,
    fontFamily: fonts.raleway.semiBold,
    color: '#262626',
  },
  voiceMiniWaves: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginLeft: 8,
  },
  waveSpike: {
    width: 2.5,
    borderRadius: 1.5,
    backgroundColor: '#ED4956',
  },
  voiceSendCircleBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#0095F6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Attachment Action Sheet Styles */
  attachmentModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  attachmentSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    paddingBottom: 36,
    paddingHorizontal: 20,
  },
  attachmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  attachmentTitle: {
    fontSize: 16,
    fontFamily: fonts.raleway.bold,
    color: '#262626',
  },
  attachmentOptionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  attachmentOptionBtn: {
    alignItems: 'center',
    gap: 8,
  },
  attachmentIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  attachmentOptionLabel: {
    fontSize: 13,
    fontFamily: fonts.raleway.semiBold,
    color: '#262626',
  },
});
