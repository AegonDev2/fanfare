import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import { useGiftItems, GiftItem } from "@/hooks/useGiftItems";
import { ExternalLink, Gift } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface GiftCarouselProps {
  onGiftSelect?: (gift: GiftItem) => void;
  limit?: number;
  showGiftButton?: boolean;
}

export const GiftCarousel = ({ 
  onGiftSelect, 
  limit = 6, 
  showGiftButton = true 
}: GiftCarouselProps) => {
  const { data: gifts = [], isLoading } = useGiftItems();
  const navigate = useNavigate();
  
  const displayGifts = limit ? gifts.slice(0, limit) : gifts;

  const handleGiftAction = (gift: GiftItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onGiftSelect) {
      onGiftSelect(gift);
    } else {
      // Navigate to gift selection with this item
      navigate(`/gift-selection?item=${gift.id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-80 bg-muted/50 rounded-3xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (displayGifts.length === 0) {
    return (
      <div className="text-center py-16">
        <Gift className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-muted-foreground mb-2">No gifts available</h3>
        <p className="text-muted-foreground">Check back soon for new gift options</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {displayGifts.map((gift, index) => (
        <motion.div
          key={gift.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="group cursor-pointer"
          onClick={() => gift.gift_url && window.open(gift.gift_url, '_blank')}
        >
          <BackgroundGradient 
            className="rounded-3xl h-full" 
            containerClassName="h-full"
            animate={gift.is_featured}
          >
            <div className="bg-background rounded-3xl p-6 h-full flex flex-direction-column justify-between">
              {/* Image Container */}
              <div className="relative mb-4">
                <div className="w-full h-48 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl overflow-hidden">
                  {gift.image_url ? (
                    <img 
                      src={gift.image_url} 
                      alt={gift.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Gift className="h-16 w-16 text-primary" />
                    </div>
                  )}
                </div>
                
                {gift.is_featured && (
                  <Badge 
                    className="absolute top-3 left-3 bg-primary text-primary-foreground"
                  >
                    Featured
                  </Badge>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                    {gift.name}
                  </h3>
                  {gift.description && (
                    <p className="text-muted-foreground text-sm line-clamp-3 mt-2">
                      {gift.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div>
                    <p className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      ₹{gift.price}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    {gift.gift_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(gift.gift_url!, '_blank');
                        }}
                        className="border-primary/20 hover:bg-primary/10"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    )}
                    
                    {showGiftButton && (
                      <Button 
                        size="sm"
                        onClick={(e) => handleGiftAction(gift, e)}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      >
                        <Gift className="h-3 w-3 mr-1" />
                        Gift
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </BackgroundGradient>
        </motion.div>
      ))}
    </div>
  );
};