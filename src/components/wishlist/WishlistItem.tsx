
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { type WishlistItem as WishlistItemType } from "@/hooks/useInfluencerWishlist";
import { ExternalLink, Gift, Trash2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

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
  const [isHovering, setIsHovering] = useState(false);
  
  return (
    <Card 
      className={cn(
        "overflow-hidden h-full flex flex-col transition-all duration-300",
        "border-funky-purple/10 hover:border-funky-purple/30",
        isHovering ? "shadow-lg shadow-funky-purple/10 transform -translate-y-1" : "shadow-md"
      )}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="relative pt-[60%] overflow-hidden bg-gray-100">
        <img
          src={item.product_image_url || placeholderImage}
          alt={item.product_title}
          className={cn(
            "absolute inset-0 w-full h-full object-cover transition-transform duration-500",
            isHovering ? "scale-110" : "scale-100"
          )}
          onError={(e) => {
            (e.target as HTMLImageElement).src = placeholderImage;
          }}
        />
        {item.product_price && (
          <div className="absolute top-0 right-0 m-2">
            <Badge variant="secondary" className="bg-white/80 backdrop-blur-sm font-medium text-funky-purple border border-funky-purple/20">
              ₹{item.product_price.toLocaleString()}
            </Badge>
          </div>
        )}
        
        <div className={cn(
          "absolute inset-0 bg-gradient-to-t from-funky-purple/40 to-transparent opacity-0 transition-opacity duration-300",
          isHovering ? "opacity-100" : "opacity-0"
        )}></div>
      </div>
      
      <CardContent className="flex-grow py-4">
        <h3 className="font-semibold line-clamp-2 mb-2 text-gray-900 dark:text-gray-100">{item.product_title}</h3>
        
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
          className="flex-1 border-funky-purple/20 hover:bg-funky-purple/10 text-funky-purple"
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
            className="flex-1 bg-gradient-to-r from-funky-purple to-funky-pink hover:from-funky-pink hover:to-funky-purple"
            onClick={() => onRequestGift(item)}
          >
            <Gift className="mr-2 h-4 w-4" />
            Send as Gift
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default WishlistItem;
