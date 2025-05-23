
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gift, User, ShoppingCart } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      icon: Gift,
      title: "Choose a Gift",
      description: "Browse our curated selection of gifts or pick from an influencer's wishlist"
    },
    {
      icon: User,
      title: "Select Influencer",
      description: "Choose your favorite creator and add a personal message"
    },
    {
      icon: ShoppingCart,
      title: "Send & Enjoy",
      description: "Complete your order and watch your gift bring joy to your favorite creator"
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <Card key={index} className="text-center">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-500 rounded-full flex items-center justify-center mb-4">
                  <step.icon className="h-8 w-8 text-white" />
                </div>
                <CardTitle>{step.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
