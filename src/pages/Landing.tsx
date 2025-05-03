import { useEffect, useState } from "react";
import Header from "@/components/landing/Header";
import HeroCarousel from "@/components/landing/HeroCarousel";
import InfluencerSection from "@/components/landing/InfluencerSection";
import GiftSection from "@/components/landing/GiftSection";
import OrderTrackingSection from "@/components/landing/OrderTrackingSection";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
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
  useEffect(() => {
    fetchInfluencers();
  }, []);
  const fetchInfluencers = async () => {
    try {
      console.log("Fetching influencers...");
      setLoading(true);
      const {
        data,
        error
      } = await supabase.from('influencer_profiles').select('*');
      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      console.log("Fetched influencers:", data);
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
  const slides = [{
    src: "https://storage.googleapis.com/a1aa/image/nEyyMJHY73DoGPRrtOSXC1KvCAwbILiKV78pvYqeexs.jpg",
    alt: "Advertisement banner for Sponsor 1 featuring a new product launch"
  }, {
    src: "https://storage.googleapis.com/a1aa/image/M5nq5Hez3ef78AaLPSm-YJrIxUoHWGsaayDw16JqaCE.jpg",
    alt: "Advertisement banner for Sponsor 2 featuring a discount offer"
  }, {
    src: "https://storage.googleapis.com/a1aa/image/Z2Kqw4XzbQzPaXB2LzQB4Rce-FMmCB0pAxCN5JOjxo0.jpg",
    alt: "Advertisement banner for Sponsor 3 featuring a special event"
  }];
  const gifts = [{
    name: "Stylish Handbag",
    price: "$49.99",
    image: "https://storage.googleapis.com/a1aa/image/ti84hphytV7QmWZbpAiDQTtHxz4Qsw7-Wf99DSn3DH8.jpg"
  }, {
    name: "Gaming Headset",
    price: "$79.99",
    image: "https://storage.googleapis.com/a1aa/image/pLNeJ8LcljztHIanr9TuTSpnh7ilkb3zKl3EmL_sAH8.jpg"
  }, {
    name: "Travel Backpack",
    price: "$59.99",
    image: "https://storage.googleapis.com/a1aa/image/3w2Nb6lAZ73GNHF_EsRxGE_8ei1THVU1GsAxp-BQ494.jpg"
  }, {
    name: "Smart Watch",
    price: "$199.99",
    image: "https://images.unsplash.com/photo-1501286353178-1ec881214838"
  }, {
    name: "Wireless Earbuds",
    price: "$129.99",
    image: "https://images.unsplash.com/photo-1469041797191-50ace28483c3"
  }, {
    name: "Digital Camera",
    price: "$399.99",
    image: "https://images.unsplash.com/photo-1582562124811-c09040d0a901"
  }];
  return <div className="min-h-screen w-full bg-gray-100 font-roboto">
      <Header setNavOpen={setNavOpen} />
      
      <div className="pt-16 bg-slate-50">
        <HeroCarousel slides={slides} />
        <main className="container mx-auto sm:px-6 lg:px-8 max-w-7xl py-0 bg-slate-50 px-[53px]">
          {loading ? <div className="text-center py-8">Loading influencers...</div> : influencers.length > 0 ? <InfluencerSection influencers={influencers} /> : <div className="text-center py-8">
              No influencers found. Check back later!
            </div>}
          <GiftSection gifts={gifts} />
          <OrderTrackingSection />
        </main>
        <footer className="bg-white shadow-md mt-8">
          <div className="container mx-auto px-4 py-4 text-center text-gray-600 bg-stone-300">© 2025 FanFare. All rights reserved.</div>
        </footer>
      </div>
    </div>;
};
export default Landing;