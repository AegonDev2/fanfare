
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Quote } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Testimonials = () => {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Content Creator",
      avatar: "/placeholder.svg",
      rating: 5,
      text: "This platform has completely changed how I connect with my fans. The gifts I receive are so thoughtful and meaningful!"
    },
    {
      name: "Mike Rodriguez",
      role: "Gaming Streamer",
      avatar: "/placeholder.svg",
      rating: 5,
      text: "I love seeing my fans on the leaderboard. It's created such a fun community around my content!"
    },
    {
      name: "Emma Johnson",
      role: "Lifestyle Blogger",
      avatar: "/placeholder.svg",
      rating: 5,
      text: "The wishlist feature is amazing. My supporters know exactly what would make me happy, and I get such personal gifts."
    },
    {
      name: "Alex Kumar",
      role: "Tech Reviewer",
      avatar: "/placeholder.svg",
      rating: 5,
      text: "As a fan, I love being able to support my favorite creators in such a direct and meaningful way. The process is so smooth!"
    },
    {
      name: "Luna Park",
      role: "Art Creator",
      avatar: "/placeholder.svg",
      rating: 5,
      text: "The security and ease of use on this platform is incredible. I feel safe sharing my wishlist and receiving gifts from fans."
    },
    {
      name: "David Thompson",
      role: "Fitness Influencer",
      avatar: "/placeholder.svg",
      rating: 5,
      text: "This has brought my community closer together. Fans love competing on the leaderboard to show their support!"
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-display mb-4 bg-gradient-to-r from-funky-purple to-funky-pink bg-clip-text text-transparent">
            What People Say
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto font-body">
            Hear from influencers and fans who are building amazing connections on our platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-2 border-gray-100 hover:border-funky-purple/20 transition-all duration-300 hover:shadow-lg group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex space-x-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-funky-yellow fill-current" />
                    ))}
                  </div>
                  <Quote className="h-6 w-6 text-funky-purple/30" />
                </div>
                
                <p className="text-gray-600 font-body mb-6 leading-relaxed">
                  "{testimonial.text}"
                </p>
                
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                    <AvatarFallback className="bg-gradient-to-r from-funky-purple to-funky-pink text-white">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold font-display text-gray-900">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
