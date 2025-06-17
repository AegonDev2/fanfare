
import React from 'react';
import { Button } from '@/components/ui/button';
import { Gift, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import HeroCarousel from './HeroCarousel';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative pt-16 pb-8 bg-gradient-to-br from-funky-purple/10 via-white to-funky-pink/10 overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Ads Banner as Header */}
        <HeroCarousel />
        
        <div className="text-center max-w-4xl mx-auto mt-8">
          <h1 className="text-3xl md:text-5xl font-bold font-display mb-6 bg-gradient-to-r from-funky-purple to-funky-pink bg-clip-text text-transparent">
            Send Gifts to Your Favorite Influencers
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 mb-8 font-body max-w-3xl mx-auto">
            Connect with influencers through meaningful gifts. Support creators you love and build genuine relationships in the digital space.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-funky-purple to-funky-pink text-white hover:from-funky-purple/90 hover:to-funky-pink/90 transform hover:scale-105 transition-all duration-200"
              onClick={() => navigate('/gift-selection')}
            >
              <Gift className="h-5 w-5 mr-2" />
              Start Gifting
            </Button>
            
            <Button 
              size="lg"
              variant="outline"
              className="border-funky-purple text-funky-purple hover:bg-funky-purple hover:text-white transition-all duration-200"
              onClick={() => navigate('/leaderboard')}
            >
              <Heart className="h-5 w-5 mr-2" />
              Top Fans
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
