import { useEffect, useState, useRef } from "react";
import { CarouselNext, CarouselPrevious, Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
interface Slide {
  src: string;
  alt: string;
}
interface HeroCarouselProps {
  slides: Slide[];
}
const HeroCarousel = ({
  slides
}: HeroCarouselProps) => {
  const [isPaused, setIsPaused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const gotoSlide = (index: number) => {
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 500);
  };
  const nextSlide = () => {
    const newIndex = (currentIndex + 1) % slides.length;
    gotoSlide(newIndex);
  };
  const previousSlide = () => {
    const newIndex = (currentIndex - 1 + slides.length) % slides.length;
    gotoSlide(newIndex);
  };
  useEffect(() => {
    if (!isPaused) {
      const interval = setInterval(() => {
        nextSlide();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isPaused, currentIndex, slides.length]);
  return <div className="relative pb-4 pt-8 mx-1 overflow-hidden my-0 py-[2px]">
      <Carousel opts={{
      loop: true,
      align: "center"
    }} className="w-full" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)} ref={carouselRef}>
        <CarouselContent>
          {slides.map((slide, index) => <CarouselItem key={index} className="flex justify-center items-center">
              <div className={cn("w-full max-w-5xl mx-auto px-2 transition-transform duration-500 transform", isTransitioning ? "scale-95 opacity-80" : "scale-100 opacity-100")}>
                <div className="relative aspect-[21/9] overflow-hidden rounded-2xl shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-r from-funky-purple/30 to-funky-pink/30 z-10 opacity-60"></div>
                  <img src={slide.src} alt={slide.alt} className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-1000" />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 flex flex-col items-start justify-end z-20">
                    <h3 className="text-white text-xl md:text-2xl font-bold mb-2 font-display">
                      {slide.alt}
                    </h3>
                    <p className="text-white/80 text-sm md:text-base max-w-lg">
                      Discover amazing creators and gifts on FanFare
                    </p>
                  </div>
                </div>
              </div>
            </CarouselItem>)}
        </CarouselContent>

        <div className="absolute z-20 bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {slides.map((_, i) => <button key={i} className={`w-3 h-3 rounded-full transition-all ${i === currentIndex ? "bg-white w-6" : "bg-white/50 hover:bg-white/80"}`} onClick={() => gotoSlide(i)} aria-label={`Go to slide ${i + 1}`} />)}
        </div>
        
        <CarouselPrevious onClick={previousSlide} className="left-2 md:left-8 bg-white/20 backdrop-blur-md border-white/10 hover:bg-white/40 text-white" />
        <CarouselNext onClick={nextSlide} className="right-2 md:right-8 bg-white/20 backdrop-blur-md border-white/10 hover:bg-white/40 text-white" />
      </Carousel>
    </div>;
};
export default HeroCarousel;