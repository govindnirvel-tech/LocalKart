import { ApiResponse, User } from '@/types';

export interface LoginParams {
  phoneOrEmail: string;
  password?: string;
}

export interface VerifyOtpParams {
  phoneOrEmail: string;
  otp: string;
}

export interface AuthResponseData {
  user: User;
  token: string;
}

export const authApi = {
  login: async (_params: LoginParams): Promise<ApiResponse<{ requiresOtp: boolean }>> => {
    // In real app: return (await apiClient.post('/auth/login', _params)).data;
    return {
      success: true,
      message: 'OTP sent successfully',
      data: { requiresOtp: true },
    };
  },

  verifyOtp: async (params: VerifyOtpParams): Promise<ApiResponse<AuthResponseData>> => {
    // In real app: return (await apiClient.post('/auth/verify-otp', params)).data;
    return {
      success: true,
      message: 'Logged in successfully',
      data: {
        token: 'jwt-token-sample',
        user: {
          id: 'user_1',
          name: 'Demo User',
          phone: params.phoneOrEmail,
        },
      },
    };
  },

  forgotPassword: async (_phoneOrEmail: string): Promise<ApiResponse<null>> => {
    // In real app: return (await apiClient.post('/auth/forgot-password', { phoneOrEmail: _phoneOrEmail })).data;
    return {
      success: true,
      message: 'Reset instructions sent to your email/phone',
      data: null,
    };
  },
};

export default authApi;
