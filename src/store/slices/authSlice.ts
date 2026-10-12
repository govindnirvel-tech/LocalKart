import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Session, User } from '@supabase/supabase-js';
import { Profile } from '@/types';

export interface AuthState {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  isMaxAttemptsModalVisible: boolean;
}

const initialState: AuthState = {
  session: null,
  user: null,
  profile: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,
  isMaxAttemptsModalVisible: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setSession: (state, action: PayloadAction<Session | null>) => {
      state.session = action.payload;
      state.user = action.payload ? action.payload.user : null;
      state.isAuthenticated = !!action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setProfile: (state, action: PayloadAction<Profile | null>) => {
      state.profile = action.payload;
    },
    setInitialized: (state, action: PayloadAction<boolean>) => {
      state.isInitialized = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    setMaxAttemptsModalVisible: (state, action: PayloadAction<boolean>) => {
      state.isMaxAttemptsModalVisible = action.payload;
    },
    logout: (state) => {
      state.session = null;
      state.user = null;
      state.profile = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
    },
  },
});

export const {
  setSession,
  setProfile,
  setInitialized,
  setLoading,
  setError,
  setMaxAttemptsModalVisible,
  logout,
} = authSlice.actions;

export default authSlice.reducer;
