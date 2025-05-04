
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Gift, User, Users } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { memo, useState, useMemo, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

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
  const [isHovering, setIsHovering] = useState(false);
  
  const handleGiftClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/place-order?influencer=${influencer.id}`);
  };
  
  const formatFollowers = (count: number) => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
  };
  
  return (
    <div 
      className="p-3 h-full relative group cursor-pointer transition-all duration-300 transform hover:translate-y-[-5px]"
      onClick={() => onProfileClick(influencer.id)}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-funky-purple/5 to-funky-pink/5 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg transition-all duration-500 z-0 group-hover:bg-gradient-to-tr group-hover:from-funky-purple/10 group-hover:to-funky-pink/10"></div>
      
      <div 
        className="absolute right-3 top-3 z-20 transform transition-all duration-300 scale-0 group-hover:scale-100 origin-top-right"
        onClick={handleGiftClick}
      >
        <Button 
          size="icon" 
          className="rounded-full h-8 w-8 bg-white dark:bg-gray-900 backdrop-blur-md shadow-lg border border-funky-purple/20 text-funky-pink hover:bg-funky-purple/10"
        >
          <Gift className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="relative z-10">
        <div className={cn(
          "w-full aspect-square mb-3 overflow-hidden rounded-xl transition-all duration-500",
          isHovering ? "shadow-lg shadow-funky-purple/20" : ""
        )}>
          <div className="w-full h-full relative">
            <img 
              src={influencer.profile_image || 'https://storage.googleapis.com/a1aa/image/XZap5acURHVhX1bOw4h9xVM_CSgwW4lMTY9IVmySNr0.jpg'} 
              alt={`${influencer.name}'s profile`} 
              className={cn(
                "w-full h-full object-cover transition-all duration-500",
                isHovering ? "scale-110" : "scale-100"
              )}
              loading="lazy" 
            />
            <div className={cn(
              "absolute inset-0 bg-gradient-to-t from-funky-purple/40 to-transparent opacity-0 transition-opacity duration-300",
              isHovering ? "opacity-100" : "opacity-0"
            )}></div>
          </div>
        </div>
        
        <div className="mt-2 relative">
          <h3 className="text-sm font-semibold truncate text-gray-900 dark:text-gray-100 font-display">{influencer.name}</h3>
          <div className="flex items-center text-xs text-gray-600 dark:text-gray-300 mt-0.5 space-x-1">
            <span className="font-medium text-funky-purple">{influencer.platform}</span>
            <span>•</span>
            <div className="flex items-center">
              <Users className="h-3 w-3 mr-1 text-funky-pink" />
              <span>{formatFollowers(influencer.followers)}</span>
            </div>
          </div>
          <Button 
            size="sm" 
            variant="secondary" 
            onClick={() => onProfileClick(influencer.id)} 
            className="mt-2 w-full text-xs bg-white dark:bg-gray-800 hover:bg-funky-purple hover:text-white transition-all duration-300 border border-funky-purple/20"
          >
            <User className="h-3.5 w-3.5 mr-1" />
            View Profile
          </Button>
        </div>
      </div>
    </div>
  );
});

InfluencerCard.displayName = "InfluencerCard";

const InfluencerSection = ({
  influencers
}: InfluencerSectionProps) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSlide, setActiveSlide] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [autoplayEnabled, setAutoplayEnabled] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef<HTMLDivElement>(null);
  
  const handleProfileClick = (id: string) => {
    navigate(`/profile/${id}`);
    setShowSuggestions(false);
  };
  
  const filteredInfluencers = useMemo(() => {
    if (!searchQuery.trim()) return influencers;
    const query = searchQuery.toLowerCase().trim();
    return influencers.filter(influencer => 
      influencer.name.toLowerCase().includes(query) || 
      influencer.platform.toLowerCase().includes(query)
    );
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
      const timer = setInterval(() => {
        setActiveSlide(current => {
          if (current >= maxSlideIndex) return 0;
          return current + 1;
        });
      }, 5000);
      
      return () => clearInterval(timer);
    }
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

  return (
    <section className="mb-12 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold font-display bg-clip-text text-transparent bg-gradient-to-r from-funky-purple to-funky-pink">Discover Influencers</h2>
        
        <div ref={searchInputRef} className="relative w-full md:w-auto">
          <Input 
            placeholder="Search Influencers" 
            type="text" 
            value={searchQuery} 
            onChange={handleSearchChange} 
            onFocus={handleSearchFocus}
            className="w-full md:w-64 rounded-full bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-funky-purple/20 focus:border-funky-purple/50 pl-10 pr-4 py-2 shadow-sm"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-funky-purple/60" />
          
          {showSuggestions && searchSuggestions.length > 0 && (
            <div className="absolute z-40 top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-xl border border-funky-purple/10 backdrop-blur-md animate-expand">
              <ul className="max-h-60 overflow-auto py-1">
                {searchSuggestions.map(influencer => (
                  <li 
                    key={influencer.id} 
                    className="px-4 py-2 hover:bg-funky-purple/10 cursor-pointer flex items-center gap-3 transition-colors duration-200"
                    onClick={() => handleSuggestionClick(influencer.id)}
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 border border-funky-purple/20">
                      {influencer.profile_image ? (
                        <img src={influencer.profile_image} alt={influencer.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <User className="h-4 w-4 text-gray-500" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{influencer.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {influencer.platform} • {influencer.followers.toLocaleString()} followers
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      
      <div 
        className="relative" 
        ref={carouselRef} 
        onMouseEnter={() => handleCarouselHover(true)} 
        onMouseLeave={() => handleCarouselHover(false)}
      >
        <Carousel 
          opts={{
            align: "start",
            loop: true,
            skipSnaps: false,
            dragFree: false
          }} 
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {filteredInfluencers.length > 0 ? (
              filteredInfluencers.map((influencer, index) => (
                <CarouselItem 
                  key={index} 
                  className="pl-4 basis-full sm:basis-1/2 lg:basis-1/4"
                >
                  <InfluencerCard 
                    influencer={influencer} 
                    onProfileClick={handleProfileClick} 
                  />
                </CarouselItem>
              ))
            ) : (
              <CarouselItem className="pl-4 w-full">
                <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg shadow-md text-center border border-funky-purple/10">
                  <Users className="h-12 w-12 text-funky-purple/50 mb-3 mx-auto" />
                  <p className="text-gray-600 dark:text-gray-300">No influencers found matching your search.</p>
                </div>
              </CarouselItem>
            )}
          </CarouselContent>
          
          <CarouselPrevious className="left-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-funky-purple/20 hover:bg-funky-purple/10 text-funky-purple" />
          <CarouselNext className="right-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-funky-purple/20 hover:bg-funky-purple/10 text-funky-purple" />
        </Carousel>
        
        {filteredInfluencers.length > 0 && (
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 -mb-6 flex space-x-2">
            {Array.from({ length: Math.min(5, Math.ceil(filteredInfluencers.length / visibleCards)) }).map((_, i) => (
              <button
                key={i}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  Math.floor(activeSlide / visibleCards) === i 
                    ? "w-6 bg-funky-purple" 
                    : "bg-funky-purple/30 hover:bg-funky-purple/50"
                }`}
                onClick={() => setActiveSlide(i * visibleCards)}
                aria-label={`Go to group ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default memo(InfluencerSection);
