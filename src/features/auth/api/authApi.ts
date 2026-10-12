import { supabase } from '@/lib/supabase';
import { Profile } from '@/types';
import { User, Session } from '@supabase/supabase-js';

export interface SignUpParams {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  avatarUri?: string;
  avatarBase64?: string;
  role?: 'customer' | 'vendor';
}

export interface SignInParams {
  email: string;
  password: string;
}

export interface VerifyOtpRecoveryParams {
  email: string;
  token: string;
}

export interface UpdatePasswordParams {
  password: string;
}

export interface AuthErrorResult {
  message: string;
  isRateLimit: boolean;
  code?: string;
}

export function mapAuthError(error: any): AuthErrorResult {
  if (!error) {
    return {
      message: 'An unexpected error occurred. Please try again.',
      isRateLimit: false,
    };
  }

  const rawMessage = (error.message || '').toLowerCase();
  const code = (error.code || '').toLowerCase();
  const status = error.status;

  // Rate limit / 429 (Status 429 or rate limit codes)
  if (
    status === 429 ||
    code === 'over_email_send_rate_limit' ||
    code === 'over_request_rate_limit' ||
    code === 'rate_limit' ||
    rawMessage.includes('rate limit') ||
    rawMessage.includes('too many requests') ||
    rawMessage.includes('for security purposes, you can only request this once') ||
    rawMessage.includes('security purposes')
  ) {
    return {
      message: 'You reached the maximum amount of attempts. Please try again later.',
      isRateLimit: true,
      code: 'rate_limit',
    };
  }

  // Invalid credentials
  if (
    code === 'invalid_credentials' ||
    code === 'invalid_grant' ||
    rawMessage.includes('invalid login credentials') ||
    rawMessage.includes('invalid credentials') ||
    rawMessage.includes('invalid email or password')
  ) {
    return {
      message: 'Invalid email or password. Please check your credentials and try again.',
      isRateLimit: false,
      code: 'invalid_credentials',
    };
  }

  // Email not confirmed
  if (
    code === 'email_not_confirmed' ||
    rawMessage.includes('email not confirmed')
  ) {
    return {
      message: 'Your email address is not confirmed yet. Please check your inbox for the confirmation link.',
      isRateLimit: false,
      code: 'email_not_confirmed',
    };
  }

  // User already registered
  if (
    code === 'user_already_exists' ||
    rawMessage.includes('user already registered') ||
    rawMessage.includes('already registered')
  ) {
    return {
      message: 'An account with this email address already exists. Please log in instead.',
      isRateLimit: false,
      code: 'user_already_exists',
    };
  }

  // OTP expired or invalid
  if (
    code === 'otp_expired' ||
    rawMessage.includes('token has expired') ||
    rawMessage.includes('invalid token') ||
    rawMessage.includes('otp has expired') ||
    rawMessage.includes('token is expired or is invalid')
  ) {
    return {
      message: 'The recovery code has expired or is invalid. Please request a new code.',
      isRateLimit: false,
      code: 'otp_expired',
    };
  }

  // Network error
  if (
    rawMessage.includes('network request failed') ||
    rawMessage.includes('failed to fetch') ||
    rawMessage.includes('networkerror') ||
    rawMessage.includes('network error')
  ) {
    return {
      message: 'Network error. Please check your internet connection and try again.',
      isRateLimit: false,
      code: 'network_error',
    };
  }

  return {
    message: error.message || 'An unexpected error occurred. Please try again.',
    isRateLimit: false,
    code,
  };
}

export class AppAuthError extends Error {
  isRateLimit: boolean;
  code?: string;

  constructor(mapped: AuthErrorResult) {
    super(mapped.message);
    this.name = 'AppAuthError';
    this.isRateLimit = mapped.isRateLimit;
    this.code = mapped.code;
  }
}

export const authApi = {
  signUp: async ({
    email,
    password,
    fullName,
    phone,
    avatarUri,
    avatarBase64,
    role,
  }: SignUpParams): Promise<{ user: User | null; session: Session | null }> => {
    let uploadedAvatarUrl = avatarUri;
    if (avatarBase64) {
      uploadedAvatarUrl = `data:image/jpeg;base64,${avatarBase64}`;
    }

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          ...(phone && phone.trim() ? { phone: phone.trim() } : {}),
          role: role || 'customer',
        },
      },
    });

    if (error) {
      throw new AppAuthError(mapAuthError(error));
    }

    if (data.user && data.user.identities?.length === 0) {
      throw new AppAuthError({
        message: 'An account with this email address already exists. Please log in instead.',
        isRateLimit: false,
        code: 'user_already_exists',
      });
    }

    // If user is created and avatar was provided, sync to profiles table
    if (data.user && uploadedAvatarUrl) {
      try {
        await supabase
          .from('profiles')
          .update({ image_url: uploadedAvatarUrl })
          .eq('id', data.user.id);
      } catch (err) {
        console.log('[Profile avatar sync error]', err);
      }
    }

    return { user: data.user, session: data.session };
  },

  signInWithPassword: async ({
    email,
    password,
  }: SignInParams): Promise<{ user: User; session: Session }> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      throw new AppAuthError(mapAuthError(error));
    }

    return { user: data.user, session: data.session };
  },

  signOut: async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new AppAuthError(mapAuthError(error));
    }
  },

  resetPasswordForEmail: async (email: string): Promise<void> => {
    console.log('[Supabase Auth] Requesting resetPasswordForEmail for:', email.trim());
    const { data, error } = await supabase.auth.resetPasswordForEmail(email.trim());
    if (error) {
      console.log('[Supabase Auth] resetPasswordForEmail error:', error);
      throw new AppAuthError(mapAuthError(error));
    }
    console.log('[Supabase Auth] resetPasswordForEmail success:', data);
  },

  verifyOtp: async ({
    email,
    token,
  }: VerifyOtpRecoveryParams): Promise<{ user: User | null; session: Session | null }> => {
    const { data, error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: token.trim(),
      type: 'recovery',
    });

    if (error) {
      throw new AppAuthError(mapAuthError(error));
    }

    return { user: data.user, session: data.session };
  },

  updateUser: async ({
    password,
  }: UpdatePasswordParams): Promise<{ user: User }> => {
    const { data, error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      throw new AppAuthError(mapAuthError(error));
    }

    return { user: data.user };
  },

  fetchProfile: async (userId: string): Promise<Profile | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      throw new AppAuthError(mapAuthError(error));
    }

    return data as Profile;
  },

  updateProfile: async (
    userId: string,
    updates: { full_name?: string; image_url?: string | null; phone?: string }
  ): Promise<Profile> => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new AppAuthError(mapAuthError(error));
    }

    return data as Profile;
  },
};

export default authApi;
