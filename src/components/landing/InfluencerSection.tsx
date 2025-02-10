
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { memo } from "react";

interface Influencer {
  id: string;
  name: string;
  category: string;
  image: string;
}

interface InfluencerSectionProps {
  influencers: Influencer[];
}

// Memoize the individual influencer card to prevent unnecessary re-renders
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

  const handleProfileClick = (id: string) => {
    navigate(`/profile/${id}`);
  };

  return (
    <section className="mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <h2 className="text-xl font-semibold text-gray-800">Discover Influencers</h2>
        <div className="relative w-full md:w-auto">
          <Input
            className="w-full md:w-64"
            placeholder="Search Influencers"
            type="text"
          />
          <Search className="absolute right-2 top-2.5 h-5 w-5 text-gray-500" />
        </div>
      </div>
      <Carousel
        opts={{
          align: "start",
          loop: true,
          skipSnaps: false,
          dragFree: true
        }}
        plugins={[
          Autoplay({
            delay: 4000,
          }),
        ]}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {influencers.map((influencer, index) => (
            <CarouselItem key={index} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/4">
              <InfluencerCard 
                influencer={influencer}
                onProfileClick={handleProfileClick}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex" />
        <CarouselNext className="hidden md:flex" />
      </Carousel>
    </section>
  );
};

export default memo(InfluencerSection);
