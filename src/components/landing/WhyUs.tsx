
import { Shield, Clock, Users } from 'lucide-react';

export default function WhyUs() {
  const features = [
    {
      icon: Shield,
      title: "Secure & Trusted",
      description: "All transactions are secure and your data is protected"
    },
    {
      icon: Clock,
      title: "Fast Delivery",
      description: "Quick processing and delivery to your favorite influencers"
    },
    {
      icon: Users,
      title: "Growing Community",
      description: "Join thousands of fans connecting with influencers"
    }
  ];

  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Why Choose FanFare?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                <feature.icon className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
