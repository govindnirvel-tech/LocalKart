import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Phone, PhoneOff, Video } from 'lucide-react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { fonts } from '@/theme/fonts';
import { answerCallThunk, declineCallThunk } from '../store/callSlice';

export const IncomingCallModal: React.FC = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();
  const callState = useSelector((state: RootState) => (state as any).call);
  const { currentCall, uiState, participant } = callState;

  if (uiState !== 'incoming_ringing' || !currentCall) {
    return null;
  }

  const isVideo = currentCall.call_type === 'video';
  const callerName = participant?.name || 'LocalKart User';
  const callerAvatar = participant?.avatar;

  const handleAccept = () => {
    dispatch(answerCallThunk(currentCall.id));
    navigation.navigate('ActiveCall');
  };

  const handleDecline = () => {
    dispatch(declineCallThunk(currentCall.id));
  };

  return (
    <Modal visible={true} transparent={false} animationType="slide">
      <View style={styles.container}>
        {/* Header Tag */}
        <View style={styles.topHeader}>
          <View style={styles.callTypeBadge}>
            {isVideo ? (
              <Video size={16} strokeWidth={1} color="#FFFFFF" />
            ) : (
              <Phone size={16} strokeWidth={1} color="#FFFFFF" />
            )}
            <Text style={styles.callTypeBadgeText}>
              {isVideo ? 'INCOMING VIDEO CALL' : 'INCOMING AUDIO CALL'}
            </Text>
          </View>
        </View>

        {/* Center Caller Profile */}
        <View style={styles.centerProfile}>
          <View style={styles.avatarPulsingWrap}>
            <View style={styles.avatarRingOuter} />
            <View style={styles.avatarRingInner} />
            {callerAvatar ? (
              <Image source={{ uri: callerAvatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarFallbackText}>
                  {callerName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.callerName}>{callerName}</Text>
          <Text style={styles.ringingStatus}>Ringing...</Text>
        </View>

        {/* Bottom Actions: Decline & Accept */}
        <View style={styles.bottomActions}>
          {/* Decline */}
          <View style={styles.actionCol}>
            <TouchableOpacity
              style={styles.declineBtn}
              onPress={handleDecline}
              accessibilityLabel="Decline Call"
            >
              <PhoneOff size={28} strokeWidth={1} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.actionLabel}>Decline</Text>
          </View>

          {/* Accept */}
          <View style={styles.actionCol}>
            <TouchableOpacity
              style={styles.acceptBtn}
              onPress={handleAccept}
              accessibilityLabel="Accept Call"
            >
              <Phone size={28} strokeWidth={1} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.actionLabel}>Accept</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0E131F',
    justifyContent: 'space-between',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  topHeader: {
    alignItems: 'center',
  },
  callTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  callTypeBadgeText: {
    fontSize: 12,
    fontFamily: fonts.raleway.bold,
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  centerProfile: {
    alignItems: 'center',
  },
  avatarPulsingWrap: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  avatarRingOuter: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(0, 75, 255, 0.15)',
  },
  avatarRingInner: {
    position: 'absolute',
    width: 116,
    height: 116,
    borderRadius: 58,
    backgroundColor: 'rgba(0, 75, 255, 0.25)',
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  avatarFallback: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#004BFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  avatarFallbackText: {
    fontSize: 34,
    fontFamily: fonts.raleway.bold,
    color: '#FFFFFF',
  },
  callerName: {
    fontSize: 24,
    fontFamily: fonts.raleway.bold,
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  ringingStatus: {
    fontSize: 15,
    fontFamily: fonts.raleway.medium,
    color: '#17BE5A',
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  actionCol: {
    alignItems: 'center',
  },
  declineBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#F63C3C',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    elevation: 4,
  },
  acceptBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#17BE5A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    elevation: 4,
  },
  actionLabel: {
    fontSize: 13,
    fontFamily: fonts.raleway.semiBold,
    color: '#FFFFFF',
  },
});
