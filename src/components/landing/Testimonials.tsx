
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';

export default function Testimonials() {
  const testimonials = [
    {
      name: "Sarah Johnson",
      avatar: "/placeholder.svg",
      content: "Amazing platform! I was able to send a thoughtful gift to my favorite YouTuber and they loved it!",
      rating: 5
    },
    {
      name: "Mike Chen",
      avatar: "/placeholder.svg", 
      content: "The process was so smooth and easy. Great way to show appreciation to creators.",
      rating: 5
    },
    {
      name: "Emma Wilson",
      avatar: "/placeholder.svg",
      content: "Love how personal this makes supporting influencers. Highly recommend!",
      rating: 5
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">What Our Users Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={testimonial.avatar} />
                    <AvatarFallback>{testimonial.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <div className="flex gap-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{testimonial.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
