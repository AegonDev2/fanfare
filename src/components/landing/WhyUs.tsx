
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Heart, Zap, Users } from 'lucide-react';

export default function WhyUs() {
  const features = [
    {
      icon: Shield,
      title: "Secure & Trusted",
      description: "Your payments and personal information are always protected"
    },
    {
      icon: Heart,
      title: "Personal Connection",
      description: "Build meaningful relationships with your favorite creators"
    },
    {
      icon: Zap,
      title: "Instant Delivery",
      description: "Fast processing and delivery to bring joy quickly"
    },
    {
      icon: Users,
      title: "Community Driven",
      description: "Join thousands of fans supporting their favorite influencers"
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Why Choose Us?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="text-center h-full">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-500 rounded-lg flex items-center justify-center mb-3">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
