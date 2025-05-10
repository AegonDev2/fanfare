
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gift, ExternalLink, Trash2 } from 'lucide-react';
import { WishlistItem as WishlistItemType } from '@/hooks/useInfluencerWishlist';

interface WishlistItemProps {
  item: WishlistItemType;
  showActions: boolean;
  onRemove?: () => void;
  onRequestGift?: (item: WishlistItemType) => void;
}

const WishlistItem = ({
  item,
  showActions,
  onRemove,
  onRequestGift,
}: WishlistItemProps) => {
  const navigate = useNavigate();
  const [isHovering, setIsHovering] = useState(false);

  const handleGiftClick = () => {
    if (onRequestGift) {
      onRequestGift(item);
    }
  };

  const handleViewProduct = () => {
    if (item.product_url) {
      window.open(item.product_url, '_blank');
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
          src={item.product_image_url || "/placeholder.svg"} 
          alt={item.product_title}
          className="absolute inset-0 w-full h-full object-contain p-4"
        />
      </div>
      
      <CardContent className="p-4 flex-grow">
        <h3 className="font-medium text-sm line-clamp-2 mb-2 min-h-[40px]">{item.product_title}</h3>
        <p className="text-sm font-semibold text-funky-purple">₹{item.product_price || "N/A"}</p>
      </CardContent>
      
      <CardFooter className="p-3 pt-0 flex flex-col gap-2">
        {!showActions && onRequestGift && (
          <Button 
            className="w-full bg-gradient-to-r from-funky-purple to-funky-pink text-white"
            onClick={handleGiftClick}
          >
            <Gift className="h-4 w-4 mr-2" />
            Gift This
          </Button>
        )}
        
        {showActions && onRemove && (
          <Button 
            variant="outline" 
            className="w-full border-red-300 text-red-500 hover:bg-red-50 hover:text-red-600"
            onClick={onRemove}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Remove
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
