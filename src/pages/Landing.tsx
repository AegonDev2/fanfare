import { useEffect, useState } from "react";
import HeroCarousel from "@/components/landing/HeroCarousel";
import InfluencerSection from "@/components/landing/InfluencerSection";
import GiftSection from "@/components/landing/GiftSection";
import OrderTrackingSection from "@/components/landing/OrderTrackingSection";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Music, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LandingProps {
  setNavOpen: (isOpen: boolean) => void;
}

const Landing = ({
  setNavOpen
}: LandingProps) => {
  const { toast } = useToast();
  const [influencers, setInfluencers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);

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
      const { data, error } = await supabase.from('influencer_profiles').select('*');
      
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

  const slides = [
    {
      src: "https://storage.googleapis.com/a1aa/image/nEyyMJHY73DoGPRrtOSXC1KvCAwbILiKV78pvYqeexs.jpg",
      alt: "Connect with Your Favorite Creators"
    }, 
    {
      src: "https://storage.googleapis.com/a1aa/image/M5nq5Hez3ef78AaLPSm-YJrIxUoHWGsaayDw16JqaCE.jpg",
      alt: "Send Meaningful Gifts That Make an Impact"
    }, 
    {
      src: "https://storage.googleapis.com/a1aa/image/Z2Kqw4XzbQzPaXB2LzQB4Rce-FMmCB0pAxCN5JOjxo0.jpg",
      alt: "Join the FanFare Community Today"
    }
  ];

  const gifts = [
    {
      name: "Stylish Handbag",
      price: "₹1,499",
      image: "https://storage.googleapis.com/a1aa/image/ti84hphytV7QmWZbpAiDQTtHxz4Qsw7-Wf99DSn3DH8.jpg"
    }, 
    {
      name: "Gaming Headset",
      price: "₹2,999",
      image: "https://storage.googleapis.com/a1aa/image/pLNeJ8LcljztHIanr9TuTSpnh7ilkb3zKl3EmL_sAH8.jpg"
    }, 
    {
      name: "Travel Backpack",
      price: "₹1,799",
      image: "https://storage.googleapis.com/a1aa/image/3w2Nb6lAZ73GNHF_EsRxGE_8ei1THVU1GsAxp-BQ494.jpg"
    }, 
    {
      name: "Smart Watch",
      price: "₹3,999",
      image: "https://images.unsplash.com/photo-1501286353178-1ec881214838"
    }, 
    {
      name: "Wireless Earbuds",
      price: "₹1,999",
      image: "https://images.unsplash.com/photo-1469041797191-50ace28483c3"
    }, 
    {
      name: "Digital Camera",
      price: "₹11,999",
      image: "https://images.unsplash.com/photo-1582562124811-c09040d0a901"
    }
  ];

  return (
    <div className="min-h-screen w-full">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl pt-4 pb-24">
        <HeroCarousel slides={slides} />
        
        <div className="mt-12 space-y-12">
          {loading ? (
            <div className="text-center py-12 animate-pulse">
              <div className="w-20 h-20 bg-funky-purple/20 rounded-full mx-auto mb-4 animate-bounce-subtle"></div>
              <p className="text-gray-600 dark:text-gray-300">Loading amazing creators...</p>
            </div>
          ) : influencers.length > 0 ? (
            <div className="transition-all duration-500 transform">
              <InfluencerSection influencers={influencers} />
            </div>
          ) : (
            <div className="text-center py-12 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-funky-purple/10 shadow-lg">
              <div className="w-20 h-20 flex items-center justify-center bg-funky-purple/10 rounded-full mx-auto mb-4">
                <Music className="h-8 w-8 text-funky-purple" />
              </div>
              <h3 className="text-xl font-semibold mb-2 font-display">No creators found</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">Check back later for amazing influencers!</p>
              <Button 
                variant="outline"
                className="border-funky-purple text-funky-purple hover:bg-funky-purple/10"
                onClick={() => window.location.reload()}
              >
                Refresh
              </Button>
            </div>
          )}
          
          <div className="transition-all duration-500 transform" style={{ animationDelay: "200ms" }}>
            <GiftSection gifts={gifts} />
          </div>
          
          <div className="transition-all duration-500 transform" style={{ animationDelay: "400ms" }}>
            <OrderTrackingSection />
          </div>
        </div>
        
        <footer className="mt-20 text-center">
          <div className="mb-4 flex items-center justify-center">
            <div className="relative">
              <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg border border-funky-purple/20 z-10 relative">
                <div className="text-2xl">🎁</div>
              </div>
              <div className="absolute inset-0 bg-funky-purple/30 rounded-full blur-md animate-pulse-glow"></div>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">© 2025 FanFare. All rights reserved.</p>
          <div className="mt-2 flex items-center justify-center text-xs text-gray-500 dark:text-gray-500">
            <span>Made with</span>
            <Heart className="h-3 w-3 mx-1 text-funky-pink" />
            <span>for creators and fans</span>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Landing;
