import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Animated,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';
import {
  Check,
  CheckCheck,
  Phone,
  Video,
  FileText,
  Play,
  Pause,
  Clock,
  AlertCircle,
  Heart,
} from 'lucide-react-native';
import { fonts } from '@/theme/fonts';
import { MessageRow, MessageReaction } from '../types';

interface MessageBubbleProps {
  message: MessageRow;
  currentUserId: string;
  reactions: MessageReaction[];
  replyTargetMessage?: MessageRow | null;
  signedUrl?: string | null;
  isLastInGroup?: boolean;
  onLongPress: (message: MessageRow) => void;
  onPressReplyTarget?: (replyId: string) => void;
  onPressProduct?: (productId: string) => void;
  onPressImage?: (url: string) => void;
  onDoubleTapHeart?: (messageId: string) => void;
}

// Preset realistic voice audio waveform bar heights
const WAVEFORM_BARS = [
  6, 12, 18, 10, 22, 16, 26, 14, 8, 20, 24, 18, 12, 28, 20, 14, 8, 16, 22, 12, 8, 4,
];

export const MessageBubble: React.FC<MessageBubbleProps> = React.memo(
  ({
    message,
    currentUserId,
    reactions,
    replyTargetMessage,
    signedUrl,
    isLastInGroup = true,
    onLongPress,
    onPressReplyTarget,
    onPressProduct,
    onPressImage,
    onDoubleTapHeart,
  }) => {
    const isMe = message.sender_id === currentUserId;
    const isDeleted = message.is_deleted_for_everyone;

    // Voice Note playback simulation state
    const [isPlayingAudio, setIsPlayingAudio] = useState(false);
    const [audioProgress, setAudioProgress] = useState(0); // 0 to 1
    const totalDuration = message.media_duration_seconds || 12;
    const [secondsElapsed, setSecondsElapsed] = useState(0);
    const audioTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Double-tap heart animation state
    const [showHeartPop, setShowHeartPop] = useState(false);
    const heartScale = useRef(new Animated.Value(0)).current;
    const lastTapRef = useRef<number>(0);

    useEffect(() => {
      if (isPlayingAudio) {
        audioTimerRef.current = setInterval(() => {
          setSecondsElapsed((prev) => {
            if (prev >= totalDuration) {
              setIsPlayingAudio(false);
              setAudioProgress(0);
              return 0;
            }
            const next = prev + 1;
            setAudioProgress(next / totalDuration);
            return next;
          });
        }, 1000);
      } else {
        if (audioTimerRef.current) {
          clearInterval(audioTimerRef.current);
          audioTimerRef.current = null;
        }
      }
      return () => {
        if (audioTimerRef.current) clearInterval(audioTimerRef.current);
      };
    }, [isPlayingAudio, totalDuration]);

    const handleToggleAudio = () => {
      if (isPlayingAudio) {
        setIsPlayingAudio(false);
      } else {
        if (secondsElapsed >= totalDuration) {
          setSecondsElapsed(0);
          setAudioProgress(0);
        }
        setIsPlayingAudio(true);
      }
    };

    // Double tap detector for images
    const handleImagePress = () => {
      const now = Date.now();
      if (now - lastTapRef.current < 300) {
        // Double tap!
        setShowHeartPop(true);
        Animated.sequence([
          Animated.spring(heartScale, {
            toValue: 1.3,
            friction: 3,
            useNativeDriver: true,
          }),
          Animated.timing(heartScale, {
            toValue: 0,
            duration: 250,
            delay: 400,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setShowHeartPop(false);
          heartScale.setValue(0);
        });
        onDoubleTapHeart?.(message.id);
      } else {
        if (signedUrl) onPressImage?.(signedUrl);
      }
      lastTapRef.current = now;
    };

    // Time string: e.g. 9:41 AM
    const formattedTime = new Date(message.created_at).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    // Tick indicator for sender
    const renderTick = () => {
      if (!isMe) return null;
      if (message.isOptimistic) {
        return <Clock size={11} color="rgba(255,255,255,0.7)" style={styles.tickIcon} />;
      }
      if (message.isSendingFailed) {
        return <AlertCircle size={11} color="#FF6B6B" style={styles.tickIcon} />;
      }
      if (message.read_at || message.is_read) {
        return <CheckCheck size={13} color="#FFFFFF" style={styles.tickIcon} />;
      }
      if (message.delivered_at) {
        return <CheckCheck size={13} color="rgba(255,255,255,0.7)" style={styles.tickIcon} />;
      }
      return <Check size={13} color="rgba(255,255,255,0.7)" style={styles.tickIcon} />;
    };

    // 1. Call event pill (Centered in chat)
    if (message.message_type === 'call') {
      const callMeta = message.media_meta?.call;
      const isVideo = callMeta?.call_type === 'video';
      const isMissed = callMeta?.status === 'missed' || callMeta?.status === 'declined';

      return (
        <View style={styles.callRowContainer}>
          <View style={styles.callRowPill}>
            {isVideo ? (
              <Video size={14} color={isMissed ? '#ED4956' : '#262626'} />
            ) : (
              <Phone size={14} color={isMissed ? '#ED4956' : '#262626'} />
            )}
            <Text
              style={[
                styles.callRowText,
                isMissed && { color: '#ED4956', fontFamily: fonts.raleway.bold },
              ]}
            >
              {message.text}
            </Text>
            <Text style={styles.callRowTime}>{formattedTime}</Text>
          </View>
        </View>
      );
    }

    // 2. Deleted message pill
    if (isDeleted) {
      return (
        <View style={[styles.wrapper, isMe ? styles.wrapperMe : styles.wrapperOther]}>
          <TouchableOpacity
            style={[styles.bubble, styles.bubbleDeleted]}
            onLongPress={() => onLongPress(message)}
            activeOpacity={0.8}
          >
            <Text style={styles.deletedText}>🚫 This message was deleted</Text>
            <Text style={styles.deletedTime}>{formattedTime}</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Group reactions
    const reactionCounts: Record<string, number> = {};
    reactions.forEach((r) => {
      reactionCounts[r.emoji] = (reactionCounts[r.emoji] || 0) + 1;
    });

    // Content of the message
    const renderBubbleContent = () => (
      <>
        {/* Quoted Reply Quote */}
        {replyTargetMessage && (
          <TouchableOpacity
            style={[
              styles.replyQuoteWrap,
              isMe ? styles.replyQuoteMe : styles.replyQuoteOther,
            ]}
            onPress={() => onPressReplyTarget?.(replyTargetMessage.id)}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.replyQuoteBar,
                { backgroundColor: isMe ? '#FFFFFF' : '#0095F6' },
              ]}
            />
            <View style={styles.replyQuoteContent}>
              <Text
                style={[
                  styles.replyQuoteSender,
                  isMe && { color: '#FFFFFF' },
                ]}
              >
                {replyTargetMessage.sender_id === currentUserId
                  ? 'You replied'
                  : 'Replied to message'}
              </Text>
              <Text
                style={[
                  styles.replyQuoteText,
                  isMe && { color: 'rgba(255,255,255,0.9)' },
                ]}
                numberOfLines={1}
              >
                {replyTargetMessage.text || `[${replyTargetMessage.message_type}]`}
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Media: Image / Photo */}
        {message.message_type === 'image' && (signedUrl || message.media_url) && (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handleImagePress}
            style={styles.imageWrap}
          >
            <FastImage
              source={{
                uri: signedUrl || message.media_url || '',
                priority: FastImage.priority.normal,
                cache: FastImage.cacheControl.immutable,
              }}
              style={styles.mediaImage}
              resizeMode={FastImage.resizeMode.cover}
            />
            {showHeartPop && (
              <Animated.View
                style={[
                  styles.floatingHeartWrap,
                  { transform: [{ scale: heartScale }] },
                ]}
              >
                <Heart size={64} color="#FF3040" fill="#FF3040" />
              </Animated.View>
            )}
          </TouchableOpacity>
        )}

        {/* Media: Voice Note (Instagram audio wave style) */}
        {message.message_type === 'audio' && (
          <View style={styles.voiceNoteWrap}>
            <TouchableOpacity
              onPress={handleToggleAudio}
              style={[
                styles.voicePlayBtn,
                isMe ? styles.voicePlayBtnMe : styles.voicePlayBtnOther,
              ]}
              activeOpacity={0.7}
            >
              {isPlayingAudio ? (
                <Pause
                  size={16}
                  color={isMe ? '#4F46E5' : '#FFFFFF'}
                  fill={isMe ? '#4F46E5' : '#FFFFFF'}
                />
              ) : (
                <Play
                  size={16}
                  color={isMe ? '#4F46E5' : '#FFFFFF'}
                  fill={isMe ? '#4F46E5' : '#FFFFFF'}
                  style={{ marginLeft: 2 }}
                />
              )}
            </TouchableOpacity>

            {/* Waveform bars */}
            <View style={styles.waveformContainer}>
              {WAVEFORM_BARS.map((h, idx) => {
                const barProgress = idx / WAVEFORM_BARS.length;
                const isPassed = isPlayingAudio && audioProgress >= barProgress;
                return (
                  <View
                    key={idx}
                    style={[
                      styles.waveformBar,
                      { height: h },
                      isMe
                        ? isPassed
                          ? styles.waveformBarMePassed
                          : styles.waveformBarMeRemaining
                        : isPassed
                        ? styles.waveformBarOtherPassed
                        : styles.waveformBarOtherRemaining,
                    ]}
                  />
                );
              })}
            </View>

            {/* Time countdown/duration */}
            <Text
              style={[
                styles.voiceDurationText,
                isMe ? styles.voiceDurationTextMe : styles.voiceDurationTextOther,
              ]}
            >
              0:
              {String(
                isPlayingAudio
                  ? Math.max(0, totalDuration - secondsElapsed)
                  : totalDuration
              ).padStart(2, '0')}
            </Text>
          </View>
        )}

        {/* Media: Document File */}
        {message.message_type === 'file' && (
          <View style={styles.fileCard}>
            <FileText size={22} color={isMe ? '#FFFFFF' : '#0095F6'} />
            <View style={styles.fileMeta}>
              <Text
                style={[styles.fileName, isMe && { color: '#FFFFFF' }]}
                numberOfLines={1}
              >
                {message.media_meta?.fileName || 'Document.pdf'}
              </Text>
              <Text
                style={[styles.fileSize, isMe && { color: 'rgba(255,255,255,0.8)' }]}
              >
                {message.media_meta?.fileSize
                  ? `${(message.media_meta.fileSize / 1024).toFixed(1)} KB`
                  : 'Document'}
              </Text>
            </View>
          </View>
        )}

        {/* Product Inquired Card */}
        {message.message_type === 'product' && message.product_id && (
          <TouchableOpacity
            style={styles.productBubbleCard}
            onPress={() => onPressProduct?.(message.product_id!)}
            activeOpacity={0.8}
          >
            <Text style={styles.productCardTitle}>📦 Product Inquired</Text>
            <Text style={styles.productCardSub}>Tap to open item details</Text>
          </TouchableOpacity>
        )}

        {/* Text Message Content */}
        {Boolean(message.text) && (
          <Text
            style={[
              styles.messageText,
              isMe ? styles.messageTextMe : styles.messageTextOther,
            ]}
          >
            {message.text}
          </Text>
        )}

        {/* Footer info: Edited indicator & Time */}
        <View style={styles.metaRow}>
          {message.edited_at && (
            <Text
              style={[
                styles.editedLabel,
                isMe ? styles.editedLabelMe : styles.editedLabelOther,
              ]}
            >
              Edited{' '}
            </Text>
          )}
          <Text
            style={[
              styles.timeText,
              isMe ? styles.timeTextMe : styles.timeTextOther,
            ]}
          >
            {formattedTime}
          </Text>
          {renderTick()}
        </View>
      </>
    );

    return (
      <View style={[styles.wrapper, isMe ? styles.wrapperMe : styles.wrapperOther]}>
        <TouchableOpacity
          onLongPress={() => onLongPress(message)}
          activeOpacity={0.92}
          style={styles.touchableBubble}
        >
          {isMe ? (
            /* Instagram signature purple-indigo gradient for sent bubbles */
            <LinearGradient
              colors={['#8A2BE2', '#5A4FCF', '#3B82F6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.bubble, styles.bubbleMe]}
            >
              {renderBubbleContent()}
            </LinearGradient>
          ) : (
            /* Instagram clean soft grey for received bubbles */
            <View style={[styles.bubble, styles.bubbleOther]}>
              {renderBubbleContent()}
            </View>
          )}
        </TouchableOpacity>

        {/* Instagram Seen status indicator */}
        {isMe && isLastInGroup && message.is_read && (
          <Text style={styles.seenReceiptText}>Seen</Text>
        )}

        {/* Floating Reaction Badges Pill */}
        {Object.keys(reactionCounts).length > 0 && (
          <View
            style={[
              styles.reactionsPill,
              isMe ? styles.reactionsPillMe : styles.reactionsPillOther,
            ]}
          >
            {Object.entries(reactionCounts).map(([emoji, count]) => (
              <View key={emoji} style={styles.reactionItem}>
                <Text style={styles.reactionEmoji}>{emoji}</Text>
                {count > 1 && <Text style={styles.reactionCount}>{count}</Text>}
              </View>
            ))}
          </View>
        )}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 2.5,
    paddingHorizontal: 14,
    position: 'relative',
  },
  wrapperMe: {
    alignItems: 'flex-end',
  },
  wrapperOther: {
    alignItems: 'flex-start',
  },
  touchableBubble: {
    maxWidth: '82%',
  },
  bubble: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  bubbleMe: {
    borderBottomRightRadius: 5,
  },
  bubbleOther: {
    backgroundColor: '#EFEFEF',
    borderBottomLeftRadius: 5,
  },
  bubbleDeleted: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  deletedText: {
    fontSize: 13,
    fontFamily: fonts.raleway.regular,
    fontStyle: 'italic',
    color: '#8E8E93',
  },
  deletedTime: {
    fontSize: 10,
    fontFamily: fonts.raleway.regular,
    color: '#A0A0A0',
    alignSelf: 'flex-end',
    marginTop: 2,
  },
  messageText: {
    fontSize: 15,
    fontFamily: fonts.raleway.regular,
    lineHeight: 20,
  },
  messageTextMe: {
    color: '#FFFFFF',
  },
  messageTextOther: {
    color: '#000000',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 3,
    alignSelf: 'flex-end',
  },
  editedLabel: {
    fontSize: 10,
    fontFamily: fonts.raleway.regular,
    fontStyle: 'italic',
  },
  editedLabelMe: {
    color: 'rgba(255,255,255,0.7)',
  },
  editedLabelOther: {
    color: '#8E8E93',
  },
  timeText: {
    fontSize: 10,
    fontFamily: fonts.raleway.regular,
  },
  timeTextMe: {
    color: 'rgba(255,255,255,0.85)',
  },
  timeTextOther: {
    color: '#8E8E93',
  },
  tickIcon: {
    marginLeft: 3,
  },
  seenReceiptText: {
    fontSize: 11,
    fontFamily: fonts.raleway.regular,
    color: '#8E8E93',
    marginRight: 6,
    marginTop: 2,
    alignSelf: 'flex-end',
  },
  replyQuoteWrap: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 6,
    marginBottom: 6,
  },
  replyQuoteMe: {
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  replyQuoteOther: {
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  replyQuoteBar: {
    width: 3,
    borderRadius: 2,
    marginRight: 8,
  },
  replyQuoteContent: {
    flex: 1,
  },
  replyQuoteSender: {
    fontSize: 11,
    fontFamily: fonts.raleway.bold,
    color: '#0095F6',
  },
  replyQuoteText: {
    fontSize: 12,
    fontFamily: fonts.raleway.regular,
    color: '#262626',
    marginTop: 1,
  },
  imageWrap: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 4,
    position: 'relative',
  },
  mediaImage: {
    width: 230,
    height: 230,
    borderRadius: 16,
  },
  floatingHeartWrap: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -32,
    marginLeft: -32,
  },
  voiceNoteWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    minWidth: 200,
    gap: 10,
  },
  voicePlayBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voicePlayBtnMe: {
    backgroundColor: '#FFFFFF',
  },
  voicePlayBtnOther: {
    backgroundColor: '#0095F6',
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2.5,
    flex: 1,
    height: 32,
  },
  waveformBar: {
    width: 2.5,
    borderRadius: 1.5,
  },
  waveformBarMePassed: {
    backgroundColor: '#FFFFFF',
  },
  waveformBarMeRemaining: {
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  waveformBarOtherPassed: {
    backgroundColor: '#0095F6',
  },
  waveformBarOtherRemaining: {
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  voiceDurationText: {
    fontSize: 12,
    fontFamily: fonts.raleway.semiBold,
  },
  voiceDurationTextMe: {
    color: '#FFFFFF',
  },
  voiceDurationTextOther: {
    color: '#262626',
  },
  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  fileMeta: {
    flex: 1,
  },
  fileName: {
    fontSize: 13,
    fontFamily: fonts.raleway.bold,
    color: '#262626',
  },
  fileSize: {
    fontSize: 10,
    fontFamily: fonts.raleway.regular,
    color: '#8E8E93',
  },
  productBubbleCard: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    padding: 8,
    borderRadius: 10,
    marginBottom: 4,
  },
  productCardTitle: {
    fontSize: 12,
    fontFamily: fonts.raleway.bold,
    color: '#FFFFFF',
  },
  productCardSub: {
    fontSize: 10,
    fontFamily: fonts.raleway.regular,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 1,
  },
  callRowContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  callRowPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 5,
    gap: 6,
  },
  callRowText: {
    fontSize: 12,
    fontFamily: fonts.raleway.medium,
    color: '#262626',
  },
  callRowTime: {
    fontSize: 10,
    fontFamily: fonts.raleway.regular,
    color: '#8E8E93',
    marginLeft: 4,
  },
  reactionsPill: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: -9,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 3,
  },
  reactionsPillMe: {
    alignSelf: 'flex-end',
    marginRight: 8,
  },
  reactionsPillOther: {
    alignSelf: 'flex-start',
    marginLeft: 8,
  },
  reactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 2,
  },
  reactionEmoji: {
    fontSize: 13,
  },
  reactionCount: {
    fontSize: 10,
    fontFamily: fonts.raleway.bold,
    color: '#707070',
    marginLeft: 2,
  },
});
