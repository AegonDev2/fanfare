
import React, { useState } from 'react';
import Header from '@/components/landing/Header';
import Hero from '@/components/landing/Hero';
import LeaderboardSection from '@/components/landing/LeaderboardSection';
import InfluencerSection from '@/components/landing/InfluencerSection';
import GiftSection from '@/components/landing/GiftSection';
import HowItWorks from '@/components/landing/HowItWorks';
import WhyUs from '@/components/landing/WhyUs';
import Testimonials from '@/components/landing/Testimonials';
import Footer from '@/components/landing/Footer';
import FAQ from '@/components/landing/FAQ';

export default function Landing() {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header setNavOpen={setNavOpen} />
      <Hero />
      <LeaderboardSection />
      <InfluencerSection />
      <GiftSection />
      <HowItWorks />
      <WhyUs />
      <Testimonials />
      <FAQ />
      <Footer />
    </div>
  );
}
