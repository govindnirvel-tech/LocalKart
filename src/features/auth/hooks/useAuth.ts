import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks';
import {
  setSession,
  setProfile,
  setInitialized,
  setLoading,
  setError,
  setMaxAttemptsModalVisible,
  logout as logoutAction,
} from '@/store/slices/authSlice';
import authApi, {
  AppAuthError,
  SignInParams,
  SignUpParams,
  VerifyOtpRecoveryParams,
} from '@/features/auth/api/authApi';
import { supabase } from '@/lib/supabase';
import { saveCachedAvatar, saveCachedName, clearCachedAvatar } from '@/utils/userAvatarStorage';

export function useAuth() {
  const dispatch = useAppDispatch();
  const {
    session,
    user,
    profile,
    isAuthenticated,
    isLoading,
    isInitialized,
    error,
    isMaxAttemptsModalVisible,
  } = useAppSelector((state) => state.auth);

  const loadProfile = useCallback(
    async (userId: string) => {
      try {
        const fetchedProfile = await authApi.fetchProfile(userId);
        dispatch(setProfile(fetchedProfile));
        if (fetchedProfile?.image_url) {
          saveCachedAvatar(fetchedProfile.image_url);
        }
        if (fetchedProfile?.full_name) {
          saveCachedName(fetchedProfile.full_name);
        }
        return fetchedProfile;
      } catch {
        // Profile might be in creation by DB trigger, don't crash
        return null;
      }
    },
    [dispatch]
  );

  const signUp = useCallback(
    async (params: SignUpParams) => {
      try {
        dispatch(setLoading(true));
        const result = await authApi.signUp(params);
        if (result.session) {
          dispatch(setSession(result.session));
          if (result.user) {
            await loadProfile(result.user.id);
          }
        }
        dispatch(setLoading(false));
        return result;
      } catch (err: any) {
        dispatch(setLoading(false));
        if (err instanceof AppAuthError) {
          if (err.isRateLimit) {
            dispatch(setMaxAttemptsModalVisible(true));
          }
          dispatch(setError(err.message));
        } else {
          dispatch(setError('An error occurred during sign up. Please try again.'));
        }
        throw err;
      }
    },
    [dispatch, loadProfile]
  );

  const signIn = useCallback(
    async (params: SignInParams) => {
      try {
        dispatch(setLoading(true));
        const result = await authApi.signInWithPassword(params);
        dispatch(setSession(result.session));
        if (result.user) {
          await loadProfile(result.user.id);
        }
        dispatch(setLoading(false));
        return result;
      } catch (err: any) {
        dispatch(setLoading(false));
        if (err instanceof AppAuthError) {
          if (err.isRateLimit) {
            dispatch(setMaxAttemptsModalVisible(true));
          }
          dispatch(setError(err.message));
        } else {
          dispatch(setError('Failed to sign in. Please check your credentials.'));
        }
        throw err;
      }
    },
    [dispatch, loadProfile]
  );

  const signOut = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      await authApi.signOut();
      dispatch(logoutAction());
    } catch {
      dispatch(logoutAction());
    }
  }, [dispatch]);

  const resetPassword = useCallback(
    async (email: string) => {
      try {
        dispatch(setLoading(true));
        await authApi.resetPasswordForEmail(email);
        dispatch(setLoading(false));
      } catch (err: any) {
        dispatch(setLoading(false));
        if (err instanceof AppAuthError) {
          if (err.isRateLimit) {
            dispatch(setMaxAttemptsModalVisible(true));
          }
          dispatch(setError(err.message));
        } else {
          dispatch(setError('Failed to send reset email. Please try again.'));
        }
        throw err;
      }
    },
    [dispatch]
  );

  const verifyRecoveryOtp = useCallback(
    async (params: VerifyOtpRecoveryParams) => {
      try {
        dispatch(setLoading(true));
        const result = await authApi.verifyOtp(params);
        dispatch(setLoading(false));
        return result;
      } catch (err: any) {
        dispatch(setLoading(false));
        if (err instanceof AppAuthError) {
          if (err.isRateLimit) {
            dispatch(setMaxAttemptsModalVisible(true));
          }
          dispatch(setError(err.message));
        } else {
          dispatch(setError('Invalid recovery code. Please try again.'));
        }
        throw err;
      }
    },
    [dispatch]
  );

  const updatePassword = useCallback(
    async (password: string) => {
      try {
        dispatch(setLoading(true));
        const result = await authApi.updateUser({ password });
        dispatch(setLoading(false));
        return result;
      } catch (err: any) {
        dispatch(setLoading(false));
        if (err instanceof AppAuthError) {
          if (err.isRateLimit) {
            dispatch(setMaxAttemptsModalVisible(true));
          }
          dispatch(setError(err.message));
        } else {
          dispatch(setError('Failed to update password. Please try again.'));
        }
        throw err;
      }
    },
    [dispatch]
  );

  const updateProfile = useCallback(
    async (updates: { full_name?: string; image_url?: string | null; phone?: string }) => {
      if (!user) return null;
      try {
        dispatch(setLoading(true));
        const updated = await authApi.updateProfile(user.id, updates);
        dispatch(setProfile(updated));
        if (updated?.image_url) {
          saveCachedAvatar(updated.image_url);
        } else {
          clearCachedAvatar();
        }
        if (updated?.full_name) {
          saveCachedName(updated.full_name);
        }
        dispatch(setLoading(false));
        return updated;
      } catch (err: any) {
        dispatch(setLoading(false));
        throw err;
      }
    },
    [dispatch, user]
  );

  const dismissMaxAttemptsModal = useCallback(() => {
    dispatch(setMaxAttemptsModalVisible(false));
  }, [dispatch]);

  const clearError = useCallback(() => {
    dispatch(setError(null));
  }, [dispatch]);

  return {
    session,
    user,
    profile,
    isAuthenticated,
    isLoading,
    isInitialized,
    error,
    isMaxAttemptsModalVisible,
    signUp,
    signIn,
    signOut,
    resetPassword,
    verifyRecoveryOtp,
    updatePassword,
    loadProfile,
    updateProfile,
    dismissMaxAttemptsModal,
    clearError,
  };
}

export function useAuthSubscription() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    let isMounted = true;

    // Fetch initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      if (session) {
        dispatch(setSession(session));
        authApi
          .fetchProfile(session.user.id)
          .then((profile) => {
            if (isMounted && profile) {
              dispatch(setProfile(profile));
            }
          })
          .catch(() => {});
      } else {
        dispatch(setSession(null));
      }
      dispatch(setInitialized(true));
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      if (event === 'PASSWORD_RECOVERY') {
        // User is setting new password; stay in Auth stack
        return;
      }

      if (session) {
        dispatch(setSession(session));
        try {
          const profile = await authApi.fetchProfile(session.user.id);
          if (isMounted && profile) {
            dispatch(setProfile(profile));
          }
        } catch {
          // ignore profile fetch error
        }
      } else if (event === 'SIGNED_OUT') {
        dispatch(logoutAction());
      } else {
        dispatch(setSession(null));
      }
      dispatch(setInitialized(true));
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [dispatch]);
}

export default useAuth;
