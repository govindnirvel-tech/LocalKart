import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { CallLog, CallUiState, CallParticipant } from '../types';
import { callApi } from '../services/callApi';
import { defaultCallEngine } from '../services/CallEngine';

export interface CallSliceState {
  currentCall: CallLog | null;
  uiState: CallUiState;
  participant: CallParticipant | null;
  isCaller: boolean;
  isMuted: boolean;
  isSpeakerOn: boolean;
  isVideoEnabled: boolean;
  isFrontCamera: boolean;
  durationSeconds: number;
  error: string | null;
}

const initialState: CallSliceState = {
  currentCall: null,
  uiState: 'idle',
  participant: null,
  isCaller: false,
  isMuted: false,
  isSpeakerOn: false,
  isVideoEnabled: true,
  isFrontCamera: true,
  durationSeconds: 0,
  error: null,
};

// Async Thunks
export const startCallThunk = createAsyncThunk(
  'call/startCall',
  async (
    {
      receiverId,
      callType,
      participant,
    }: {
      receiverId: string;
      callType: 'audio' | 'video';
      participant: CallParticipant;
    },
    { rejectWithValue }
  ) => {
    const res = await callApi.startCall(receiverId, callType);
    if (res.error) return rejectWithValue(res.error);
    return { callLog: res.data!, participant };
  }
);

export const answerCallThunk = createAsyncThunk(
  'call/answerCall',
  async (callId: string, { rejectWithValue }) => {
    const res = await callApi.answerCall(callId);
    if (res.error) return rejectWithValue(res.error);
    return res.data!;
  }
);

export const declineCallThunk = createAsyncThunk(
  'call/declineCall',
  async (callId: string, { rejectWithValue }) => {
    const res = await callApi.declineCall(callId);
    if (res.error) return rejectWithValue(res.error);
    return res.data!;
  }
);

export const cancelCallThunk = createAsyncThunk(
  'call/cancelCall',
  async (callId: string, { rejectWithValue }) => {
    const res = await callApi.cancelCall(callId);
    if (res.error) return rejectWithValue(res.error);
    return res.data!;
  }
);

export const expireCallThunk = createAsyncThunk(
  'call/expireCall',
  async (callId: string, { rejectWithValue }) => {
    const res = await callApi.expireCall(callId);
    if (res.error) return rejectWithValue(res.error);
    return res.data!;
  }
);

export const endCallThunk = createAsyncThunk(
  'call/endCall',
  async (callId: string, { rejectWithValue }) => {
    const res = await callApi.endCall(callId);
    if (res.error) return rejectWithValue(res.error);
    return res.data!;
  }
);

export const callSlice = createSlice({
  name: 'call',
  initialState,
  reducers: {
    setIncomingCall: (
      state,
      action: PayloadAction<{ callLog: CallLog; participant: CallParticipant }>
    ) => {
      state.currentCall = action.payload.callLog;
      state.participant = action.payload.participant;
      state.isCaller = false;
      state.uiState = 'incoming_ringing';
      state.durationSeconds = 0;
      state.error = null;
    },
    updateCallStatus: (state, action: PayloadAction<CallLog>) => {
      const updated = action.payload;
      state.currentCall = updated;

      if (updated.status === 'ongoing') {
        state.uiState = 'ongoing';
      } else if (
        ['completed', 'missed', 'declined', 'cancelled'].includes(updated.status)
      ) {
        state.uiState = 'ended';
      }
    },
    incrementDuration: (state) => {
      if (state.uiState === 'ongoing') {
        state.durationSeconds += 1;
      }
    },
    toggleMic: (state) => {
      state.isMuted = !state.isMuted;
      defaultCallEngine.toggleMicrophone(!state.isMuted);
    },
    toggleSpeaker: (state) => {
      state.isSpeakerOn = !state.isSpeakerOn;
      defaultCallEngine.toggleSpeakerphone(state.isSpeakerOn);
    },
    toggleVideo: (state) => {
      state.isVideoEnabled = !state.isVideoEnabled;
      defaultCallEngine.toggleCamera(state.isVideoEnabled);
    },
    switchCamera: (state) => {
      state.isFrontCamera = !state.isFrontCamera;
      defaultCallEngine.switchCamera();
    },
    resetCallState: (state) => {
      state.currentCall = null;
      state.uiState = 'idle';
      state.participant = null;
      state.isCaller = false;
      state.isMuted = false;
      state.isSpeakerOn = false;
      state.isVideoEnabled = true;
      state.isFrontCamera = true;
      state.durationSeconds = 0;
      state.error = null;
      defaultCallEngine.leaveRoom();
    },
  },
  extraReducers: (builder) => {
    // Start Call
    builder.addCase(startCallThunk.pending, (state) => {
      state.uiState = 'connecting';
      state.error = null;
    });
    builder.addCase(startCallThunk.fulfilled, (state, action) => {
      state.currentCall = action.payload.callLog;
      state.participant = action.payload.participant;
      state.isCaller = true;
      state.uiState = 'outgoing_ringing';
      defaultCallEngine.initialize(action.payload.callLog.channel_name, action.payload.callLog.caller_id);
    });
    builder.addCase(startCallThunk.rejected, (state, action) => {
      state.uiState = 'idle';
      state.error = action.payload as string;
    });

    // Answer Call
    builder.addCase(answerCallThunk.fulfilled, (state, action) => {
      state.currentCall = action.payload;
      state.uiState = 'ongoing';
      defaultCallEngine.initialize(action.payload.channel_name, action.payload.receiver_id);
      defaultCallEngine.joinRoom();
    });
    builder.addCase(answerCallThunk.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    // Decline Call
    builder.addCase(declineCallThunk.fulfilled, (state) => {
      state.uiState = 'ended';
    });

    // Cancel Call
    builder.addCase(cancelCallThunk.fulfilled, (state) => {
      state.uiState = 'ended';
    });

    // Expire Call
    builder.addCase(expireCallThunk.fulfilled, (state) => {
      state.uiState = 'ended';
    });

    // End Call
    builder.addCase(endCallThunk.fulfilled, (state) => {
      state.uiState = 'ended';
    });
  },
});

export const {
  setIncomingCall,
  updateCallStatus,
  incrementDuration,
  toggleMic,
  toggleSpeaker,
  toggleVideo,
  switchCamera,
  resetCallState,
} = callSlice.actions;

export default callSlice.reducer;
