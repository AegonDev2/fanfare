
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Gift, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProfileWishlistItemProps {
  id: string;
  name: string;
  price: string | number;
  imageUrl: string;
  productUrl?: string;
}

const ProfileWishlistItem = ({
  id,
  name,
  price,
  imageUrl,
  productUrl,
}: ProfileWishlistItemProps) => {
  const navigate = useNavigate();

  const handleGiftClick = () => {
    if (productUrl) {
      // Update: Now redirecting to gift selection page with the gift URL as a parameter
      navigate(`/gift-selection?gift=${encodeURIComponent(productUrl)}`);
    }
  };

  const handleViewProduct = () => {
    if (productUrl) {
      window.open(productUrl, '_blank');
    }
  };

  return (
    <Card className="overflow-hidden border border-gray-200 h-full flex flex-col">
      <div className="relative pt-[100%] bg-gray-100">
        <img
          src={imageUrl || "/placeholder.svg"}
          alt={name}
          className="absolute inset-0 w-full h-full object-contain p-4"
        />
      </div>

      <CardContent className="p-3 flex-grow">
        <h3 className="font-medium text-sm line-clamp-2 min-h-[40px]">{name}</h3>
        <p className="text-sm font-semibold text-funky-purple">₹{price}</p>
      </CardContent>

      <CardFooter className="p-3 pt-0 flex flex-col gap-2">
        <Button
          className="w-full bg-gradient-to-r from-funky-purple to-funky-pink text-white"
          onClick={handleGiftClick}
          size="sm"
        >
          <Gift className="h-3.5 w-3.5 mr-1.5" />
          Gift This
        </Button>

        <Button
          variant="outline"
          className="w-full border-funky-purple/30 text-funky-purple"
          size="sm"
          onClick={handleViewProduct}
        >
          <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
          View Product
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProfileWishlistItem;
