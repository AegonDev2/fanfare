
import React, { useState } from 'react';
import Header from '@/components/landing/Header';
import Hero from '@/components/landing/Hero';
import InfluencerSection from '@/components/landing/InfluencerSection';
import GiftSection from '@/components/landing/GiftSection';
import HowItWorks from '@/components/landing/HowItWorks';
import WhyUs from '@/components/landing/WhyUs';
import Testimonials from '@/components/landing/Testimonials';
import Footer from '@/components/landing/Footer';
import FAQ from '@/components/landing/FAQ';
import LeaderboardWidget from '@/components/landing/LeaderboardWidget';

export default function Landing() {
  const [navOpen, setNavOpen] = useState(false);

  // Mock influencers data - in a real app this would come from an API
  const mockInfluencers = [
    {
      id: '1',
      name: 'Sarah Johnson',
      platform: 'Instagram',
      profile_image: 'https://images.unsplash.com/photo-1494790108755-2616b612b2fa?w=150&h=150&fit=crop&crop=face',
      followers: 125000
    },
    {
      id: '2', 
      name: 'Mike Chen',
      platform: 'YouTube',
      profile_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      followers: 89000
    },
    {
      id: '3',
      name: 'Emma Davis',
      platform: 'TikTok', 
      profile_image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      followers: 234000
    },
    {
      id: '4',
      name: 'Alex Rivera',
      platform: 'Instagram',
      profile_image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      followers: 167000
    },
    {
      id: '5',
      name: 'Jessica Wu',
      platform: 'YouTube',
      profile_image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
      followers: 301000
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header setNavOpen={setNavOpen} />
      <Hero />
      <InfluencerSection influencers={mockInfluencers} />
      <GiftSection />
      <HowItWorks />
      <WhyUs />
      <Testimonials />
      <FAQ />
      <Footer />
      
      {/* Fixed Leaderboard Widget */}
      <LeaderboardWidget />
    </div>
  );
}
