import { CallType, CallStatus } from '../chat/types';

export interface CallLog {
  id: string;
  channel_name: string;
  caller_id: string;
  receiver_id: string;
  call_type: CallType;
  status: CallStatus;
  duration_seconds: number;
  conversation_id: string | null;
  answered_at: string | null;
  ended_at: string | null;
  ended_by: string | null;
  created_at: string;
}

export type CallUiState =
  | 'idle'
  | 'outgoing_ringing'
  | 'incoming_ringing'
  | 'connecting'
  | 'ongoing'
  | 'ended';

export interface CallParticipant {
  id: string;
  name: string;
  avatar: string | null;
  role: 'customer' | 'vendor';
}

export interface CallSession {
  callLog: CallLog;
  participant: CallParticipant;
  isCaller: boolean;
  isMuted: boolean;
  isSpeakerOn: boolean;
  isVideoEnabled: boolean;
  isFrontCamera: boolean;
  duration: number; // in seconds
}

export interface ICallEngine {
  initialize(channelName: string, uid: string, rtcToken?: string): Promise<void>;
  joinRoom(): Promise<void>;
  leaveRoom(): Promise<void>;
  toggleMicrophone(enabled: boolean): Promise<void>;
  toggleCamera(enabled: boolean): Promise<void>;
  switchCamera(): Promise<void>;
  toggleSpeakerphone(enabled: boolean): Promise<void>;
  destroy(): void;
}
