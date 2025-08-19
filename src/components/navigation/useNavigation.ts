
import { useLocation } from "react-router-dom";
import { useAuth, type NavRole } from "@/contexts/SimpleAuthContext";

export const useNavigation = () => {
  const location = useLocation();
  const { user, userRole, profile, isLoading, error } = useAuth();

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
      id: 'gift-shop',
      title: 'Gift Shop',
      path: '/gift-shop',
      icon: 'Store',
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

  // Filter navigation items based on user role
  const allNavItems = user
    ? [...mainNavItems, ...roleNavItems].filter(item => {
        // Special admin access for specific UID or email
        if ((user.id === "724ce941-97c5-4b7d-b0ba-7ee9bd1df237" || user.email === 'admin@fanfare.com') && item.roles.includes('admin')) {
          return true;
        }
        return item.roles.includes(userRole);
      })
    : mainNavItems; // For guests, only show main navigation items

  const activeUrl = location.pathname;

  return {
    navItems: allNavItems,
    userRole,
    userEmail: profile?.email || user?.email,
    userName: profile?.name,
    user,
    isActiveRoute: (path: string) => location.pathname === path,
    activeUrl,
    isLoading,
    error
  };
};
