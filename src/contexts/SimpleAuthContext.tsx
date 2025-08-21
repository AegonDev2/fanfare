import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { optimizedCache } from '@/utils/optimizedCache';
import type { UnifiedUserData, AuthState, AuthHelpers, NavRole } from '@/types/auth';

// Export NavRole for backward compatibility
export type { NavRole };

interface SimpleAuthContextType extends AuthState, AuthHelpers {
  user: User | null;
  session: Session | null;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
  
  // Backward compatibility properties
  profile: UnifiedUserData['profile'] | null;
  userRole: NavRole;
}

const SimpleAuthContext = createContext<SimpleAuthContextType | undefined>(undefined);

export const SimpleAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userData, setUserData] = useState<UnifiedUserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!user && !!session;

  // Single function to load complete user data
  const loadCompleteUserData = useCallback(async (userId: string): Promise<UnifiedUserData | null> => {
    try {
      console.log('📊 Loading complete user data for:', userId);
      
      // Check cache first
      const cachedData = optimizedCache.getUserComplete(userId);
      if (cachedData) {
        console.log('⚡ Using cached user data');
        return cachedData;
      }

      // Use unified database function
      const { data, error: dbError } = await supabase.rpc('get_complete_user_data', {
        user_uuid: userId
      });

      if (dbError) {
        console.error('❌ Database error:', dbError);
        throw dbError;
      }

      if (!data) {
        console.warn('⚠️ No user data found');
        return null;
      }

      // Transform and cache the data
      const unifiedData: UnifiedUserData = {
        profile: (data as any).profile,
        influencer_profile: (data as any).influencer_profile,
        fan_profile: (data as any).fan_profile,
        roles: (data as any).roles || [],
        wallet: (data as any).wallet
      };

      // Cache for future use
      optimizedCache.setUserComplete(userId, unifiedData);
      
      console.log('✅ User data loaded and cached');
      return unifiedData;
    } catch (err) {
      console.error('❌ Error loading user data:', err);
      throw err;
    }
  }, []);

  // Load user data when session changes
  const handleSessionChange = useCallback(async (currentSession: Session | null) => {
    setSession(currentSession);
    setUser(currentSession?.user || null);
    setError(null);

    if (!currentSession?.user) {
      setUserData(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const data = await loadCompleteUserData(currentSession.user.id);
      setUserData(data);
    } catch (err) {
      console.error('Failed to load user data:', err);
      setError('Failed to load user data');
      setUserData(null);
    } finally {
      setIsLoading(false);
    }
  }, [loadCompleteUserData]);

  // Initialize auth
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        console.log('🚀 Initializing simple auth...');

        // Get initial session
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (!isMounted) return;

        await handleSessionChange(initialSession);

        // Set up auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, currentSession) => {
            if (!isMounted) return;
            
            console.log('🔄 Auth event:', event);
            
            if (event === 'SIGNED_OUT') {
              // Clear all user cache on sign out
              if (user?.id) {
                optimizedCache.clearUserData(user.id);
              }
              setUser(null);
              setSession(null);
              setUserData(null);
              setError(null);
              setIsLoading(false);
              return;
            }
            
            if (event === 'TOKEN_REFRESHED') {
              // Just update session, don't reload data
              setSession(currentSession);
              return;
            }
            
            if (event === 'SIGNED_IN') {
              await handleSessionChange(currentSession);
            }
          }
        );

        console.log('✅ Simple auth initialized');
        
        return () => {
          subscription.unsubscribe();
        };
      } catch (err) {
        console.error('❌ Auth initialization error:', err);
        setError('Failed to initialize authentication');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    const cleanup = initializeAuth();
    
    return () => {
      isMounted = false;
      cleanup.then(unsub => unsub?.());
    };
  }, [handleSessionChange, user?.id]);

  // Auth helpers
  const hasRole = useCallback((role: NavRole): boolean => {
    if (!userData?.roles) return false;
    
    // Special admin check
    if (role === 'admin') {
      return userData.roles.includes('admin') || 
             user?.id === "724ce941-97c5-4b7d-b0ba-7ee9bd1df237" ||
             user?.email === 'admin@fanfare.com';
    }
    
    return userData.roles.includes(role);
  }, [userData?.roles, user?.id, user?.email]);

  const getUserRole = useCallback((): NavRole => {
    if (hasRole('admin')) return 'admin';
    if (hasRole('influencer')) return 'influencer';
    return 'fan';
  }, [hasRole]);

  const isPrimaryRole = useCallback((role: NavRole): boolean => {
    return getUserRole() === role;
  }, [getUserRole]);

  const getDisplayName = useCallback((): string => {
    return userData?.profile?.name || 
           userData?.influencer_profile?.name || 
           userData?.fan_profile?.profile_name || 
           user?.email || 
           'User';
  }, [userData, user?.email]);

  const signOut = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Clear user cache
      if (user?.id) {
        optimizedCache.clearUserData(user.id);
      }
      
      // Sign out from Supabase
      await supabase.auth.signOut({ scope: 'global' });
      
      // Force refresh for clean state
      window.location.href = '/auth';
    } catch (err) {
      console.error('Sign out error:', err);
      setError('Failed to sign out');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const refresh = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Clear cache and reload
      optimizedCache.clearUserData(user.id);
      const data = await loadCompleteUserData(user.id);
      setUserData(data);
    } catch (err) {
      console.error('Refresh error:', err);
      setError('Failed to refresh user data');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, loadCompleteUserData]);

  const contextValue: SimpleAuthContextType = {
    // State
    user,
    session,
    userData,
    isLoading,
    isAuthenticated,
    error,
    
    // Backward compatibility
    profile: userData?.profile || null,
    userRole: getUserRole(),
    
    // Helpers
    hasRole,
    isPrimaryRole,
    getUserRole,
    getDisplayName,
    isInfluencer: hasRole('influencer'),
    isFan: hasRole('fan'),
    isAdmin: hasRole('admin'),
    
    // Actions
    signOut,
    refresh,
  };

  return (
    <SimpleAuthContext.Provider value={contextValue}>
      {children}
    </SimpleAuthContext.Provider>
  );
};

export const useSimpleAuth = () => {
  const context = useContext(SimpleAuthContext);
  if (context === undefined) {
    throw new Error('useSimpleAuth must be used within a SimpleAuthProvider');
  }
  return context;
};

// Backward compatibility export
export const useAuth = useSimpleAuth;