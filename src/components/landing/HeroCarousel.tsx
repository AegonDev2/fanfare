import { useEffect, useState, useRef } from "react";
import { CarouselNext, CarouselPrevious, Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { useAdBanners } from "@/hooks/useAdBanners";
import { Skeleton } from "@/components/ui/skeleton";
const HeroCarousel = () => {
  const [isPaused, setIsPaused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
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
    return <div className="relative pb-4 pt-8 mx-1 overflow-hidden my-0 py-[33px]">
        <div className="w-full max-w-5xl mx-auto px-2">
          <Skeleton className="w-full h-64 md:h-80 rounded-2xl" />
        </div>
      </div>;
  }
  if (slides.length === 0) {
    return null;
  }
  return <div className="relative pb-4 pt-8 mx-1 overflow-hidden my-0 py-[33px]">
      <Carousel opts={{
      loop: true,
      align: "center"
    }} className="w-full" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)} ref={carouselRef}>
        <CarouselContent>
          {slides.map((slide, index) => <CarouselItem key={slide.id} className="flex justify-center items-center">
              <div className={cn("w-full max-w-5xl mx-auto px-2 transition-transform duration-500 transform", isTransitioning ? "scale-95 opacity-80" : "scale-100 opacity-100")}>
                <div className="relative aspect-[21/9] overflow-hidden rounded-2xl shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-r from-funky-purple/30 to-funky-pink/30 z-10 opacity-60"></div>
                  <img src={slide.image_url} alt={slide.title} className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-1000" />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 flex flex-col items-start justify-end z-20">
                    <h3 className="text-white text-xl md:text-2xl font-bold mb-2 font-display">
                      {slide.title}
                    </h3>
                    {slide.subtitle && <p className="text-white/80 text-sm md:text-base max-w-lg">
                        {slide.subtitle}
                      </p>}
                  </div>
                </div>
              </div>
            </CarouselItem>)}
        </CarouselContent>

        
        
        <CarouselPrevious onClick={previousSlide} className="left-2 md:left-8 bg-white/20 backdrop-blur-md border-white/10 hover:bg-white/40 text-white" />
        <CarouselNext onClick={nextSlide} className="right-2 md:right-8 bg-white/20 backdrop-blur-md border-white/10 hover:bg-white/40 text-white" />
      </Carousel>
    </div>;
};
export default HeroCarousel;