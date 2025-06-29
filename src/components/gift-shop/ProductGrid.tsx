
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, ExternalLink, Edit, Trash } from "lucide-react";
import { ShopProduct } from "@/hooks/useShopProducts";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ProductGridProps {
  products: ShopProduct[];
  isLoading: boolean;
  selectedShopId: string | null;
  onRefetch: () => void;
  isReadOnly?: boolean;
}

export default function ProductGrid({ products, isLoading, selectedShopId, onRefetch, isReadOnly = false }: ProductGridProps) {
  const { toast } = useToast();

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('shop_products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
      onRefetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  if (!selectedShopId) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Select a shop to view products</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Package className="h-5 w-5 mr-2" />
          Products ({products.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <Card key={product.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {product.image_url && (
                      <div className="w-full h-32 bg-gray-100 rounded overflow-hidden">
                        <img 
                          src={product.image_url} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    <div>
                      <h3 className="font-medium text-sm line-clamp-2 mb-1">{product.name}</h3>
                      <p className="text-lg font-bold text-funky-purple">₹{product.price}</p>
                      
                      {product.category && (
                        <Badge variant="outline" className="text-xs mt-1">
                          {product.category}
                        </Badge>
                      )}
                      
                      {product.description && (
                        <p className="text-xs text-gray-600 mt-2 line-clamp-2">{product.description}</p>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      {product.product_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(product.product_url!, '_blank')}
                          className="flex-1"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      )}
                      
                      {!isReadOnly && (
                        <>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No products found for this shop</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
