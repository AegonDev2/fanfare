import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Gift } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { memo } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useGiftItems, GiftItem } from "@/hooks/useGiftItems";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
const GiftCard = memo(({
  gift
}: {
  gift: GiftItem;
}) => {
  const navigate = useNavigate();
  const [isHovering, setIsHovering] = useState(false);
  const handleGiftClick = useCallback(() => {
    navigate(`/gift-selection?gift=${encodeURIComponent(gift.id)}`);
  }, [navigate, gift.id]);
  return <div className="relative p-2 h-full rounded-xl overflow-hidden transition-all duration-300 transform group" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
      <div className="absolute inset-0 bg-gradient-to-tr from-funky-purple/5 to-funky-pink/5 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg transition-all duration-500 z-0 group-hover:bg-gradient-to-tr group-hover:from-funky-purple/10 group-hover:to-funky-pink/10 bg-emerald-950"></div>
      
      <div className="relative z-10">
        <div className={cn("w-full aspect-square mb-2 overflow-hidden rounded-lg transition-all duration-500", isHovering ? "shadow-lg shadow-funky-purple/20" : "")}>
          <img src={gift.image_url} alt={gift.name} loading="lazy" className={cn("w-full h-full object-cover transition-all duration-500", isHovering ? "scale-110" : "scale-100")} />
        </div>
        
        <div className="mt-1 relative">
          <h3 className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate font-display">{gift.name}</h3>
          <p className="text-xs text-funky-purple font-medium">₹{gift.price}</p>
          <Button size="sm" onClick={handleGiftClick} className={cn("mt-1 w-full text-[10px] py-1 px-2 transition-all duration-300", "bg-gradient-to-r from-funky-purple to-funky-pink text-white hover:shadow-lg hover:shadow-funky-purple/20")}>
            <Gift className="h-3 w-3 mr-1" />
            Gift This
          </Button>
        </div>
      </div>
    </div>;
});
GiftCard.displayName = "GiftCard";
const GiftSection = () => {
  const {
    data: gifts = [],
    isLoading
  } = useGiftItems();
  const [searchValue, setSearchValue] = useState("");
  const carouselRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Using useMemo to filter gifts to prevent unnecessary re-renders
  const filteredGifts = useMemo(() => {
    if (!gifts || !Array.isArray(gifts)) return [];
    if (searchValue.trim() === "") {
      return gifts;
    }
    return gifts.filter(gift => gift.name.toLowerCase().includes(searchValue.toLowerCase()) || gift.description && gift.description.toLowerCase().includes(searchValue.toLowerCase()));
  }, [gifts, searchValue]);
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  }, []);
  return <section className="mb-4 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2 sm:mb-4 gap-2 mx-1">
        <h2 className="text-lg font-bold font-display bg-clip-text text-transparent bg-gradient-to-r from-funky-purple to-funky-pink">Gift Selection</h2>
        
        <div className="relative w-full md:w-auto">
          <Input placeholder="Search Gifts" type="text" value={searchValue} onChange={handleSearchChange} className="w-full md:w-64 rounded-full bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-funky-purple/20 focus:border-funky-purple/50 pl-8 pr-3 py-1 text-xs shadow-sm" />
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-funky-purple/60" />
        </div>
      </div>
      
      <div className="relative" ref={carouselRef}>
        {isLoading ? <div className="grid grid-cols-2 gap-2 px-1">
            {[...Array(4)].map((_, i) => <div key={i} className="p-2">
                <Skeleton className="w-full aspect-square rounded-lg mb-2" />
                <Skeleton className="w-3/4 h-3 mb-1" />
                <Skeleton className="w-1/2 h-3 mb-1" />
                <Skeleton className="w-full h-6" />
              </div>)}
          </div> : <Carousel opts={{
        align: "start",
        loop: true,
        skipSnaps: false,
        dragFree: true
      }} className="w-full">
            <CarouselContent className="-ml-1">
              {filteredGifts.length > 0 ? filteredGifts.map(gift => <CarouselItem key={gift.id} className="pl-1 basis-1/2 transition-all duration-300">
                    <GiftCard gift={gift} />
                  </CarouselItem>) : <CarouselItem className="pl-1 basis-full">
                  <div className="p-3 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-funky-purple/10 text-center">
                    <p className="text-xs text-gray-600 dark:text-gray-300">No gifts found matching your search.</p>
                  </div>
                </CarouselItem>}
            </CarouselContent>
            
            <CarouselPrevious className="left-0 h-6 w-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-funky-purple/20 hover:bg-funky-purple/10 text-funky-purple" />
            <CarouselNext className="right-0 h-6 w-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-funky-purple/20 hover:bg-funky-purple/10 text-funky-purple" />
          </Carousel>}
      </div>
    </section>;
};
export default memo(GiftSection);