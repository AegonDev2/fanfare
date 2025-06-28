
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Edit, Trash, ExternalLink } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Shop } from "@/hooks/useShops";

interface ShopCardProps {
  shop: Shop;
  isSelected: boolean;
  onSelect: () => void;
  onRefetch: () => void;
}

export default function ShopCard({ shop, isSelected, onSelect, onRefetch }: ShopCardProps) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this shop? This will also delete all associated products.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('shops')
        .delete()
        .eq('id', shop.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Shop deleted successfully",
      });
      onRefetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete shop",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-funky-purple bg-funky-purple/5' : ''
      }`}
      onClick={onSelect}
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {shop.logo_image_url && (
                <img 
                  src={shop.logo_image_url} 
                  alt={shop.name}
                  className="w-6 h-6 rounded object-cover"
                />
              )}
              <h3 className="font-medium text-sm truncate">{shop.name}</h3>
            </div>
            {shop.description && (
              <p className="text-xs text-gray-600 line-clamp-2 mb-2">{shop.description}</p>
            )}
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                Active
              </Badge>
              {shop.website_url && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(shop.website_url!, '_blank');
                  }}
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Edit className="h-4 w-4 mr-2" />
                Edit Shop
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-red-600"
              >
                <Trash className="h-4 w-4 mr-2" />
                Delete Shop
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
