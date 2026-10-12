import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Video,
  Camera,
  CameraOff,
  SwitchCamera,
  Phone,
  PhoneOff,
} from 'lucide-react-native';
import { RootState, AppDispatch } from '@/store';
import { fonts } from '@/theme/fonts';
import {
  endCallThunk,
  cancelCallThunk,
  toggleMic,
  toggleSpeaker,
  toggleVideo,
  switchCamera,
  resetCallState,
} from '../store/callSlice';

export const ActiveCallScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();

  const callState = useSelector((state: RootState) => (state as any).call);
  const {
    currentCall,
    uiState,
    participant,
    isCaller,
    isMuted,
    isSpeakerOn,
    isVideoEnabled,
    isFrontCamera,
    durationSeconds,
  } = callState;

  // Auto-close when call ends
  useEffect(() => {
    if (uiState === 'ended' || !currentCall) {
      const timer = setTimeout(() => {
        dispatch(resetCallState());
        if (navigation.canGoBack()) {
          navigation.goBack();
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [uiState, currentCall, navigation, dispatch]);

  const isVideo = currentCall?.call_type === 'video';
  const name = participant?.name || 'LocalKart User';
  const avatar = participant?.avatar;

  // Format call duration: e.g. 02:45
  const formatDuration = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const getStatusText = () => {
    if (uiState === 'connecting') return 'Connecting...';
    if (uiState === 'outgoing_ringing') return 'Ringing...';
    if (uiState === 'ongoing') return formatDuration(durationSeconds);
    if (uiState === 'ended') return 'Call Ended';
    return '';
  };

  const handleEndCall = () => {
    if (!currentCall) return;
    if (uiState === 'outgoing_ringing' && isCaller) {
      dispatch(cancelCallThunk(currentCall.id));
    } else {
      dispatch(endCallThunk(currentCall.id));
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" />

      {/* Top Participant Meta */}
      <View style={styles.topMeta}>
        <Text style={styles.participantName} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.callStatus}>{getStatusText()}</Text>
      </View>

      {/* Center Display: Video feeds or Audio Avatar */}
      <View style={styles.centerArea}>
        {isVideo && isVideoEnabled ? (
          <View style={styles.videoStage}>
            {/* Remote Video Stream Canvas Placeholder */}
            <View style={styles.remoteVideoBox}>
              <Text style={styles.remoteVideoPlaceholderText}>
                Remote Video Feed
              </Text>
            </View>

            {/* Picture-in-Picture Local Camera View */}
            <View style={styles.pipLocalVideoBox}>
              <Text style={styles.pipLocalText}>
                {isFrontCamera ? 'Front Cam' : 'Back Cam'}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.audioStage}>
            <View style={styles.avatarWrap}>
              {avatar ? (
                <Image source={{ uri: avatar }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarFallbackText}>
                    {name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
      </View>

      {/* Bottom Control Actions */}
      <View style={styles.controlBar}>
        {/* Toggle Mic */}
        <TouchableOpacity
          style={[styles.controlBtn, isMuted && styles.controlBtnActive]}
          onPress={() => dispatch(toggleMic())}
          accessibilityLabel="Toggle microphone"
        >
          {isMuted ? (
            <MicOff size={22} strokeWidth={1} color="#FFFFFF" />
          ) : (
            <Mic size={22} strokeWidth={1} color="#FFFFFF" />
          )}
        </TouchableOpacity>

        {/* Toggle Speaker */}
        <TouchableOpacity
          style={[styles.controlBtn, isSpeakerOn && styles.controlBtnActive]}
          onPress={() => dispatch(toggleSpeaker())}
          accessibilityLabel="Toggle speakerphone"
        >
          {isSpeakerOn ? (
            <Volume2 size={24} strokeWidth={1} color="#FFFFFF" />
          ) : (
            <VolumeX size={24} strokeWidth={1} color="#FFFFFF" />
          )}
        </TouchableOpacity>

        {/* Video Mode Only Controls */}
        {isVideo && (
          <>
            {/* Toggle Camera On/Off */}
            <TouchableOpacity
              style={[styles.controlBtn, !isVideoEnabled && styles.controlBtnActive]}
              onPress={() => dispatch(toggleVideo())}
              accessibilityLabel="Toggle camera"
            >
              {isVideoEnabled ? (
                <Camera size={24} strokeWidth={1} color="#FFFFFF" />
              ) : (
                <CameraOff size={24} strokeWidth={1} color="#FFFFFF" />
              )}
            </TouchableOpacity>

            {/* Switch Camera (Front / Back) */}
            <TouchableOpacity
              style={styles.controlBtn}
              onPress={() => dispatch(switchCamera())}
              accessibilityLabel="Flip camera"
            >
              <SwitchCamera size={22} strokeWidth={1} color="#FFFFFF" />
            </TouchableOpacity>
          </>
        )}

        {/* End Call Button (Red) */}
        <TouchableOpacity
          style={styles.endCallBtn}
          onPress={handleEndCall}
          accessibilityLabel="End Call"
        >
          <PhoneOff size={26} strokeWidth={1} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E17',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  topMeta: {
    alignItems: 'center',
    paddingTop: 12,
  },
  participantName: {
    fontSize: 22,
    fontFamily: fonts.raleway.bold,
    color: '#FFFFFF',
    marginBottom: 6,
  },
  callStatus: {
    fontSize: 14,
    fontFamily: fonts.raleway.semiBold,
    color: '#17BE5A',
  },
  centerArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioStage: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarWrap: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarFallback: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#004BFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFallbackText: {
    fontSize: 48,
    fontFamily: fonts.raleway.bold,
    color: '#FFFFFF',
  },
  videoStage: {
    width: '100%',
    height: '100%',
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
  },
  remoteVideoBox: {
    flex: 1,
    backgroundColor: '#161D2B',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  remoteVideoPlaceholderText: {
    fontSize: 14,
    fontFamily: fonts.raleway.medium,
    color: '#8D8D8D',
  },
  pipLocalVideoBox: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 100,
    height: 140,
    borderRadius: 12,
    backgroundColor: '#2A344A',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pipLocalText: {
    fontSize: 11,
    fontFamily: fonts.raleway.bold,
    color: '#FFFFFF',
  },
  controlBar: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 36,
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  controlBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlBtnActive: {
    backgroundColor: '#F63C3C',
  },
  endCallBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#F63C3C',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
});
