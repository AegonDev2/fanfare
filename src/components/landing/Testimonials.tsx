
import React from 'react';
import { CircularTestimonials } from './CircularTestimonials';
import { TestimonialForm } from '../testimonials/TestimonialForm';
import { useTestimonials } from '@/hooks/useTestimonials';

const Testimonials = () => {
  const { testimonials, loading } = useTestimonials();

  // Convert database testimonials to CircularTestimonials format
  const formattedTestimonials = testimonials.map(testimonial => ({
    quote: testimonial.message,
    name: testimonial.name,
    designation: testimonial.role,
    src: testimonial.avatar_url || "/placeholder.svg"
  }));

  // Fallback testimonials if no database testimonials or loading
  const fallbackTestimonials = [
    {
      quote: "This platform has completely changed how I connect with my fans. The gifts I receive are so thoughtful and meaningful!",
      name: "Sarah Chen",
      designation: "Content Creator",
      src: "/placeholder.svg"
    },
    {
      quote: "I love seeing my fans on the leaderboard. It's created such a fun community around my content!",
      name: "Mike Rodriguez", 
      designation: "Gaming Streamer",
      src: "/placeholder.svg"
    },
    {
      quote: "The wishlist feature is amazing. My supporters know exactly what would make me happy, and I get such personal gifts.",
      name: "Emma Johnson",
      designation: "Lifestyle Blogger", 
      src: "/placeholder.svg"
    }
  ];

  const displayTestimonials = loading || formattedTestimonials.length === 0 
    ? fallbackTestimonials 
    : formattedTestimonials;

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-display mb-4 bg-gradient-to-r from-funky-purple to-funky-pink bg-clip-text text-transparent">
            What People Say
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-body mb-6">
            Hear from influencers and fans who are building amazing connections on our platform
          </p>
          <TestimonialForm />
        </div>

        <div className="flex justify-center">
          <CircularTestimonials 
            testimonials={displayTestimonials}
            autoplay={true}
            colors={{
              name: "hsl(var(--foreground))",
              designation: "hsl(var(--muted-foreground))",
              testimony: "hsl(var(--foreground))",
              arrowBackground: "hsl(var(--primary))",
              arrowForeground: "hsl(var(--primary-foreground))",
              arrowHoverBackground: "hsl(var(--primary) / 0.8)"
            }}
          />
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
