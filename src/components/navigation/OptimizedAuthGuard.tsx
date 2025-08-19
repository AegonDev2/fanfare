import React, { memo } from 'react';
import { useSimpleAuth } from '@/contexts/SimpleAuthContext';
import { Skeleton } from '@/components/ui/skeleton';

interface OptimizedAuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAuth?: boolean;
}

const AuthGuardSkeleton = memo(() => (
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
));

AuthGuardSkeleton.displayName = 'AuthGuardSkeleton';

export const OptimizedAuthGuard = memo<OptimizedAuthGuardProps>(({ 
  children, 
  fallback = <AuthGuardSkeleton />,
  requireAuth = true
}) => {
  const { isLoading, isAuthenticated, error } = useSimpleAuth();

  // Show loading state
  if (isLoading) {
    return <>{fallback}</>;
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-semibold text-destructive">Authentication Error</h2>
          <p className="text-muted-foreground">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Check auth requirement
  if (requireAuth && !isAuthenticated) {
    // Redirect to auth page
    window.location.href = '/auth';
    return <>{fallback}</>;
  }

  return <>{children}</>;
});

OptimizedAuthGuard.displayName = 'OptimizedAuthGuard';