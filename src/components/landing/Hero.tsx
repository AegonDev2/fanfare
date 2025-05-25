import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import HeroCarousel from './HeroCarousel';
import InfluencerSection from './InfluencerSection';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
export default function Hero() {
  const navigate = useNavigate();
  const {
    data: influencers = []
  } = useQuery({
    queryKey: ['influencers'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('profiles').select('id, name, user_type').eq('user_type', 'influencer').limit(10);
      if (error) throw error;
      return data.map(profile => ({
        id: profile.id,
        name: profile.name || 'Unknown',
        platform: 'Platform',
        profile_image: '',
        followers: Math.floor(Math.random() * 100000) + 10000
      }));
    }
  });
  return <section className="pt-20 pb-4 px-4 bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto">
        

        {/* Hero Carousel */}
        <HeroCarousel />
        
        {/* Influencer Section */}
        <InfluencerSection influencers={influencers} />
      </div>
    </section>;
}