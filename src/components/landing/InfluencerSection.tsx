import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Gift, User } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { memo, useState, useMemo, useRef, useEffect, useCallback } from "react";
interface Influencer {
  id: string;
  name: string;
  platform: string;
  profile_image: string;
  followers: number;
}
interface InfluencerSectionProps {
  influencers: Influencer[];
}
const InfluencerCard = memo(({
  influencer,
  onProfileClick
}: {
  influencer: Influencer;
  onProfileClick: (id: string) => void;
}) => {
  const navigate = useNavigate();
  const handleGiftClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/place-order?influencer=${influencer.id}`);
  };
  return <div className="p-3 rounded-lg shadow-md h-full relative group bg-gray-400 px-[17px]">
      <div className="absolute right-3 top-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity" onClick={handleGiftClick}>
        <Button size="icon" className="rounded-full h-8 w-8 bg-white/90 hover:bg-white shadow-md">
          <Gift className="h-4 w-4 text-primary" />
        </Button>
      </div>
      <div className="w-full aspect-square mb-2 overflow-hidden rounded-lg">
        <img src={influencer.profile_image || 'https://storage.googleapis.com/a1aa/image/XZap5acURHVhX1bOw4h9xVM_CSgwW4lMTY9IVmySNr0.jpg'} alt={`${influencer.name}'s profile`} className="w-full h-full object-cover" loading="lazy" />
      </div>
      <div className="mt-2">
        <h3 className="text-sm font-semibold truncate text-gray-950">{influencer.name}</h3>
        <p className="text-xs text-gray-600 truncate">{influencer.platform} • {influencer.followers.toLocaleString()} followers</p>
        <Button size="sm" variant="secondary" className="mt-2 w-full text-xs" onClick={() => onProfileClick(influencer.id)}>
          View Profile
        </Button>
      </div>
    </div>;
});
InfluencerCard.displayName = "InfluencerCard";
const InfluencerSection = ({
  influencers
}: InfluencerSectionProps) => {
  console.log("InfluencerSection rendered with influencers:", influencers);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSlide, setActiveSlide] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [autoplayEnabled, setAutoplayEnabled] = useState(true);
  const autoplayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef<HTMLDivElement>(null);
  const handleProfileClick = (id: string) => {
    navigate(`/profile/${id}`);
    setShowSuggestions(false);
  };
  const filteredInfluencers = useMemo(() => {
    if (!searchQuery.trim()) return influencers;
    const query = searchQuery.toLowerCase().trim();
    return influencers.filter(influencer => influencer.name.toLowerCase().includes(query) || influencer.platform.toLowerCase().includes(query));
  }, [influencers, searchQuery]);
  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return filteredInfluencers.slice(0, 5);
  }, [filteredInfluencers, searchQuery]);
  const getVisibleCardCount = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth >= 1024) return 4; // lg
      if (window.innerWidth >= 640) return 2; // sm
      return 1; // mobile
    }
    return 4; // Default for SSR
  };
  const [visibleCards, setVisibleCards] = useState(getVisibleCardCount());
  useEffect(() => {
    const handleResize = () => {
      setVisibleCards(getVisibleCardCount());
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  const maxSlideIndex = Math.max(0, filteredInfluencers.length - visibleCards);
  useEffect(() => {
    if (autoplayEnabled && filteredInfluencers.length > 0) {
      autoplayTimerRef.current = setInterval(() => {
        setActiveSlide(current => {
          if (current >= maxSlideIndex) return maxSlideIndex;
          return current + 1;
        });
      }, 5000);
    }
    return () => {
      if (autoplayTimerRef.current) {
        clearInterval(autoplayTimerRef.current);
      }
    };
  }, [autoplayEnabled, filteredInfluencers.length, maxSlideIndex]);
  const scrollToSlide = useCallback((index: number) => {
    const container = carouselRef.current?.querySelector('.embla__container');
    const items = container?.querySelectorAll('.embla__slide');
    if (items && items[index]) {
      const scrollPosition = (items[index] as HTMLElement).offsetLeft;
      container?.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
    }
  }, []);
  useEffect(() => {
    scrollToSlide(activeSlide);
  }, [activeSlide, scrollToSlide]);
  const handleCarouselHover = (isHovering: boolean) => {
    setAutoplayEnabled(!isHovering);
  };
  const handleSearchFocus = () => {
    if (searchQuery.trim().length > 0) {
      setShowSuggestions(true);
    }
  };
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSuggestions(value.trim().length > 0);
  };
  const handleSuggestionClick = (id: string) => {
    const influencer = influencers.find(inf => inf.id === id);
    if (influencer) {
      setSearchQuery(influencer.name);
      handleProfileClick(id);
    }
  };
  return <section className="mb-8 relative px-[24px] py-[5px]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <h2 className="px-0 mx-0 text-lg text-left font-bold text-gray-950 py-0 my-[3px]">Discover Influencers</h2>
        <div className="relative w-full md:w-auto" ref={searchInputRef}>
          <Input className="w-full md:w-64" placeholder="Search Influencers" type="text" value={searchQuery} onChange={handleSearchChange} onFocus={handleSearchFocus} />
          <Search className="absolute right-2 top-2.5 h-5 w-5 text-gray-500 px-px" />
          
          {showSuggestions && searchSuggestions.length > 0 && <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white rounded-md shadow-lg overflow-hidden border border-gray-200">
              <ul className="max-h-60 overflow-auto py-1">
                {searchSuggestions.map(influencer => <li key={influencer.id} className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-3" onClick={() => handleSuggestionClick(influencer.id)}>
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                      {influencer.profile_image ? <img src={influencer.profile_image} alt={influencer.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <User className="h-4 w-4 text-gray-500" />
                        </div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{influencer.name}</p>
                      <p className="text-xs text-gray-500 truncate">{influencer.platform} • {influencer.followers.toLocaleString()} followers</p>
                    </div>
                  </li>)}
              </ul>
            </div>}
        </div>
      </div>
      <div className="relative" ref={carouselRef} onMouseEnter={() => handleCarouselHover(true)} onMouseLeave={() => handleCarouselHover(false)}>
        <Carousel opts={{
        align: "start",
        loop: false,
        skipSnaps: false,
        dragFree: false
      }} className="w-full">
          <CarouselContent className="-ml-4">
            {filteredInfluencers.length > 0 ? filteredInfluencers.map((influencer, index) => <CarouselItem key={index} className="pl-4 basis-full sm:basis-1/2 lg:basis-1/4">
                  <InfluencerCard influencer={influencer} onProfileClick={handleProfileClick} />
                </CarouselItem>) : <CarouselItem className="pl-4 w-full">
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                  <p className="text-gray-600">No influencers found matching your search.</p>
                </div>
              </CarouselItem>}
          </CarouselContent>
        </Carousel>
      </div>
    </section>;
};
export default memo(InfluencerSection);