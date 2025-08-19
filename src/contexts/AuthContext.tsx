import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { getUserRoles } from '@/utils/roleManager';
import { appCache, cacheHelpers } from '@/utils/appCache';

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
  const [initialized, setInitialized] = useState(false);

  const resetAuthState = () => {
    setUser(null);
    setSession(null);
    setProfile(null);
    setUserRole('fan');
    setError(null);
  };

  const loadUserData = async (currentSession: Session | null, skipIfLoaded: boolean = false) => {
    if (!currentSession?.user) {
      resetAuthState();
      return;
    }

    const userId = currentSession.user.id;

    // Skip loading if already loaded and user is the same (prevents unnecessary reloads)
    if (skipIfLoaded && user?.id === userId && profile && !error) {
      console.log('🔄 Auth data already loaded, skipping reload');
      return;
    }

    // Try to get from cache first
    const cachedAuth = cacheHelpers.getAuthData(userId) as { profile: UserProfile; userRole: NavRole } | null;
    if (cachedAuth && skipIfLoaded) {
      console.log('🔄 Loading auth data from cache');
      setUser(currentSession.user);
      setProfile(cachedAuth.profile);
      setUserRole(cachedAuth.userRole);
      return;
    }

    try {
      setError(null);
      console.log('🔄 Loading user data for:', userId);
      
      // Check cache for profile and roles first
      let profileData: UserProfile | null = cacheHelpers.getProfile(userId, 'general') as UserProfile | null;
      let rolesResponse;

      if (!profileData) {
        // Get user profile and roles in parallel for better performance
        const [profileResponse, rolesRes] = await Promise.all([
          supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle(),
          getUserRoles(userId)
        ]);

        if (profileResponse.error) {
          console.error('Error fetching profile:', profileResponse.error);
          setError('Failed to load profile');
          return;
        }

        profileData = profileResponse.data;
        rolesResponse = rolesRes;

        // Cache the profile
        if (profileData) {
          cacheHelpers.setProfile(userId, profileData, 'general');
        }
      } else {
        // Get roles if not in main cache
        rolesResponse = await getUserRoles(userId);
      }

      setUser(currentSession.user);
      setProfile(profileData || null);

      // Determine user role
      const userEmail = currentSession.user.email;

      let determinedRole: NavRole = 'fan';
      
      // Special case for hardcoded admin
      if (userId === "724ce941-97c5-4b7d-b0ba-7ee9bd1df237" || userEmail === 'admin@fanfare.com') {
        determinedRole = 'admin';
      } else {
        // Use the roles response
        if (rolesResponse?.success && rolesResponse.roles.includes('admin')) {
          determinedRole = 'admin';
        } else if (rolesResponse?.success && rolesResponse.roles.includes('influencer')) {
          determinedRole = 'influencer';
        } else {
          determinedRole = 'fan';
        }
      }

      setUserRole(determinedRole);

      // Cache auth data for future use
      cacheHelpers.setAuthData(userId, {
        profile: profileData,
        userRole: determinedRole
      });

      // Preload additional user data in background (non-blocking)
      setTimeout(() => {
        appCache.preloadUserData(userId, supabase).catch(console.error);
      }, 100);

      console.log('✅ User data loaded successfully');
    } catch (err) {
      console.error('❌ Error loading user data:', err);
      setError('Failed to load user data');
    }
  };

  useEffect(() => {
    let isMounted = true;
    let authSubscription: any = null;

    const initializeAuth = async () => {
      try {
        console.log('🚀 Initializing auth...');
        
        // Get initial session
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        setSession(initialSession);
        
        // Load user data if session exists
        if (initialSession) {
          await loadUserData(initialSession, false);
        }
        
        // Set up auth state listener AFTER initial load
        authSubscription = supabase.auth.onAuthStateChange(
          async (event, currentSession) => {
            if (!isMounted) return;
            
            console.log('🔄 Auth state change:', event, !!currentSession);
            setSession(currentSession);
            
            // Handle different auth events
            if (event === 'SIGNED_OUT') {
              resetAuthState();
              setIsLoading(false);
              return;
            }
            
            if (event === 'TOKEN_REFRESHED') {
              // Don't reload user data on token refresh, just update session
              setIsLoading(false);
              return;
            }
            
            if (event === 'SIGNED_IN') {
              setIsLoading(true);
              await loadUserData(currentSession, false);
            }
            
            setIsLoading(false);
          }
        );
        
        console.log('✅ Auth initialized successfully');
        
      } catch (err) {
        console.error('❌ Error initializing auth:', err);
        setError('Failed to initialize authentication');
      } finally {
        if (isMounted) {
          setInitialized(true);
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
      if (authSubscription?.subscription) {
        authSubscription.subscription.unsubscribe();
      }
    };
  }, []);

  const signOut = async () => {
    try {
      setIsLoading(true);
      
      // Clear user-specific cache
      if (user?.id) {
        cacheHelpers.clearUserCache(user.id);
      }
      
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