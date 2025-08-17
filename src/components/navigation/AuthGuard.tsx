import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  fallback = <AuthGuardSkeleton /> 
}) => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

const AuthGuardSkeleton = () => (
  <div className="min-h-screen bg-background p-4">
    <div className="max-w-4xl mx-auto space-y-6">
      <Skeleton className="h-16 w-full rounded-lg" />
      <Skeleton className="h-48 w-full rounded-lg" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>
    </div>
  </div>
);