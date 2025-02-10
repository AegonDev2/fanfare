
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface Gift {
  name: string;
  price: string;
  image: string;
}

interface GiftSectionProps {
  gifts: Gift[];
}

const GiftSection = ({ gifts }: GiftSectionProps) => {
  return (
    <section className="mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <h2 className="text-xl font-semibold text-gray-800">Gift Selection</h2>
        <div className="relative w-full md:w-auto">
          <Input
            className="w-full md:w-64"
            placeholder="Search Gifts"
            type="text"
          />
          <Search className="absolute right-2 top-2.5 h-5 w-5 text-gray-500" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {gifts.map((gift, index) => (
          <div key={index} className="bg-white p-3 rounded-lg shadow-md">
            <img
              src={gift.image}
              alt={gift.name}
              className="w-full h-32 object-cover rounded-lg"
            />
            <div className="mt-2">
              <h3 className="text-sm font-semibold text-gray-800">{gift.name}</h3>
              <p className="text-xs text-gray-600">{gift.price}</p>
              <Button size="sm" variant="secondary" className="mt-2 w-full text-xs">
                Gift This
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default GiftSection;
