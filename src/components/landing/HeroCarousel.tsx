
import { useEffect, useState, useRef } from "react";
import { CarouselNext, CarouselPrevious, Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { useAdBanners } from "@/hooks/useAdBanners";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";

const HeroCarousel = () => {
  const [isPaused, setIsPaused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  
  const {
    data: slides = [],
    isLoading
  } = useAdBanners();

  const gotoSlide = (index: number) => {
    if (slides.length === 0) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const nextSlide = () => {
    if (slides.length === 0) return;
    const newIndex = (currentIndex + 1) % slides.length;
    gotoSlide(newIndex);
  };

  const previousSlide = () => {
    if (slides.length === 0) return;
    const newIndex = (currentIndex - 1 + slides.length) % slides.length;
    gotoSlide(newIndex);
  };

  useEffect(() => {
    if (!isPaused && slides.length > 0) {
      const interval = setInterval(() => {
        nextSlide();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isPaused, currentIndex, slides.length]);

  if (isLoading) {
    return (
      <div className="relative pb-2 pt-2 sm:pb-4 sm:pt-6 mx-0 overflow-hidden">
        <div className="w-full max-w-5xl mx-auto px-1">
          <Skeleton className="w-full h-40 sm:h-64 md:h-80 rounded-lg" />
        </div>
      </div>
    );
  }

  if (slides.length === 0) {
    return null;
  }

  return (
    <div className="relative pb-2 pt-2 sm:pb-4 sm:pt-6 mx-0 overflow-hidden">
      <Carousel 
        opts={{
          loop: true,
          align: "center"
        }} 
        className="w-full" 
        onMouseEnter={() => setIsPaused(true)} 
        onMouseLeave={() => setIsPaused(false)} 
        ref={carouselRef}
      >
        <CarouselContent>
          {slides.map((slide) => (
            <CarouselItem key={slide.id} className="flex justify-center items-center">
              <div className={cn(
                "w-full max-w-5xl mx-auto px-1 transition-transform duration-500 transform", 
                isTransitioning ? "scale-95 opacity-80" : "scale-100 opacity-100"
              )}>
                <div className="relative aspect-[16/9] overflow-hidden rounded-lg shadow-md">
                  <div className="absolute inset-0 bg-gradient-to-r from-funky-purple/30 to-funky-pink/30 z-10 opacity-60"></div>
                  <img 
                    src={slide.image_url} 
                    alt={slide.title} 
                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-1000" 
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 sm:p-4 flex flex-col items-start justify-end z-20">
                    <h3 className="text-white text-sm sm:text-lg font-bold mb-0.5 sm:mb-1 font-display">
                      {slide.title}
                    </h3>
                    {slide.subtitle && (
                      <p className="text-white/80 text-xs max-w-lg line-clamp-2">
                        {slide.subtitle}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        <CarouselPrevious 
          onClick={previousSlide} 
          className="left-1 h-6 w-6 bg-white/20 backdrop-blur-md border-white/10 hover:bg-white/40 text-white" 
        />
        <CarouselNext 
          onClick={nextSlide} 
          className="right-1 h-6 w-6 bg-white/20 backdrop-blur-md border-white/10 hover:bg-white/40 text-white" 
        />
      </Carousel>
    </div>
  );
};

export default HeroCarousel;
