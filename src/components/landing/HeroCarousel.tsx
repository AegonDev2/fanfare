import { useEffect, useState, useCallback, memo } from "react";
import { CarouselNext, CarouselPrevious, Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { useAdBanners } from "@/hooks/useAdBanners";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import OptimizedImage from "@/components/common/OptimizedImage";
const HeroCarousel = memo(() => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const isMobile = useIsMobile();
  const {
    data: slides = [],
    isLoading
  } = useAdBanners();

  // Process image URLs to handle Google Drive links
  const processedSlides = slides.map(slide => {
    let processedImageUrl = slide.image_url;

    // Convert Google Drive view links to direct download links
    if (slide.image_url.includes('drive.google.com')) {
      const fileIdMatch = slide.image_url.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (fileIdMatch) {
        const fileId = fileIdMatch[1];
        processedImageUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
      }
    }
    return {
      ...slide,
      image_url: processedImageUrl
    };
  });
  useEffect(() => {
    if (!api) return;
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);
  const scrollTo = useCallback((index: number) => {
    api?.scrollTo(index);
  }, [api]);
  if (isLoading) {
    return <div className="relative pb-2 pt-2 sm:pb-4 sm:pt-6 mx-0 overflow-hidden">
        <div className="w-full max-w-3xl lg:max-w-2xl mx-auto px-1">
          <Skeleton className="w-full h-32 sm:h-48 lg:h-40 rounded-lg" />
        </div>
      </div>;
  }

  // Show carousel even if no slides - helps with debugging
  if (!slides || processedSlides.length === 0) {
    console.log('No ad banner slides available:', {
      slides,
      processedSlides
    });
    return null;
  }
  return <div className="relative pb-2 pt-2 sm:pb-4 sm:pt-6 mx-0 overflow-hidden">
      <Carousel setApi={setApi} opts={{
      loop: true,
      align: "center"
    }} className="w-full max-w-3xl lg:max-w-2xl mx-auto relative">
        <CarouselContent>
          {processedSlides.map(slide => <CarouselItem key={slide.id} className="flex justify-center items-center">
              <div className="py-0 my-[15px] w-full">
                <div className="relative aspect-[16/9] overflow-hidden rounded-lg shadow-md">
                  <div className="absolute inset-0 bg-gradient-to-r from-funky-purple/30 to-funky-pink/30 z-10 opacity-60"></div>
                  <OptimizedImage src={slide.image_url} alt={slide.title} className="w-full h-full transform hover:scale-105 transition-transform duration-1000" onError={() => console.error('Failed to load image:', slide.image_url)} />
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
            </CarouselItem>)}
        </CarouselContent>
        
        {/* Navigation Buttons - Hide on mobile/Android */}
        {processedSlides.length > 1 && !isMobile && <>
            <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 z-30 bg-white/80 hover:bg-white text-black border-0 h-8 w-8 rounded-md shadow-lg" />
            <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 z-30 bg-white/80 hover:bg-white text-black border-0 h-8 w-8 rounded-md shadow-lg" />
          </>}

        {/* Slide Indicators */}
        {processedSlides.length > 1 && <div className="flex justify-center gap-2 mt-2">
            {processedSlides.map((_, index) => {})}
          </div>}
      </Carousel>
    </div>;
});
HeroCarousel.displayName = 'HeroCarousel';
export default HeroCarousel;