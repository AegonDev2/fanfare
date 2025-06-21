
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Gift, User, Users } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { memo, useState, useMemo, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useInfluencers, DatabaseInfluencer } from "@/hooks/useInfluencers";
import { Skeleton } from "@/components/ui/skeleton";

const InfluencerCard = memo(({
  influencer,
  onProfileClick,
  isMobile
}: {
  influencer: DatabaseInfluencer;
  onProfileClick: (id: string) => void;
  isMobile: boolean;
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
      className={cn("p-1 lg:p-2 h-full relative group cursor-pointer transition-all duration-300 transform hover:translate-y-[-5px]")}
      onClick={() => onProfileClick(influencer.id)}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-funky-purple/5 to-funky-pink/5 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg transition-all duration-500 z-0 group-hover:bg-gradient-to-tr group-hover:from-funky-purple/10 group-hover:to-funky-pink/10 my-[2px] py-0 px-0 mx-0 bg-slate-50"></div>
      
      <div className="absolute right-2 top-2 z-20 transform transition-all duration-300 scale-0 group-hover:scale-100 origin-top-right" onClick={handleGiftClick}>
        <Button size="icon" className="rounded-full h-6 w-6 lg:h-7 lg:w-7 bg-white dark:bg-gray-900 backdrop-blur-md shadow-lg border border-funky-purple/20 text-funky-pink hover:bg-funky-purple/10">
          <Gift className="h-3 w-3" />
        </Button>
      </div>
      
      <div className="relative z-10">
        <div className={cn("w-full aspect-square mb-2 overflow-hidden rounded-xl transition-all duration-500", isHovering ? "shadow-lg shadow-funky-purple/20" : "")}>
          <div className="w-full h-full relative">
            <img 
              src={influencer.profile_image || 'https://storage.googleapis.com/a1aa/image/XZap5acURHVhX1bOw4h9xVM_CSgwW4lMTY9IVmySNr0.jpg'} 
              alt={`${influencer.name}'s profile`} 
              className={cn("w-full h-full object-cover transition-all duration-500", isHovering ? "scale-110" : "scale-100")} 
              loading="lazy" 
            />
            <div className={cn("absolute inset-0 bg-gradient-to-t from-funky-purple/40 to-transparent opacity-0 transition-opacity duration-300", isHovering ? "opacity-100" : "opacity-0")}></div>
          </div>
        </div>
        
        <div className="mt-1 relative">
          <h3 className="text-xs lg:text-sm font-semibold truncate font-display text-zinc-950">{influencer.name}</h3>
          <div className="flex items-center text-xs text-gray-600 dark:text-gray-300 mt-0.5 space-x-1">
            <span className="font-medium text-funky-purple text-[10px] lg:text-xs">{influencer.platform}</span>
            {influencer.category && (
              <>
                <span>•</span>
                <span className="text-[10px] lg:text-xs text-slate-600 capitalize">{influencer.category}</span>
              </>
            )}
            <span>•</span>
            <div className="flex items-center">
              <Users className="h-2.5 w-2.5 mr-0.5 text-funky-pink" />
              <span className="text-[10px] lg:text-xs text-slate-950">{formatFollowers(influencer.followers)}</span>
            </div>
          </div>
          <Button 
            size="sm" 
            variant="secondary" 
            onClick={() => onProfileClick(influencer.id)} 
            className="mt-1 w-full text-[10px] lg:text-xs py-1 px-2 transition-all duration-300 border border-funky-purple/20 text-stone-50 bg-funky-purple"
          >
            <User className="h-3 w-3 mr-1" />
            View Profile
          </Button>
        </div>
      </div>
    </div>
  );
});

InfluencerCard.displayName = "InfluencerCard";

const InfluencerSection = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef<HTMLDivElement>(null);

  const { data: influencers = [], isLoading } = useInfluencers(searchQuery);

  const handleProfileClick = (id: string) => {
    navigate(`/profile/${id}`);
    setShowSuggestions(false);
  };

  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return influencers.slice(0, 5);
  }, [influencers, searchQuery]);

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

  const handleViewAllClick = () => {
    navigate('/influencers');
  };

  if (isLoading) {
    return (
      <section className="mb-4 relative py-[3px] my-0 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2 gap-2 mx-1">
            <h2 className="font-display bg-clip-text bg-gradient-to-r from-funky-purple to-funky-pink text-gray-900 text-lg lg:text-xl font-semibold">Discover Influencers</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-4 relative py-[3px] my-0 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2 gap-2 mx-1">
          <div className="flex items-center gap-4">
            <h2 className="font-display bg-clip-text bg-gradient-to-r from-funky-purple to-funky-pink text-gray-900 text-lg lg:text-xl font-semibold">Discover Influencers</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewAllClick}
              className="text-funky-purple border-funky-purple/30 hover:bg-funky-purple/10"
            >
              View All
            </Button>
          </div>
          
          <div ref={searchInputRef} className="relative w-full md:w-auto py-[6px] bg-rose-100/0 px-0 mx-0 md:mx-[200px]">
            <Input
              placeholder="Search Influencers"
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={handleSearchFocus}
              className="w-full md:w-64 lg:w-72 rounded-full backdrop-blur-sm border border-funky-purple/20 focus:border-funky-purple/50 pl-8 pr-3 py-1 text-xs lg:text-sm shadow-sm bg-zinc-100"
            />
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 lg:h-4 lg:w-4 text-funky-purple/60" />
            
            {showSuggestions && searchSuggestions.length > 0 && (
              <div className="absolute z-40 top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-xl border border-funky-purple/10 backdrop-blur-md animate-expand">
                <ul className="max-h-48 overflow-auto py-1">
                  {searchSuggestions.map(influencer => (
                    <li 
                      key={influencer.id} 
                      className="px-2 py-1.5 hover:bg-funky-purple/10 cursor-pointer flex items-center gap-2 transition-colors duration-200" 
                      onClick={() => handleSuggestionClick(influencer.id)}
                    >
                      <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 border border-funky-purple/20">
                        {influencer.profile_image ? (
                          <img src={influencer.profile_image} alt={influencer.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <User className="h-3 w-3 text-gray-500" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">{influencer.name}</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                          {influencer.platform} • {influencer.followers.toLocaleString()} followers
                          {influencer.category && ` • ${influencer.category}`}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        
        <div className="relative px-1 bg-rose-100/0">
          <Carousel
            opts={{
              align: "start",
              loop: true,
              skipSnaps: false,
              dragFree: true
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-1">
              {influencers && influencers.length > 0 ? (
                influencers.slice(0, 8).map((influencer, index) => (
                  <CarouselItem key={index} className="pl-1 basis-1/2 lg:basis-1/4 transition-all duration-300">
                    <InfluencerCard 
                      influencer={influencer} 
                      onProfileClick={handleProfileClick} 
                      isMobile={isMobile}
                    />
                  </CarouselItem>
                ))
              ) : (
                <CarouselItem className="pl-1 basis-full">
                  <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-3 rounded-lg shadow-md text-center border border-funky-purple/10">
                    <Users className="h-6 w-6 text-funky-purple/50 mb-2 mx-auto" />
                    <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-300">No influencers found matching your search.</p>
                  </div>
                </CarouselItem>
              )}
            </CarouselContent>
            
            <CarouselPrevious className="left-0 h-6 w-6 lg:h-8 lg:w-8 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-funky-purple/20 hover:bg-funky-purple/10 text-funky-purple" />
            <CarouselNext className="right-0 h-6 w-6 lg:h-8 lg:w-8 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-funky-purple/20 hover:bg-funky-purple/10 text-funky-purple" />
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default memo(InfluencerSection);
