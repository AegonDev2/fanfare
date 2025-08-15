import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { getUserRoles } from '@/utils/roleManager';

export type NavRole = 'fan' | 'influencer' | 'admin';

interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  user_type: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  userRole: NavRole;
  isLoading: boolean;
  error: string | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userRole, setUserRole] = useState<NavRole>('fan');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const resetAuthState = () => {
    setUser(null);
    setSession(null);
    setProfile(null);
    setUserRole('fan');
    setError(null);
  };

  const loadUserData = async (currentSession: Session | null) => {
    if (!currentSession?.user) {
      resetAuthState();
      return;
    }

    try {
      setError(null);
      
      // Get user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentSession.user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        setError('Failed to load profile');
      }

      setUser(currentSession.user);
      setProfile(profileData);

      // Determine user role
      const userId = currentSession.user.id;
      const userEmail = currentSession.user.email;

      // Special case for hardcoded admin
      if (userId === "724ce941-97c5-4b7d-b0ba-7ee9bd1df237" || userEmail === 'admin@fanfare.com') {
        setUserRole('admin');
      } else {
        // Get roles from database
        const rolesResponse = await getUserRoles(userId);
        
        if (rolesResponse.success && rolesResponse.roles.includes('admin')) {
          setUserRole('admin');
        } else if (rolesResponse.success && rolesResponse.roles.includes('influencer')) {
          setUserRole('influencer');
        } else {
          setUserRole('fan');
        }
      }
    } catch (err) {
      console.error('Error loading user data:', err);
      setError('Failed to load user data');
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('🔄 Auth state change:', event, !!currentSession);
        
        setSession(currentSession);
        
        // Use setTimeout to prevent deadlocks
        setTimeout(async () => {
          await loadUserData(currentSession);
          setIsLoading(false);
        }, 0);
      }
    );

    // THEN check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session: existingSession } } = await supabase.auth.getSession();
        console.log('🚀 Initial session check:', !!existingSession);
        
        setSession(existingSession);
        await loadUserData(existingSession);
      } catch (err) {
        console.error('Error initializing auth:', err);
        setError('Failed to initialize authentication');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      setIsLoading(true);
      
      // Clean up local state first
      resetAuthState();
      
      // Sign out from Supabase
      await supabase.auth.signOut({ scope: 'global' });
      
      // Force page refresh for clean state
      window.location.href = '/auth';
    } catch (err) {
      console.error('Error signing out:', err);
      setError('Failed to sign out');
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    session,
    profile,
    userRole,
    isLoading,
    error,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
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