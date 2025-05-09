
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gift, ExternalLink, Heart } from 'lucide-react';

interface WishlistItemProps {
  id: string;
  name: string;
  price: string | number;
  imageUrl: string;
  productUrl?: string;
  onRemove?: () => void;
  isViewOnly?: boolean;
}

const WishlistItem = ({
  id,
  name,
  price,
  imageUrl,
  productUrl,
  onRemove,
  isViewOnly = false,
}: WishlistItemProps) => {
  const navigate = useNavigate();
  const [isHovering, setIsHovering] = useState(false);

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
    <Card 
      className="overflow-hidden border border-gray-200 transition-all h-full flex flex-col"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="relative pt-[100%] bg-gray-100">
        <img 
          src={imageUrl || "/placeholder.svg"} 
          alt={name}
          className="absolute inset-0 w-full h-full object-contain p-4"
        />
      </div>
      
      <CardContent className="p-4 flex-grow">
        <h3 className="font-medium text-sm line-clamp-2 mb-2 min-h-[40px]">{name}</h3>
        <p className="text-sm font-semibold text-funky-purple">₹{price}</p>
      </CardContent>
      
      <CardFooter className="p-3 pt-0 flex flex-col gap-2">
        {!isViewOnly && (
          <Button 
            className="w-full bg-gradient-to-r from-funky-purple to-funky-pink text-white"
            onClick={handleGiftClick}
          >
            <Gift className="h-4 w-4 mr-2" />
            Gift This
          </Button>
        )}
        
        <Button 
          variant="outline" 
          className="w-full border-funky-purple/30 text-funky-purple"
          onClick={handleViewProduct}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          View Product
        </Button>
      </CardFooter>
    </Card>
  );
};

export default WishlistItem;
