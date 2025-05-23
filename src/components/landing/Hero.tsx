
import { Button } from '@/components/ui/button';
import { Gift, Heart, Star } from 'lucide-react';
import HeroCarousel from './HeroCarousel';
import InfluencerSection from './InfluencerSection';

export default function Hero() {
  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 py-8">
      <div className="container mx-auto px-4 text-center">
        <HeroCarousel />
        
        <div className="my-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-funky-purple to-funky-pink">
            Connect With Your Favorite Creators
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Send meaningful gifts and support the content creators you love
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-gradient-to-r from-funky-purple to-funky-pink hover:opacity-90">
              <Gift className="mr-2 h-5 w-5" /> Find a Gift
            </Button>
            <Button size="lg" variant="outline" className="border-funky-purple text-funky-purple hover:bg-funky-purple/10">
              <Heart className="mr-2 h-5 w-5" /> Browse Creators
            </Button>
          </div>
        </div>

        {/* Add the InfluencerSection component below the hero content */}
        <div className="mt-8">
          <InfluencerSection influencers={[
            {
              id: "1",
              name: "Sophia Chen",
              platform: "YouTube",
              profile_image: "https://storage.googleapis.com/a1aa/image/D1krW6jVl-21ilLzLHfta3PvoW1q-CHXfJMeRmNbDdA.jpg",
              followers: 1500000
            },
            {
              id: "2",
              name: "Alex Morgan",
              platform: "Instagram",
              profile_image: "https://storage.googleapis.com/a1aa/image/mOpByDpYWZOCov9XSv8-AMtYh7Ft6i82Zo-XR5iEg7k.jpg",
              followers: 950000
            },
            {
              id: "3",
              name: "Dev Patel",
              platform: "TikTok",
              profile_image: "https://storage.googleapis.com/a1aa/image/quJHL6tZdBhJhbJkNeYiaEqlKpQ6oYYpT0SQXif6ZuQ.jpg",
              followers: 2300000
            },
            {
              id: "4",
              name: "Emma Watson",
              platform: "YouTube",
              profile_image: "https://storage.googleapis.com/a1aa/image/L3zZuw55FqmLm3-XNxlP92e8jZWaubZiHPLCOxhRwJw.jpg",
              followers: 3100000
            }
          ]} />
        </div>
      </div>
    </div>
  );
}
