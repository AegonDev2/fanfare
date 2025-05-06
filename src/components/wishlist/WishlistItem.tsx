
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { type WishlistItem as WishlistItemType } from "@/hooks/useInfluencerWishlist";
import { ExternalLink, Trash2 } from "lucide-react";

interface WishlistItemProps {
  item: WishlistItemType;
  showActions?: boolean;
  onRemove?: (id: string) => void;
  onRequestGift?: (item: WishlistItemType) => void;
}

const WishlistItem = ({ 
  item, 
  showActions = false, 
  onRemove, 
  onRequestGift 
}: WishlistItemProps) => {
  const placeholderImage = "https://storage.googleapis.com/a1aa/image/nEyyMJHY73DoGPRrtOSXC1KvCAwbILiKV78pvYqeexs.jpg";
  
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="relative pt-[60%] overflow-hidden bg-gray-100">
        <img
          src={item.product_image_url || placeholderImage}
          alt={item.product_title}
          className="absolute inset-0 w-full h-full object-cover transition-transform hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = placeholderImage;
          }}
        />
        {item.product_price && (
          <div className="absolute top-0 right-0 m-2">
            <Badge variant="secondary" className="bg-white/80 backdrop-blur-sm font-medium">
              ₹{item.product_price.toLocaleString()}
            </Badge>
          </div>
        )}
      </div>
      
      <CardContent className="flex-grow py-4">
        <h3 className="font-semibold line-clamp-2 mb-2">{item.product_title}</h3>
        
        {item.comment && (
          <p className="text-sm text-muted-foreground line-clamp-3 mt-2">
            {item.comment}
          </p>
        )}
      </CardContent>
      
      <CardFooter className="pt-0 pb-4 gap-2 flex">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          asChild
        >
          <a 
            href={item.product_url} 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            View Item
          </a>
        </Button>
        
        {showActions && onRemove && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove(item.id)}
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
        
        {!showActions && onRequestGift && (
          <Button
            size="sm"
            className="flex-1"
            onClick={() => onRequestGift(item)}
          >
            Send as Gift
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default WishlistItem;
