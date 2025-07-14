
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
    if (!isPaused && slides.length > 1) {
      const interval = setInterval(() => {
        nextSlide();
      }, 4000); // Auto-slide every 4 seconds
      return () => clearInterval(interval);
    }
  }, [isPaused, currentIndex, slides.length]);

  if (isLoading) {
    return <div className="relative pb-2 pt-2 sm:pb-4 sm:pt-6 mx-0 overflow-hidden">
        <div className="w-full max-w-3xl lg:max-w-2xl mx-auto px-1">
          <Skeleton className="w-full h-32 sm:h-48 lg:h-40 rounded-lg" />
        </div>
      </div>;
  }

  if (slides.length === 0) {
    return null;
  }

  return <div className="relative pb-2 pt-2 sm:pb-4 sm:pt-6 mx-0 overflow-hidden">
      <Carousel 
        opts={{
          loop: true,
          align: "center"
        }} 
        className="w-full max-w-3xl lg:max-w-2xl mx-auto relative" 
        onMouseEnter={() => setIsPaused(true)} 
        onMouseLeave={() => setIsPaused(false)} 
        ref={carouselRef}
      >
        <CarouselContent>
          {slides.map((slide, index) => (
            <CarouselItem 
              key={slide.id} 
              className={cn(
                "flex justify-center items-center transition-opacity duration-500",
                index === currentIndex ? "opacity-100" : "opacity-0 absolute inset-0"
              )}
            >
              <div className="py-0 my-[15px]">
                <div className="relative aspect-[16/9] overflow-hidden rounded-lg shadow-md">
                  <div className="absolute inset-0 bg-gradient-to-r from-funky-purple/30 to-funky-pink/30 z-10 opacity-60 my-0"></div>
                  <img 
                    src={slide.image_url} 
                    alt={slide.title} 
                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-1000" 
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 sm:p-4 flex flex-col items-start justify-end z-20">
                    <h3 className="text-white text-sm lg:text-sm font-bold mb-0.5 sm:mb-1 font-display">
                      {slide.title}
                    </h3>
                    {slide.subtitle && <p className="text-white/80 text-xs lg:text-xs max-w-lg line-clamp-2">
                        {slide.subtitle}
                      </p>}
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {/* Navigation Buttons - Only show if more than 1 slide */}
        {slides.length > 1 && (
          <>
            <CarouselPrevious 
              onClick={previousSlide}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-30 bg-white/80 hover:bg-white text-black border-0 h-8 w-8 rounded-md shadow-lg"
            />
            <CarouselNext 
              onClick={nextSlide}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-30 bg-white/80 hover:bg-white text-black border-0 h-8 w-8 rounded-md shadow-lg"
            />
          </>
        )}

        {/* Slide Indicators */}
        {slides.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1.5 z-30">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => gotoSlide(index)}
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-all duration-300",
                  index === currentIndex 
                    ? "bg-white scale-125" 
                    : "bg-white/50 hover:bg-white/75"
                )}
              />
            ))}
          </div>
        )}
      </Carousel>
    </div>;
};

export default HeroCarousel;
