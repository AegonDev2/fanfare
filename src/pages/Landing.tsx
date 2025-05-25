
import React, { useState } from 'react';
import Header from '@/components/landing/Header';
import Hero from '@/components/landing/Hero';
import GiftSection from '@/components/landing/GiftSection';
import MobileDock from '@/components/navigation/MobileDock';

export default function Landing() {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header setNavOpen={setNavOpen} />
      <Hero />
      <GiftSection />
      <MobileDock setNavOpen={setNavOpen} />
    </div>
  );
}
