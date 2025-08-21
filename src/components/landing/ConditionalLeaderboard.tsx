import React from 'react';
import IntersectionObserver from '@/components/performance/IntersectionObserver';
import LeaderboardSection from './LeaderboardSection';
import { Skeleton } from '@/components/ui/skeleton';

const ConditionalLeaderboard = () => {
  return (
    <IntersectionObserver threshold={0.1} rootMargin="100px">
      {(inView) => (
        inView ? (
          <LeaderboardSection />
        ) : (
          <section className="mb-6 px-4">
            <div className="max-w-6xl mx-auto">
              <div className="bg-gradient-to-br from-white via-purple-50/50 to-pink-50/30 rounded-xl p-6 border border-funky-purple/20">
                <Skeleton className="h-8 w-64 mb-4" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-32 w-full rounded-lg" />
                  ))}
                </div>
              </div>
            </div>
          </section>
        )
      )}
    </IntersectionObserver>
  );
};

export default ConditionalLeaderboard;