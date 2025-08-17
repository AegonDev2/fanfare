import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LimelightNav } from '@/components/ui/limelight-nav';
import { 
  Home, 
  Search, 
  User, 
  Wallet, 
  Gift, 
  Heart, 
  Bell,
  Trophy
} from 'lucide-react';

const MobileDock = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, isLoading } = useAuth();

  // Don't show dock while auth is loading
  if (isLoading) {
    return null;
  }

  // Don't show dock on auth pages
  if (location.pathname.includes('/auth') || location.pathname.includes('/email-verification')) {
    return null;
  }

  // Get user-specific navigation items
  const getNavItems = () => {
    const baseItems = [
      {
        id: 'home',
        icon: <Home />,
        label: 'Home',
        onClick: () => navigate('/')
      },
      {
        id: 'browse',
        icon: <Search />,
        label: 'Browse',
        onClick: () => navigate('/gift-selection')
      }
    ];

    if (!user) {
      // Guest navigation
      return [
        ...baseItems,
        {
          id: 'leaderboard',
          icon: <Trophy />,
          label: 'Leaderboard',
          onClick: () => navigate('/leaderboard')
        }
      ];
    }

    // Authenticated user navigation
    const authenticatedItems = [
      ...baseItems,
      {
        id: 'gifts',
        icon: profile?.user_type === 'influencer' ? <Heart /> : <Gift />,
        label: profile?.user_type === 'influencer' ? 'Requests' : 'Gifts',
        onClick: () => navigate(profile?.user_type === 'influencer' ? '/gift-requests' : '/gifts-sent')
      },
      {
        id: 'profile',
        icon: <User />,
        label: 'Profile',
        onClick: () => navigate(`/profile/${profile?.id || ''}`)
      },
      {
        id: 'wallet',
        icon: <Wallet />,
        label: 'Wallet',
        onClick: () => navigate('/wallet')
      }
    ];

    return authenticatedItems;
  };

  // Determine active index based on current route
  const getActiveIndex = () => {
    const items = getNavItems();
    const path = location.pathname;
    
    if (path === '/' || path === '/home') return 0;
    if (path.includes('/gift-selection') || path.includes('/browse')) return 1;
    if (path.includes('/gift-requests') || path.includes('/gifts-sent')) return 2;
    if (path.includes('/profile')) return user ? 3 : 0;
    if (path.includes('/wallet')) return user ? 4 : 0;
    if (path.includes('/leaderboard')) return user ? 0 : 2;
    
    return 0;
  };

  const navItems = getNavItems();

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 md:hidden">
      <LimelightNav
        items={navItems}
        defaultActiveIndex={getActiveIndex()}
        className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-white/20 shadow-lg"
        limelightClassName="bg-gradient-to-r from-funky-purple to-funky-pink"
        iconClassName="text-gray-600 dark:text-gray-300"
      />
    </div>
  );
};

export default MobileDock;