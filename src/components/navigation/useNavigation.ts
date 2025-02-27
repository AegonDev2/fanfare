
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

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
            .select('email, user_type')
            .eq('id', data.user.id)
            .maybeSingle();
            
          if (profileError) {
            throw profileError;
          }
          
          // Get user role from user_roles table
          const { data: roleData, error: roleError } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', data.user.id)
            .maybeSingle();
            
          if (roleError && roleError.code !== 'PGRST116') {
            throw roleError;
          }
          
          setUser(data.user);
          setUserEmail(profileData?.email || data.user.email);
          
          // Set the role based on the user_roles table, or fall back to user_type from profiles
          if (roleData?.role) {
            setUserRole(roleData.role as NavRole);
          } else if (profileData?.user_type) {
            // Convert user_type to a NavRole if possible
            const userType = profileData.user_type.toLowerCase();
            if (userType === 'fan' || userType === 'influencer' || userType === 'admin') {
              setUserRole(userType as NavRole);
            }
          }
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

  // Combine navitems, filtering by user role
  const allNavItems = [...mainNavItems, ...roleNavItems]
    .filter(item => item.roles.includes(userRole));

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
