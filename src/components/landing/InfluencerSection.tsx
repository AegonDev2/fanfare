
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { memo, useState, useMemo } from "react";

interface Influencer {
  id: string;
  name: string;
  category: string;
  image: string;
}

interface InfluencerSectionProps {
  influencers: Influencer[];
}

const InfluencerCard = memo(({ influencer, onProfileClick }: { influencer: Influencer; onProfileClick: (id: string) => void }) => (
  <div className="bg-white p-3 rounded-lg shadow-md h-full">
    <img
      src={influencer.image}
      alt={`${influencer.name}'s profile`}
      className="w-full h-32 object-cover rounded-lg"
      loading="lazy"
    />
    <div className="mt-2">
      <h3 className="text-sm font-semibold text-gray-800">{influencer.name}</h3>
      <p className="text-xs text-gray-600">{influencer.category}</p>
      <Button 
        size="sm" 
        className="mt-2 w-full text-xs"
        onClick={() => onProfileClick(influencer.id)}
      >
        View Profile
      </Button>
    </div>
  </div>
));

InfluencerCard.displayName = "InfluencerCard";

const InfluencerSection = ({ influencers }: InfluencerSectionProps) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleProfileClick = (id: string) => {
    navigate(`/profile/${id}`);
  };

  // Filter influencers based on search query
  const filteredInfluencers = useMemo(() => {
    if (!searchQuery.trim()) return influencers;
    
    const query = searchQuery.toLowerCase().trim();
    return influencers.filter(influencer => 
      influencer.name.toLowerCase().includes(query) ||
      influencer.category.toLowerCase().includes(query)
    );
  }, [influencers, searchQuery]);

  return (
    <section className="mb-8 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <h2 className="text-xl font-semibold text-gray-800">Discover Influencers</h2>
        <div className="relative w-full md:w-auto">
          <Input
            className="w-full md:w-64"
            placeholder="Search Influencers"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute right-2 top-2.5 h-5 w-5 text-gray-500" />
        </div>
      </div>
      <div className="relative px-12">
        <Carousel
          opts={{
            align: "start",
            loop: true,
            skipSnaps: false,
            dragFree: true
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {filteredInfluencers.length > 0 ? (
              filteredInfluencers.map((influencer, index) => (
                <CarouselItem key={index} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/4">
                  <InfluencerCard 
                    influencer={influencer}
                    onProfileClick={handleProfileClick}
                  />
                </CarouselItem>
              ))
            ) : (
              <CarouselItem className="pl-2 md:pl-4 w-full">
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                  <p className="text-gray-600">No influencers found matching your search.</p>
                </div>
              </CarouselItem>
            )}
          </CarouselContent>
          <CarouselPrevious className="left-0 -translate-x-full" />
          <CarouselNext className="right-0 translate-x-full" />
        </Carousel>
      </div>
    </section>
  );
};

export default memo(InfluencerSection);
