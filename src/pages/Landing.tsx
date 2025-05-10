import { useEffect, useState } from "react";
import Header from "@/components/landing/Header";
import HeroCarousel from "@/components/landing/HeroCarousel";
import InfluencerSection from "@/components/landing/InfluencerSection";
import GiftSection from "@/components/landing/GiftSection";
import OrderTrackingSection from "@/components/landing/OrderTrackingSection";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Music, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import TopFansWidget from "@/components/leaderboard/TopFansWidget";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { useIsMobile } from "@/hooks/use-mobile";
interface LandingProps {
  setNavOpen: (isOpen: boolean) => void;
}
const Landing = ({
  setNavOpen
}: LandingProps) => {
  const {
    toast
  } = useToast();
  const [influencers, setInfluencers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);
  const isMobile = useIsMobile();
  const {
    leaderboard,
    isLoading: isLeaderboardLoading,
    currentMonth,
    currentYear
  } = useLeaderboard();
  useEffect(() => {
    fetchInfluencers();
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const fetchInfluencers = async () => {
    try {
      setLoading(true);
      const {
        data,
        error
      } = await supabase.from('influencer_profiles').select('*');
      if (error) {
        throw error;
      }
      setInfluencers(data || []);
    } catch (error: any) {
      console.error('Error fetching influencers:', error);
      toast({
        title: "Error",
        description: "Failed to load influencers",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  return <div className="min-h-screen w-full">
      {/* Include the Header component at the top */}
      <Header setNavOpen={setNavOpen} />
      
      <main className="w-full px-2 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-16 sm:pb-24 bg-gray-50">
        <HeroCarousel />
        
        <div className="mt-4 sm:mt-8 space-y-4 sm:space-y-8">
          {/* Top Fans Widget - Positioned above influencers */}
          <div className="w-full px-1 sm:px-0">
            <TopFansWidget topFans={leaderboard} isLoading={isLeaderboardLoading} month={currentMonth} year={currentYear} />
          </div>

          {loading ? <div className="text-center py-4 sm:py-8 animate-pulse">
              <div className="w-12 sm:w-20 h-12 sm:h-20 bg-funky-purple/20 rounded-full mx-auto mb-3 animate-bounce-subtle"></div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Loading amazing creators...</p>
            </div> : influencers.length > 0 ? <div className="transition-all duration-500 transform">
              <InfluencerSection influencers={influencers} />
            </div> : <div className="text-center py-4 sm:py-8 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-funky-purple/10 shadow-lg mx-1 sm:mx-2">
              <div className="w-12 sm:w-20 h-12 sm:h-20 flex items-center justify-center bg-funky-purple/10 rounded-full mx-auto mb-3">
                <Music className="h-5 sm:h-8 w-5 sm:w-8 text-funky-purple" />
              </div>
              <h3 className="text-base sm:text-xl font-semibold mb-2 font-display">No creators found</h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-3 px-2 sm:px-4">Check back later for amazing influencers!</p>
              <Button variant="outline" size={isMobile ? "sm" : "default"} className="border-funky-purple text-funky-purple hover:bg-funky-purple/10" onClick={() => window.location.reload()}>
                Refresh
              </Button>
            </div>}
          
          <div className="transition-all duration-500 transform">
            <GiftSection />
          </div>
          
          <div className="transition-all duration-500 transform">
            <OrderTrackingSection />
          </div>
        </div>
        
        <footer className="mt-8 sm:mt-16 text-center pb-16">
          <div className="mb-3 flex items-center justify-center">
            <div className="relative">
              <div className="w-8 sm:w-12 h-8 sm:h-12 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg border border-funky-purple/20 z-10 relative">
                <div className="text-lg sm:text-2xl">🎁</div>
              </div>
              <div className="absolute inset-0 bg-funky-purple/30 rounded-full blur-md animate-pulse-glow"></div>
            </div>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">© 2025 FanFare. All rights reserved.</p>
          <div className="mt-1 flex items-center justify-center text-[10px] text-gray-500 dark:text-gray-500">
            <span>Made with</span>
            <Heart className="h-2.5 w-2.5 mx-1 text-funky-pink" />
            <span>for creators and fans</span>
          </div>
        </footer>
      </main>
    </div>;
};
export default Landing;