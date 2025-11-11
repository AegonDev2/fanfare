import React from 'react';
import { IntersectionObserverWrapper } from '@/components/performance/IntersectionObserver';
import InfluencerSection from './InfluencerSection';
import { Skeleton } from '@/components/ui/skeleton';

const ConditionalInfluencers = () => {
  return (
    <IntersectionObserverWrapper threshold={0.1} rootMargin="100px">
      <InfluencerSection />
    </IntersectionObserverWrapper>
  );
};

export default ConditionalInfluencers;