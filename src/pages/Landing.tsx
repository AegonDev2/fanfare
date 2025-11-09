
import React, { useState, useEffect } from 'react';
import FloatingHeader from '@/components/ui/floating-header';
import Navbar from '@/components/navigation/Navbar';
import Hero from '@/components/landing/Hero';
import ConditionalLeaderboard from '@/components/landing/ConditionalLeaderboard';
import AndroidLeaderboard from '@/components/landing/AndroidLeaderboard';
import ConditionalInfluencers from '@/components/landing/ConditionalInfluencers';
import GiftSection from '@/components/landing/GiftSection';
import HowItWorks from '@/components/landing/HowItWorks';
import WhyUs from '@/components/landing/WhyUs';
import Testimonials from '@/components/landing/Testimonials';
import Footer from '@/components/landing/Footer';
import FAQ from '@/components/landing/FAQ';
import { useMobileFeatures } from '@/hooks/useMobileFeatures';
import { AuthGuard } from '@/components/navigation/AuthGuard';
import MobileDock from '@/components/navigation/MobileDock';
import { usePreloadData, useBackgroundRefresh } from '@/hooks/usePreloadData';
import { useProactiveDataLoader } from '@/hooks/useProactiveDataLoader';
import { useOptimizedAuth } from '@/hooks/useOptimizedAuth';

export default function Landing() {
  const [navOpen, setNavOpen] = useState(false);
  const { isAndroid } = useMobileFeatures();
  const { user } = useOptimizedAuth();
  
  // Only preload lightweight static data
  usePreloadData();
  useBackgroundRefresh();
  
  // Don't preload heavy data upfront - let lazy loading and React Query handle it
  // Materialized views make queries fast enough that preloading is unnecessary

  return (
    <AuthGuard>
      <FloatingHeader setNavOpen={setNavOpen} />
      <Navbar isOpen={navOpen} setIsOpen={setNavOpen} />
      <div className="min-h-screen bg-background">
        <Hero />
        {/* Primary Content - Creators & Gifts Front and Center */}
        <div className="container mx-auto px-4 py-4 space-y-6">
          <ConditionalInfluencers />
          <GiftSection />
        </div>
        {/* Secondary Content */}
        <div className="mb-4">
          {isAndroid ? <AndroidLeaderboard /> : <ConditionalLeaderboard />}
        </div>
        <HowItWorks />
        <WhyUs />
        <Testimonials />
        <FAQ />
        <Footer />
      </div>
      <MobileDock navOpen={navOpen} />
    </AuthGuard>
  );
}
