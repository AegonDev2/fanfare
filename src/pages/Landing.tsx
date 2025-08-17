
import React, { useState } from 'react';
import FloatingHeader from '@/components/ui/floating-header';
import Navbar from '@/components/navigation/Navbar';
import Hero from '@/components/landing/Hero';
import LeaderboardSection from '@/components/landing/LeaderboardSection';
import AndroidLeaderboard from '@/components/landing/AndroidLeaderboard';
import InfluencerSection from '@/components/landing/InfluencerSection';
import GiftSection from '@/components/landing/GiftSection';
import HowItWorks from '@/components/landing/HowItWorks';
import WhyUs from '@/components/landing/WhyUs';
import Testimonials from '@/components/landing/Testimonials';
import Footer from '@/components/landing/Footer';
import FAQ from '@/components/landing/FAQ';
import { useMobileFeatures } from '@/hooks/useMobileFeatures';

export default function Landing() {
  const [navOpen, setNavOpen] = useState(false);
  const { isAndroid } = useMobileFeatures();

  return (
    <>
      <FloatingHeader setNavOpen={setNavOpen} />
      <Navbar isOpen={navOpen} setIsOpen={setNavOpen} />
      <div className="min-h-screen bg-background">
        <Hero />
        {/* Primary Content - Creators & Gifts Front and Center */}
        <div className="container mx-auto px-4 py-4">
          <div className="grid lg:grid-cols-2 gap-4 mb-4">
            <div className="lg:order-1">
              <InfluencerSection />
            </div>
            <div className="lg:order-2">
              <GiftSection />
            </div>
          </div>
        </div>
        {/* Secondary Content */}
        <div className="mb-4">
          {isAndroid ? <AndroidLeaderboard /> : <LeaderboardSection />}
        </div>
        <HowItWorks />
        <WhyUs />
        <Testimonials />
        <FAQ />
        <Footer />
      </div>
    </>
  );
}
