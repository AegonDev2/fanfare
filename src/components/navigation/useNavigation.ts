
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

export type NavRole = 'fan' | 'influencer' | 'admin';

export const useNavigation = () => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
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

  const activeUrl = location.pathname;

  return {
    navItems,
    userRole,
    userEmail,
    isActiveRoute: (path: string) => location.pathname === path,
    activeUrl,
    isLoading,
    error
  };
};
