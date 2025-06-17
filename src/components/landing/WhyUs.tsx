
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Zap, Users, Trophy, Star, Globe } from 'lucide-react';

const WhyUs = () => {
  const features = [
    {
      icon: Shield,
      title: "Secure & Trusted",
      description: "Your payments and personal information are protected with industry-leading security.",
      gradient: "from-funky-blue to-funky-purple"
    },
    {
      icon: Zap,
      title: "Instant Delivery",
      description: "Gifts are processed and delivered quickly to your favorite influencers.",
      gradient: "from-funky-purple to-funky-pink"
    },
    {
      icon: Users,
      title: "Verified Influencers",
      description: "All influencers are verified to ensure authentic connections and real impact.",
      gradient: "from-funky-pink to-funky-orange"
    },
    {
      icon: Trophy,
      title: "Fan Leaderboard",
      description: "Compete with other fans and climb the leaderboard to show your support.",
      gradient: "from-funky-orange to-funky-yellow"
    },
    {
      icon: Star,
      title: "Premium Experience",
      description: "Enjoy a seamless, premium platform designed for meaningful connections.",
      gradient: "from-funky-yellow to-funky-green"
    },
    {
      icon: Globe,
      title: "Global Community",
      description: "Join a worldwide community of fans supporting their favorite creators.",
      gradient: "from-funky-green to-funky-blue"
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-display mb-4 bg-gradient-to-r from-funky-purple to-funky-pink bg-clip-text text-transparent">
            Why Choose Us?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto font-body">
            The most trusted platform for connecting fans with their favorite influencers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/50 backdrop-blur-sm hover:bg-white">
              <CardContent className="p-6">
                <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${feature.gradient} mb-4`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                
                <h3 className="text-xl font-semibold font-display mb-3 group-hover:text-funky-purple transition-colors">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 font-body leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyUs;
