import React from 'react';
import { Button } from '@/components/ui/button';
import { Gift, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import HeroCarousel from './HeroCarousel';
import { useAdmin } from '@/hooks/useAdmin';
const Hero = () => {
  const navigate = useNavigate();
  const {
    userRole,
    isCheckingRole
  } = useAdmin();
  return <section className="relative pt-16 pb-8 bg-gradient-to-br from-funky-purple/10 via-white to-funky-pink/10 overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Ads Banner as Header */}
        <HeroCarousel />
        
        <div className="text-center max-w-4xl mx-auto mt-8">
          <h1 className="md:text-4xl lg:text-5xl font-bold font-display mb-4 md:mb-6 bg-gradient-to-r from-funky-purple to-funky-pink bg-clip-text text-transparent text-lg">Real Gifts. Real Connections. Real Appreciation.</h1>
          
          
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="bg-gradient-to-r from-funky-purple to-funky-pink text-white hover:from-funky-purple/90 hover:to-funky-pink/90 transform hover:scale-105 transition-all duration-200 text-sm md:text-base px-6 md:px-8" onClick={() => navigate('/gift-shop')}>
              <Gift className="h-4 w-4 md:h-5 md:w-5 mr-2" />
              Send Super Gift
            </Button>
            
            {/* Admin Dashboard Button - Only visible to admins */}
            {!isCheckingRole && userRole === 'admin' && <Button size="lg" variant="outline" className="border-funky-purple text-funky-purple hover:bg-funky-purple hover:text-white transform hover:scale-105 transition-all duration-200 text-sm md:text-base px-6 md:px-8" onClick={() => navigate('/admin')}>
                <Settings className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                Admin Dashboard
              </Button>}
          </div>
        </div>
      </div>
    </section>;
};
export default Hero;