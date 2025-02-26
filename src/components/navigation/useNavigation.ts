
import { useNavigate, useLocation } from "react-router-dom";

export type NavRole = 'fan' | 'influencer' | 'admin';

export const useNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userRole = 'influencer'; // This should be fetched from your auth context
  const userEmail = 'user@example.com'; // This should be fetched from your auth context

  const navItems = [
    {
      id: 'home',
      title: 'Home',
      path: '/',
      icon: 'Home',
      roles: ['fan', 'influencer', 'admin'],
    },
    {
      id: 'gift-requests',
      title: 'Gift Requests',
      path: '/gift-requests',
      icon: 'Gift',
      roles: ['influencer'],
    },
    {
      id: 'settings',
      title: 'Settings',
      path: '/settings',
      icon: 'Settings',
      roles: ['fan', 'influencer', 'admin'],
    },
  ];

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  return {
    navItems,
    userRole,
    userEmail,
    isActiveRoute,
  };
};
