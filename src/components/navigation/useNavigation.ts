
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
          // Get user profile to determine role
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('role, email')
            .eq('id', data.user.id)
            .single();
            
          if (profileError && profileError.code !== 'PGRST116') {
            throw profileError;
          }
          
          setUser(data.user);
          setUserEmail(data.user.email);
          
          if (profileData?.role) {
            setUserRole(profileData.role as NavRole);
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
