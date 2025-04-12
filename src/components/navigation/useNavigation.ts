import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getUserRoles, hasRole } from "@/utils/roleManager";

export type NavRole = 'fan' | 'influencer' | 'admin';

export const useNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [userRole, setUserRole] = useState<NavRole>('fan');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const { data } = await supabase.auth.getUser();
        
        if (data.user) {
          // Get user profile to get email
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', data.user.id)
            .maybeSingle();
            
          if (profileError) {
            throw profileError;
          }
          
          // Get user roles directly from user_roles table
          const rolesResponse = await getUserRoles(data.user.id);
          
          setUser(data.user);
          setUserEmail(profileData?.email || data.user.email);
          
          // Special case for admin UID
          if (data.user.id === "724ce941-97c5-4b7d-b0ba-7ee9bd1df237") {
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
          
          // Log the assigned role for debugging
          console.log('User roles from DB:', rolesResponse.roles);
          console.log('Assigned navigation role:', userRole);
        }
      } catch (err) {
        console.error("Navigation error:", err);
        setError(err instanceof Error ? err : new Error('Failed to load user data'));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, []);

  // Main navigation items
  const mainNavItems = [
    {
      id: 'home',
      title: 'Home',
      path: '/',
      icon: 'Home',
      roles: ['fan', 'influencer', 'admin'],
    },
    {
      id: 'how-it-works',
      title: 'How It Works',
      path: '/how-it-works',
      icon: 'Book',
      roles: ['fan', 'influencer', 'admin'],
    },
    {
      id: 'creators',
      title: 'Creators',
      path: '/creators',
      icon: 'Users',
      roles: ['fan', 'influencer', 'admin'],
    },
    {
      id: 'about',
      title: 'About Us',
      path: '/about',
      icon: 'Info',
      roles: ['fan', 'influencer', 'admin'],
    }
  ];

  // Role-specific items
  const roleNavItems = [
    {
      id: 'gift-requests',
      title: 'Gift Requests',
      path: '/gift-requests',
      icon: 'Gift',
      roles: ['influencer'],
    },
    {
      id: 'admin-dashboard',
      title: 'Admin Dashboard',
      path: '/admin',
      icon: 'LayoutDashboard',
      roles: ['admin'],
    },
    {
      id: 'profile',
      title: 'My Profile',
      path: user ? `/profile/${user.id}` : '/profile',
      icon: 'User',
      roles: ['fan', 'influencer', 'admin'],
    },
    {
      id: 'settings',
      title: 'Settings',
      path: '/settings',
      icon: 'Settings',
      roles: ['fan', 'influencer', 'admin'],
    },
  ];

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
    user,
    isActiveRoute: (path: string) => location.pathname === path,
    activeUrl,
    isLoading,
    error
  };
};
