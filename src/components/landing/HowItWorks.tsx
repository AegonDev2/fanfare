
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Gift, Heart, Sparkles } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      icon: Search,
      title: "Discover Influencers",
      description: "Browse through profiles of your favorite content creators and see their wishlists.",
      color: "text-funky-blue"
    },
    {
      icon: Gift,
      title: "Choose a Gift",
      description: "Select from curated gift options or pick something special from their wishlist.",
      color: "text-funky-purple"
    },
    {
      icon: Heart,
      title: "Send with Love",
      description: "Add a personal message and send your gift directly to the influencer.",
      color: "text-funky-pink"
    },
    {
      icon: Sparkles,
      title: "Build Connections",
      description: "Watch your relationship grow and climb the fan leaderboard.",
      color: "text-funky-orange"
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-display mb-4 bg-gradient-to-r from-funky-purple to-funky-pink bg-clip-text text-transparent">
            How It Works
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto font-body">
            Simple steps to connect with your favorite influencers through meaningful gifts
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <Card key={index} className="relative border-2 border-gray-100 hover:border-funky-purple/20 transition-all duration-300 hover:shadow-lg group">
              <CardContent className="p-6 text-center">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-white border-2 border-gray-100 rounded-full p-3 group-hover:border-funky-purple/20 transition-all duration-300">
                    <step.icon className={`h-8 w-8 ${step.color}`} />
                  </div>
                </div>
                
                <div className="pt-6">
                  <div className="text-sm font-semibold text-funky-purple mb-2">
                    Step {index + 1}
                  </div>
                  <h3 className="text-xl font-semibold font-display mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 font-body">
                    {step.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
