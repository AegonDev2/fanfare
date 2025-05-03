import { useEffect, useState } from "react";
import { CarouselNext, CarouselPrevious, Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
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
  useEffect(() => {
    if (!isPaused) {
      const interval = setInterval(() => {
        // Auto-advance handled by carousel component
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isPaused]);
  return <div className="relative pb-4 pt-8 bg-slate-100 py-0 my-[21px] mx-[7px] px-0">
      <Carousel opts={{
      loop: true,
      align: "center"
    }} className="w-full" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
        <CarouselContent>
          {slides.map((slide, index) => <CarouselItem key={index} className="flex justify-center items-center px-0 py-0">
              <div className="w-full max-w-4xl mx-auto px-[8px]">
                <div className="relative aspect-[21/9] overflow-hidden rounded-lg shadow-md">
                  <img src={slide.src} alt={slide.alt} className="w-full h-full object-fill" />
                </div>
              </div>
            </CarouselItem>)}
        </CarouselContent>
        <CarouselPrevious className="left-4" />
        <CarouselNext className="right-4" />
      </Carousel>
    </div>;
};
export default HeroCarousel;