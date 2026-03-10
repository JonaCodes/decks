import { supabase } from 'public/src/lib/supabase';
import appStore from 'public/src/stores/appStore';

// Validation
export const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// OAuth
export const signInWithOAuth = async (
  provider: 'google' | 'apple'
): Promise<{ error?: Error }> => {
  try {
    appStore.setIsLoadingSignIn(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) throw error;
    return {};
  } catch (err: any) {
    console.error(err);
    return { error: err };
  }
};

// OTP
export const requestOtp = async (email: string): Promise<{ error?: Error }> => {
  try {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      },
    });

    if (error) throw error;
    return {};
  } catch (err: any) {
    return { error: err };
  }
};

export const verifyOtp = async (
  email: string,
  token: string,
  fullName: string
): Promise<{ error?: Error }> => {
  try {
    // Verify OTP
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });

    if (verifyError) throw verifyError;

    // Update user metadata with name
    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        full_name: fullName,
      },
    });

    if (updateError) throw updateError;

    return {};
  } catch (err: any) {
    return { error: err };
  }
};
