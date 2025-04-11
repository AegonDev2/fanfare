import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { memo } from "react";
import { useNavigate } from "react-router-dom";
interface Gift {
  name: string;
  price: string;
  image: string;
}
interface GiftSectionProps {
  gifts: Gift[];
}
const GiftCard = memo(({
  gift
}: {
  gift: Gift;
}) => {
  const navigate = useNavigate();
  const handleGiftClick = () => {
    navigate(`/place-order?gift=${encodeURIComponent(gift.name)}`);
  };
  return <div className="bg-white p-3 rounded-lg shadow-md h-full">
      <div className="w-full aspect-square mb-2 overflow-hidden rounded-lg">
        <img src={gift.image} alt={gift.name} className="w-full h-full object-cover" loading="lazy" />
      </div>
      <div className="mt-2">
        <h3 className="text-sm font-semibold text-gray-800 truncate">{gift.name}</h3>
        <p className="text-xs text-gray-600">{gift.price}</p>
        <Button size="sm" variant="secondary" className="mt-2 w-full text-xs" onClick={handleGiftClick}>
          Gift This
        </Button>
      </div>
    </div>;
});
GiftCard.displayName = "GiftCard";
const GiftSection = ({
  gifts
}: GiftSectionProps) => {
  return <section className="mb-8 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <h2 className="text-xl font-semibold text-gray-800">Gift Selection</h2>
        <div className="relative w-full md:w-auto">
          <Input className="w-full md:w-64" placeholder="Search Gifts" type="text" />
          <Search className="absolute right-2 top-2.5 h-5 w-5 text-gray-500" />
        </div>
      </div>
      <div className="relative">
        <Carousel opts={{
        align: "start",
        loop: true,
        skipSnaps: false,
        dragFree: true
      }} className="w-full">
          <CarouselContent className="-ml-4">
            {gifts.map((gift, index) => <CarouselItem key={index} className="pl-4 basis-full sm:basis-1/2 lg:basis-1/4">
                <GiftCard gift={gift} />
              </CarouselItem>)}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex -left-11 font-normal" />
          <CarouselNext className="hidden md:flex -right-12\n" />
        </Carousel>
      </div>
    </section>;
};
export default memo(GiftSection);