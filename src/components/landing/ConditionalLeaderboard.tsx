import React from 'react';
import { IntersectionObserverWrapper } from '@/components/performance/IntersectionObserver';
import LeaderboardSection from './LeaderboardSection';
import { Skeleton } from '@/components/ui/skeleton';

const ConditionalLeaderboard = () => {
  return (
    <IntersectionObserverWrapper threshold={0.1} rootMargin="100px">
      <LeaderboardSection />
    </IntersectionObserverWrapper>
  );
};

export default ConditionalLeaderboard;