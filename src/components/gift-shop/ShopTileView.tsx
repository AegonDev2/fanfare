
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Store, ExternalLink } from "lucide-react";
import { Shop } from "@/hooks/useShops";

interface ShopTileViewProps {
  shops: Shop[];
  isLoading: boolean;
  onShopSelect: (shopId: string) => void;
  selectedShopId: string | null;
}

export default function ShopTileView({ shops, isLoading, onShopSelect, selectedShopId }: ShopTileViewProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-48 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (shops.length === 0) {
    return (
      <div className="text-center py-12">
        <Store className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No Shops Found</h3>
        <p className="text-gray-500">Check back later for new shops and products!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {shops.map((shop) => (
        <Card 
          key={shop.id}
          className={`cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${
            selectedShopId === shop.id ? 'ring-2 ring-funky-purple bg-funky-purple/5' : ''
          }`}
          onClick={() => onShopSelect(shop.id)}
        >
          <CardContent className="p-0">
            {/* Shop Image/Logo */}
            <div className="h-32 bg-gradient-to-br from-funky-purple/10 to-funky-pink/10 rounded-t-lg flex items-center justify-center">
              {shop.logo_image_url ? (
                <img 
                  src={shop.logo_image_url} 
                  alt={shop.name}
                  className="w-16 h-16 object-contain rounded"
                />
              ) : (
                <Store className="h-12 w-12 text-funky-purple" />
              )}
            </div>
            
            {/* Shop Info */}
            <div className="p-4 space-y-3">
              <div>
                <h3 className="font-semibold text-lg line-clamp-1">{shop.name}</h3>
                {shop.description && (
                  <p className="text-sm text-gray-600 line-clamp-2 mt-1">{shop.description}</p>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-xs">
                  Active Shop
                </Badge>
                
                {shop.website_url && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(shop.website_url!, '_blank');
                    }}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full border-funky-purple text-funky-purple hover:bg-funky-purple hover:text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  onShopSelect(shop.id);
                }}
              >
                View Products
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
