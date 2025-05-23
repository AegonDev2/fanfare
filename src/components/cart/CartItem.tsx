
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Gift, Trash2, Plus, Minus } from 'lucide-react';
import { CartItem as CartItemType } from '@/hooks/useCart';

interface CartItemProps {
  item: CartItemType;
  influencerName?: string;
  influencerImage?: string;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
}

export default function CartItem({ 
  item, 
  influencerName, 
  influencerImage, 
  onUpdateQuantity, 
  onRemove 
}: CartItemProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleQuantityChange = async (newQuantity: number) => {
    setIsUpdating(true);
    await onUpdateQuantity(item.id, newQuantity);
    setIsUpdating(false);
  };

  return (
    <Card className="p-4">
      <CardContent className="p-0">
        <div className="flex gap-4">
          <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
            <img 
              src={item.gift_image_url || '/placeholder.svg'} 
              alt={item.gift_name}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium text-sm truncate pr-2">{item.gift_name}</h3>
              <p className="font-semibold text-purple-600 flex-shrink-0">₹{item.gift_price}</p>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
              <Gift className="h-3 w-3" />
              <span>For:</span>
              <div className="flex items-center gap-1">
                <Avatar className="h-4 w-4">
                  <AvatarImage src={influencerImage} />
                  <AvatarFallback className="text-[8px] bg-purple-100">
                    {influencerName?.slice(0, 2).toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">{influencerName || 'Loading...'}</span>
              </div>
            </div>
            
            {item.message && (
              <p className="text-xs text-gray-500 italic mb-3 truncate">
                "{item.message}"
              </p>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 w-7 p-0 rounded-full"
                  onClick={() => handleQuantityChange(item.quantity - 1)}
                  disabled={isUpdating || item.quantity <= 1}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="min-w-[2rem] text-center text-sm font-medium">
                  {item.quantity}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 w-7 p-0 rounded-full"
                  onClick={() => handleQuantityChange(item.quantity + 1)}
                  disabled={isUpdating}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              
              <Button
                size="sm"
                variant="ghost"
                className="text-red-500 hover:text-red-700 h-7 w-7 p-0 rounded-full"
                onClick={() => onRemove(item.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
