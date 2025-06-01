
import React, { useState } from 'react';
import Header from '@/components/landing/Header';
import GiftSection from '@/components/landing/GiftSection';

export default function Landing() {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header setNavOpen={setNavOpen} />
      <GiftSection />
    </div>
  );
}
