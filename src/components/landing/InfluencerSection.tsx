import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Gift, User, Users } from "lucide-react";
import { memo, useState, useMemo, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import $ from 'jquery';

// Make sure we're importing the CSS
import 'owl.carousel/dist/assets/owl.carousel.css';
import 'owl.carousel/dist/assets/owl.theme.default.css';

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
  onProfileClick,
  isMobile
}: {
  influencer: Influencer;
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
    <div className="allitem">
      <div className="blog-allof" onClick={() => onProfileClick(influencer.id)} onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
        <div className="img-date">
          <img 
            src={influencer.profile_image || 'https://storage.googleapis.com/a1aa/image/XZap5acURHVhX1bOw4h9xVM_CSgwW4lMTY9IVmySNr0.jpg'} 
            alt={`${influencer.name}'s profile`}
            className="rounded-full object-cover"
          />
        </div>
        
        <div className="discretion-blog">
          <h3>{influencer.name}</h3>
          <p>
            {influencer.platform} • {formatFollowers(influencer.followers)} followers
          </p>
          
          <div className="flex space-x-2 mt-4">
            <Button 
              size="sm" 
              variant="secondary"
              className="text-xs py-1 px-2 border border-funky-purple/20 text-stone-50 bg-funky-purple"
              onClick={(e) => {
                e.stopPropagation();
                onProfileClick(influencer.id);
              }}
            >
              <User className="h-3 w-3 mr-1" />
              View Profile
            </Button>
            
            <Button 
              size="sm"
              variant="outline" 
              className="text-xs py-1 px-2 border border-funky-pink/20 text-funky-pink"
              onClick={handleGiftClick}
            >
              <Gift className="h-3 w-3 mr-1" />
              Send Gift
            </Button>
          </div>
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
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState("");
  const carouselRef = useRef<HTMLDivElement>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef<HTMLDivElement>(null);
  const carouselInitialized = useRef(false);
  
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
  
  // Improved carousel initialization
  useEffect(() => {
    // Only try to initialize if we have influencers and jQuery is available
    if (filteredInfluencers.length > 0 && !carouselInitialized.current) {
      const timer = setTimeout(() => {
        try {
          // Double check that both jQuery and the carousel element exist
          if (window.$ && window.jQuery && $('#owl-demo1').length) {
            const owlCarousel = $('#owl-demo1');
            
            // Check if carousel is already initialized
            if (!(owlCarousel as any).data('owlCarousel')) {
              owlCarousel.owlCarousel({
                loop: false,
                margin: 10,
                nav: true,
                autoplay: false,
                dots: false,
                items: 3,
                responsiveClass: true,
                responsive: {
                  0: { items: 1, nav: false },
                  600: { items: 2, nav: false },
                  1000: { items: 4, nav: false, loop: false }
                }
              });
              carouselInitialized.current = true;
              console.log("Owl carousel initialized successfully");
            }
          } else {
            console.error("jQuery or carousel element not available");
          }
        } catch (error) {
          console.error("Failed to initialize owl carousel:", error);
        }
      }, 800); // Increased timeout to ensure DOM and jQuery are fully ready
      
      return () => {
        clearTimeout(timer);
      };
    }
  }, [filteredInfluencers]);
  
  // Cleanup function on component unmount
  useEffect(() => {
    return () => {
      try {
        if (window.$ && window.jQuery && $('#owl-demo1').length) {
          const owlCarousel = $('#owl-demo1');
          if ((owlCarousel as any).data('owlCarousel')) {
            (owlCarousel as any).data('owlCarousel').destroy();
            carouselInitialized.current = false;
          }
        }
      } catch (error) {
        console.error("Error destroying owl carousel:", error);
      }
    };
  }, []);
  
  return (
    <section className="mb-4 relative py-3 my-0 user-blog">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2 gap-2 mx-1">
        <h2 className="font-display bg-clip-text bg-gradient-to-r from-funky-purple to-funky-pink text-gray-900 text-xl font-semibold">
          Discover Influencers
        </h2>
        
        <div ref={searchInputRef} className="relative w-full md:w-auto bg-slate-50 py-[6px]">
          <Input 
            placeholder="Search Influencers" 
            type="text" 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            onFocus={() => {
              if (searchQuery.trim().length > 0) {
                setShowSuggestions(true);
              }
            }}
            className="w-full md:w-64 rounded-full backdrop-blur-sm border border-funky-purple/20 focus:border-funky-purple/50 pl-8 pr-3 py-1 text-xs shadow-sm bg-zinc-100" 
          />
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-funky-purple/60" />
          
          {showSuggestions && searchSuggestions.length > 0 && (
            <div className="absolute z-40 top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-xl border border-funky-purple/10 backdrop-blur-md animate-expand">
              <ul className="max-h-48 overflow-auto py-1">
                {searchSuggestions.map(influencer => (
                  <li 
                    key={influencer.id} 
                    className="px-2 py-1.5 hover:bg-funky-purple/10 cursor-pointer flex items-center gap-2 transition-colors duration-200" 
                    onClick={() => handleProfileClick(influencer.id)}
                  >
                    <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 border border-funky-purple/20">
                      {influencer.profile_image ? (
                        <img 
                          src={influencer.profile_image} 
                          alt={influencer.name} 
                          className="w-full h-full object-cover" 
                        />
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
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      
      <div className="container">
        <div id="owl-demo1" className="owl-carousel" ref={carouselRef}>
          {filteredInfluencers && filteredInfluencers.length > 0 ? (
            filteredInfluencers.map((influencer, index) => (
              <InfluencerCard 
                key={index} 
                influencer={influencer} 
                onProfileClick={handleProfileClick} 
                isMobile={isMobile} 
              />
            ))
          ) : (
            <div className="allitem">
              <div className="blog-allof">
                <div className="img-date">
                  <Users className="h-6 w-6 text-funky-purple/50 mb-2 mx-auto" />
                </div>
                <div className="discretion-blog">
                  <h3>No influencers found</h3>
                  <p>No influencers found matching your search.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default memo(InfluencerSection);
