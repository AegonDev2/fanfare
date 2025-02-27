
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";
import { useNavigate } from "react-router-dom";

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role?: 'fan' | 'influencer' | 'admin';
  created_at?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Get initial session
    const initUser = async () => {
      try {
        setLoading(true);
        const { data: { user: authUser } } = await supabase.auth.getUser();
        
        if (authUser) {
          // Fetch user profile info
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .single();

          if (profileError && profileError.code !== 'PGRST116') {
            throw profileError;
          }

          setUser({
            id: authUser.id,
            email: authUser.email || '',
            full_name: profileData?.full_name || authUser.user_metadata?.full_name,
            avatar_url: profileData?.avatar_url || authUser.user_metadata?.avatar_url,
            role: profileData?.role || 'fan',
            created_at: authUser.created_at
          });
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Error loading user:', err);
        setError(err instanceof Error ? err : new Error('Failed to load user'));
      } finally {
        setLoading(false);
      }
    };

    initUser();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          try {
            // Fetch profile after sign in
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (profileError && profileError.code !== 'PGRST116') {
              throw profileError;
            }

            setUser({
              id: session.user.id,
              email: session.user.email || '',
              full_name: profileData?.full_name || session.user.user_metadata?.full_name,
              avatar_url: profileData?.avatar_url || session.user.user_metadata?.avatar_url,
              role: profileData?.role || 'fan',
              created_at: session.user.created_at
            });

            toast({
              title: "Welcome back!",
              description: "You have successfully signed in.",
            });
          } catch (err) {
            console.error('Error loading profile:', err);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      return { success: true };
    } catch (err) {
      console.error('Error signing in:', err);
      setError(err instanceof Error ? err : new Error('Failed to sign in'));
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to sign in' 
      };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;

      // Create a user profile
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              full_name: fullName,
              email: email,
              role: 'fan',
            },
          ]);

        if (profileError) throw profileError;
      }

      toast({
        title: "Account created!",
        description: "Your account has been created successfully.",
      });

      return { success: true };
    } catch (err) {
      console.error('Error signing up:', err);
      setError(err instanceof Error ? err : new Error('Failed to sign up'));
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to sign up' 
      };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
      
      navigate('/');
      return { success: true };
    } catch (err) {
      console.error('Error signing out:', err);
      setError(err instanceof Error ? err : new Error('Failed to sign out'));
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to sign out' 
      };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      toast({
        title: "Password reset email sent",
        description: "Check your email for a password reset link.",
      });
      
      return { success: true };
    } catch (err) {
      console.error('Error resetting password:', err);
      setError(err instanceof Error ? err : new Error('Failed to reset password'));
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to reset password' 
      };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData: Partial<UserProfile>) => {
    try {
      if (!user) throw new Error('Not authenticated');
      
      setLoading(true);
      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Update local user state
      setUser(prev => prev ? { ...prev, ...profileData } : null);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      
      return { success: true };
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err : new Error('Failed to update profile'));
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to update profile' 
      };
    } finally {
      setLoading(false);
    }
  };

  return { 
    user, 
    loading, 
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile
  };
};
