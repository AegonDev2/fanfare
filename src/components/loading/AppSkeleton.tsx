import { Skeleton } from "@/components/ui/skeleton";

export const AppInitializingSkeleton = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Skeleton */}
      <div className="fixed top-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-b z-50">
        <div className="h-16 flex items-center justify-between px-4">
          <Skeleton className="h-8 w-32" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="pt-20 p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Hero section skeleton */}
          <div className="text-center space-y-4 py-12">
            <Skeleton className="h-12 w-64 mx-auto" />
            <Skeleton className="h-6 w-96 mx-auto" />
            <div className="flex justify-center gap-4 mt-6">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>

          {/* Cards grid skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-48 w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const ProfilePageSkeleton = () => {
  return (
    <div className="min-h-screen bg-background pt-20 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile header skeleton */}
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
          <Skeleton className="h-32 w-32 rounded-full" />
          <div className="flex-1 space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-6 w-32" />
            <div className="flex gap-4">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        </div>

        {/* Content sections skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-48 w-full rounded-lg" />
        </div>
        
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    </div>
  );
};

export const LeaderboardPageSkeleton = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-funky-purple via-funky-pink to-funky-blue pt-20 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header skeleton */}
        <div className="text-center space-y-4">
          <Skeleton className="h-10 w-64 mx-auto bg-white/20" />
          <Skeleton className="h-6 w-48 mx-auto bg-white/20" />
        </div>

        {/* Top 3 skeleton */}
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="text-center space-y-3">
              <Skeleton className="h-20 w-20 rounded-full mx-auto bg-white/20" />
              <Skeleton className="h-4 w-24 mx-auto bg-white/20" />
              <Skeleton className="h-6 w-16 mx-auto bg-white/20" />
            </div>
          ))}
        </div>

        {/* List skeleton */}
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 bg-white/10 rounded-lg">
              <Skeleton className="h-12 w-12 rounded-full bg-white/20" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32 bg-white/20" />
                <Skeleton className="h-3 w-24 bg-white/20" />
              </div>
              <Skeleton className="h-6 w-16 bg-white/20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const GiftsListSkeleton = () => {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="p-4 border rounded-lg space-y-3">
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
};