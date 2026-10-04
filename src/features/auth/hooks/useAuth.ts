import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { loginSuccess, logout as logoutAction, setLoading } from '@/store/slices/authSlice';
import authApi, { LoginParams, VerifyOtpParams } from '@/features/auth/api/authApi';

export function useAuth() {
  const dispatch = useAppDispatch();
  const { user, token, isAuthenticated, isLoading } = useAppSelector((state) => state.auth);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const requestLogin = useCallback(async (params: LoginParams) => {
    try {
      setErrorMessage(null);
      dispatch(setLoading(true));
      const response = await authApi.login(params);
      dispatch(setLoading(false));
      return response;
    } catch (err: any) {
      dispatch(setLoading(false));
      setErrorMessage(err.message || 'Failed to login');
      throw err;
    }
  }, [dispatch]);

  const verifyOtp = useCallback(async (params: VerifyOtpParams) => {
    try {
      setErrorMessage(null);
      dispatch(setLoading(true));
      const response = await authApi.verifyOtp(params);
      if (response.data) {
        await AsyncStorage.setItem('@auth_token', response.data.token);
        dispatch(loginSuccess(response.data));
      }
      return response;
    } catch (err: any) {
      dispatch(setLoading(false));
      setErrorMessage(err.message || 'OTP verification failed');
      throw err;
    }
  }, [dispatch]);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem('@auth_token');
    dispatch(logoutAction());
  }, [dispatch]);

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    errorMessage,
    requestLogin,
    verifyOtp,
    logout,
  };
}

export default useAuth;
