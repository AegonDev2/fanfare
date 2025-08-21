import React from 'react';
import IntersectionObserver from '@/components/performance/IntersectionObserver';
import InfluencerSection from './InfluencerSection';
import { Skeleton } from '@/components/ui/skeleton';

const ConditionalInfluencers = () => {
  return (
    <IntersectionObserver threshold={0.1} rootMargin="100px">
      {(inView) => (
        inView ? (
          <InfluencerSection />
        ) : (
          <section className="mb-4 relative py-[3px] my-0 px-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2 gap-2 mx-1">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-8 w-24" />
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="aspect-square rounded-xl" />
                ))}
              </div>
            </div>
          </section>
        )
      )}
    </IntersectionObserver>
  );
};

export default ConditionalInfluencers;