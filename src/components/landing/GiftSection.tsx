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
  return <div className="p-3 shadow-md h-full mx-0 bg-transparent rounded-none my-0 py-[8px] px-[16px]">
      <div className="w-full aspect-square mb-2 overflow-hidden rounded-lg">
        <img src={gift.image} alt={gift.name} loading="lazy" className="w-full h-full object-cover" />
      </div>
      <div className="mt-2">
        <h3 className="text-sm font-semibold text-gray-800 truncate">{gift.name}</h3>
        <p className="text-xs text-gray-600">{gift.price}</p>
        <Button size="sm" variant="secondary" onClick={handleGiftClick} className="mt-2 w-full text-xs bg-slate-800 hover:bg-slate-700 text-neutral-50">
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4 px-0">
        <h2 className="text-xl text-gray-800 font-bold px-0 mx-0">Gift Selection</h2>
        <div className="relative w-full md:w-auto px-0">
          <Input placeholder="Search Gifts" type="text" className="w-full md:w-64 py-0 my-[17px] rounded-full px-[90px] bg-stone-200" />
          <Search className="absolute right-2 top-2.5 h-5 w-5 text-gray-500 py-0 my-[17px] mx-[9px]" />
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
          
          
        </Carousel>
      </div>
    </section>;
};
export default memo(GiftSection);