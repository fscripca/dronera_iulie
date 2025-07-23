import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

interface UserWithProfile extends User {
  first_name?: string;
  last_name?: string;
  kyc_status?: string;
}

interface AuthContextType {
  user: UserWithProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  session: Session | null;
  refreshSession: () => Promise<void>;
  resendConfirmation: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserWithProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      setLoading(true);
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        // Handle invalid refresh token errors
        if (error && (error.message?.includes('Invalid Refresh Token') || error.message?.includes('refresh_token_not_found'))) {
          console.warn('Invalid refresh token detected, signing out:', error.message);
          await supabase.auth.signOut();
          setUser(null);
          setSession(null);
          setLoading(false);
          return;
        }
        
        // Handle invalid session JWT errors
        if (error && error.message?.includes('Session from session_id claim in JWT does not exist')) {
          console.warn('Invalid session JWT detected, signing out:', error.message);
          await supabase.auth.signOut();
          setUser(null);
          setSession(null);
          setLoading(false);
          return;
        }
        
        let userWithProfile = session?.user ?? null;

        if (userWithProfile) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('first_name, last_name, kyc_status')
            .eq('id', userWithProfile.id)
            .single();

          if (profileData) {
            userWithProfile = {
              ...userWithProfile,
              first_name: profileData.first_name,
              last_name: profileData.last_name,
              kyc_status: profileData.kyc_status
            };
          }
        }

        setUser(userWithProfile);
        setSession(session);
      } catch (error) {
        console.error('Failed to get session:', error);
        // If it's a refresh token error, clear the session
        if (error.message?.includes('Invalid Refresh Token') || error.message?.includes('refresh_token_not_found')) {
          await supabase.auth.signOut();
        }
        setUser(null);
        setSession(null);
      }
      setLoading(false);
    };

    checkSession();

    let subscription: { unsubscribe: () => void } = { unsubscribe: () => {} };

    try {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        const fetchUserProfile = async () => {
          let userWithProfile = session?.user ?? null;

          if (userWithProfile) {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('first_name, last_name, kyc_status')
              .eq('id', userWithProfile.id)
              .single();

            if (profileData) {
              userWithProfile = {
                ...userWithProfile,
                first_name: profileData.first_name,
                last_name: profileData.last_name,
                kyc_status: profileData.kyc_status
              };
            }
          }

          setUser(userWithProfile);
          setSession(session);
        };

        fetchUserProfile();
      });
      subscription = data.subscription;
    } catch (error) {
      console.warn('Failed to set up auth state change listener:', error);
    }

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email: email.toLowerCase(), 
        password 
      });

      if (error) {
        if (error.message?.includes('Email not confirmed')) {
          throw new Error('Please confirm your email before signing in.');
        } else if (error.message?.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password.');
        } else {
          throw error;
        }
      }

      setUser(data.user);
      setSession(data.session);
      return data;
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({ 
        email: email.toLowerCase(), 
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) {
        if (error.message?.includes('Error sending confirmation email')) {
          throw new Error('Unable to send confirmation email. Please check your email configuration or try again later.');
        } else if (error.message?.includes('unexpected_failure')) {
          throw new Error('Sign up failed due to server configuration. Please contact support.');
        } else {
          throw error;
        }
      }

      if (data.session) {
        setUser(data.user); 
        setSession(data.session); 
      }

      return data;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error && error.message !== 'Auth session missing!') {
        // Only log as error if it's not a session_not_found case
        if (error.message?.includes('session_not_found') || error.message?.includes('Session from session_id claim in JWT does not exist')) {
          console.warn('Session already terminated on server:', error.message);
        } else {
          console.error('Sign out error:', error);
        }
      }
    } catch (error) {
      // Handle session_not_found errors gracefully
      if (error.message?.includes('session_not_found') || error.message?.includes('Auth session missing!')) {
        console.warn('Session already terminated:', error.message);
      } else {
        console.error('Sign out error:', error);
      }
    } finally {
      // Always clear local state regardless of Supabase response
      setUser(null);
      setSession(null);
    }
  };

  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        console.warn('Session refresh error:', error);
        return;
      }

      setSession(data.session);
      setUser(data.session?.user ?? null);
    } catch (error) {
      console.warn('Failed to refresh session:', error);
    }
  };

  const resendConfirmation = async (email: string) => {
    try {
      const { data, error } = await supabase.auth.resend({
        type: 'signup',
        email: email.toLowerCase(),
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) {
        console.error('Failed to resend confirmation:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to resend confirmation:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, session, refreshSession, resendConfirmation }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
