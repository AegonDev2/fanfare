
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

interface Slide {
  src: string;
  alt: string;
}

interface HeroCarouselProps {
  slides: Slide[];
}

const HeroCarousel = ({ slides }: HeroCarouselProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="container mx-auto px-4 py-4">
      <div className="relative w-full overflow-hidden rounded-lg shadow-lg h-64">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute w-full h-full transition-opacity duration-500 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={slide.src}
              alt={slide.alt}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
        <Button
          variant="secondary"
          className="absolute top-1/2 left-4 -translate-y-1/2 rounded-full p-2"
          onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
        >
          <i className="fas fa-chevron-left"></i>
        </Button>
        <Button
          variant="secondary"
          className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full p-2"
          onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
        >
          <i className="fas fa-chevron-right"></i>
        </Button>
      </div>
    </div>
  );
};

export default HeroCarousel;
