
import { Button } from '@/components/ui/button';
import { Gift, Heart, Star } from 'lucide-react';

export default function Hero() {
  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 py-20">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
          Send Gifts to Your Favorite Influencers
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Connect with creators you love by sending thoughtful gifts directly to them
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-500">
            <Gift className="h-5 w-5 mr-2" />
            Browse Gifts
          </Button>
          <Button size="lg" variant="outline">
            <Heart className="h-5 w-5 mr-2" />
            Find Influencers
          </Button>
        </div>
      </div>
    </div>
  );
}
