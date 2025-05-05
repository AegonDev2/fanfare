import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getUserRoles, hasRole } from "@/utils/roleManager";

export type NavRole = 'fan' | 'influencer' | 'admin';

export const useNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [userRole, setUserRole] = useState<NavRole>('fan');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        // Get session first to check if user is authenticated
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (sessionData && sessionData.session) {
          // User is authenticated, get user data
          const { data: userData, error: userError } = await supabase.auth.getUser();
          
          if (userError) {
            throw userError;
          }
          
          if (userData.user) {
            // Get user profile to get email and name
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('email, name')
              .eq('id', userData.user.id)
              .maybeSingle();
              
            if (profileError) {
              console.error("Error fetching profile:", profileError);
            }
            
            // Get user roles directly from user_roles table
            const rolesResponse = await getUserRoles(userData.user.id);
            
            setUser(userData.user);
            setUserEmail(profileData?.email || userData.user.email);
            setUserName(profileData?.name || null);
            
            // Special case for admin UID
            if (userData.user.id === "724ce941-97c5-4b7d-b0ba-7ee9bd1df237") {
              setUserRole('admin');
            }
            // Set role priority: admin > influencer > fan
            // If user has admin role, set it regardless of other roles
            else if (rolesResponse.success && rolesResponse.roles.includes('admin')) {
              setUserRole('admin');
            } 
            // Otherwise if user has influencer role, set it
            else if (rolesResponse.success && rolesResponse.roles.includes('influencer')) {
              setUserRole('influencer');
            } 
            // Otherwise set fan role as default
            else if (rolesResponse.success && rolesResponse.roles.includes('fan')) {
              setUserRole('fan');
            }
            // If no roles found, default to fan
            else {
              setUserRole('fan');
            }
          }
        } else {
          // User is not authenticated, reset states
          setUser(null);
          setUserEmail(null);
          setUserName(null);
          setUserRole('fan');
        }
      } catch (err) {
        console.error("Navigation error:", err);
        setError(err instanceof Error ? err : new Error('Failed to load user data'));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
    
    // Add auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchUserData();
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Main navigation items
  const mainNavItems = [
    {
      id: 'home',
      title: 'Home',
      path: '/',
      icon: 'Home',
      roles: ['fan', 'influencer', 'admin'] as NavRole[],
    },
    {
      id: 'how-it-works',
      title: 'How It Works',
      path: '/how-it-works',
      icon: 'Book',
      roles: ['fan', 'influencer', 'admin'] as NavRole[],
    },
    {
      id: 'creators',
      title: 'Creators',
      path: '/creators',
      icon: 'Users',
      roles: ['fan', 'influencer', 'admin'] as NavRole[],
    },
    {
      id: 'about',
      title: 'About Us',
      path: '/about',
      icon: 'Info',
      roles: ['fan', 'influencer', 'admin'] as NavRole[],
    },
    {
      id: 'gifts-sent',
      title: 'Gifts Sent',
      path: '/gifts-sent',
      icon: 'Gift',
      roles: ['fan'] as NavRole[],
    },
  ];

  // Role-specific items
  const roleNavItems = [
    {
      id: "gift-requests",
      title: "Gift Requests",
      path: "/gift-requests",
      icon: "Gift",
      roles: ["fan", "influencer"] as NavRole[],
    },
    {
      id: 'admin-dashboard',
      title: 'Admin Dashboard',
      path: '/admin',
      icon: 'LayoutDashboard',
      roles: ['admin'] as NavRole[],
    },
    {
      id: 'wallet',
      title: 'Wallet',
      path: '/wallet',
      icon: 'Wallet',
      roles: ['fan', 'influencer', 'admin'] as NavRole[],
    },
    {
      id: 'profile',
      title: 'My Profile',
      path: user ? `/profile/${user.id}` : '/profile',
      icon: 'User',
      roles: ['fan', 'influencer', 'admin'] as NavRole[],
    },
    {
      id: 'settings',
      title: 'Settings',
      path: '/settings',
      icon: 'Settings',
      roles: ['fan', 'influencer', 'admin'] as NavRole[],
    },
  ];

  // Always return mainNavItems for guest users, but for logged-in users, filter based on role
  const allNavItems = user
    ? [...mainNavItems, ...roleNavItems].filter(item => {
        // Special admin access for specific UID
        if (user.id === "724ce941-97c5-4b7d-b0ba-7ee9bd1df237" && item.roles.includes('admin')) {
          return true;
        }
        return item.roles.includes(userRole);
      })
    : mainNavItems; // For guests, only show main navigation items

  const activeUrl = location.pathname;

  return {
    navItems: allNavItems,
    userRole,
    userEmail,
    userName,
    user,
    isActiveRoute: (path: string) => location.pathname === path,
    activeUrl,
    isLoading,
    error
  };
};
