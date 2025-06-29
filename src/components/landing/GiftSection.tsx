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
  return <div className="relative p-1 lg:p-2 h-full rounded-xl overflow-hidden transition-all duration-300 transform group" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
      <div className="absolute inset-0 bg-gradient-to-tr from-funky-purple/5 to-funky-pink/5 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg transition-all duration-500 z-0 group-hover:bg-gradient-to-tr group-hover:from-funky-purple/10 group-hover:to-funky-pink/10 bg-slate-50"></div>
      
      <div className="relative z-10">
        <div className={cn("w-full aspect-square mb-2 overflow-hidden rounded-lg transition-all duration-500", isHovering ? "shadow-lg shadow-funky-purple/20" : "")}>
          <img src={gift.image_url} alt={gift.name} loading="lazy" className={cn("w-full h-full object-cover transition-all duration-500", isHovering ? "scale-110" : "scale-100")} />
        </div>
        
        <div className="mt-1 relative">
          <h3 className="text-xs lg:text-sm font-semibold truncate font-display text-gray-950">{gift.name}</h3>
          <p className="text-xs lg:text-sm text-funky-purple font-medium">₹{gift.price}</p>
          <Button size="sm" onClick={handleGiftClick} className={cn("mt-1 w-full text-[10px] lg:text-xs py-1 px-2 transition-all duration-300", "bg-gradient-to-r from-funky-purple to-funky-pink text-white hover:shadow-lg hover:shadow-funky-purple/20")}>
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
  return;
};
export default memo(GiftSection);