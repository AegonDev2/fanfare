
import { Gift, Heart, Star } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      icon: Gift,
      title: "Choose a Gift",
      description: "Browse our curated selection of gifts perfect for influencers"
    },
    {
      icon: Heart,
      title: "Select Influencer",
      description: "Pick your favorite influencer from our community"
    },
    {
      icon: Star,
      title: "Send with Love",
      description: "Add a personal message and send your gift"
    }
  ];

  return (
    <section className="py-16 px-4 bg-white">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                <step.icon className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
