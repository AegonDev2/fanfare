import React from 'react';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { PageLoader } from '@/components/ui/loader';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  fallback = <PageLoader message="Loading..." /> 
}) => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};