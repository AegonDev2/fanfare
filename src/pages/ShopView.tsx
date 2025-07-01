
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, ArrowLeft, Gift, ExternalLink, Store } from "lucide-react";
import FloatingHeader from '@/components/ui/floating-header';
import Navbar from '@/components/navigation/Navbar';
import { useShops } from '@/hooks/useShops';
import { useShopProducts } from '@/hooks/useShopProducts';
import { useToast } from '@/hooks/use-toast';

export default function ShopView() {
  const { shopId } = useParams<{ shopId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [navOpen, setNavOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: shops = [], isLoading: shopsLoading } = useShops();
  const { data: products = [], isLoading: productsLoading } = useShopProducts(shopId || null);

  const currentShop = shops.find(shop => shop.id === shopId);

  useEffect(() => {
    if (!shopsLoading && !currentShop && shopId) {
      toast({
        title: "Shop Not Found",
        description: "The requested shop could not be found",
        variant: "destructive"
      });
      navigate('/gift-shop');
    }
  }, [currentShop, shopsLoading, shopId, navigate, toast]);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleGiftProduct = (product: any) => {
    // Navigate to gift selection with product data
    const params = new URLSearchParams({
      giftName: encodeURIComponent(product.name),
      giftPrice: product.price.toString(),
      giftImage: encodeURIComponent(product.image_url || ''),
      giftId: product.id,
      gift: product.product_url || product.image_url || ''
    });
    
    navigate(`/gift-selection?${params.toString()}`);
  };

  if (shopsLoading || !currentShop) {
    return (
      <>
        <FloatingHeader setNavOpen={setNavOpen} />
        <Navbar isOpen={navOpen} setIsOpen={setNavOpen} />
        <div className="min-h-screen bg-background pt-20 p-4 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-funky-purple mx-auto mb-4"></div>
            <p className="text-gray-600">Loading shop...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <FloatingHeader setNavOpen={setNavOpen} />
      <Navbar isOpen={navOpen} setIsOpen={setNavOpen} />
      
      <div className="min-h-screen bg-background pt-20 p-4">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/gift-shop')}
              className="text-funky-purple hover:bg-funky-purple/10"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Gift Shop
            </Button>
          </div>

          {/* Shop Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-6">
                <div className="h-20 w-20 bg-gradient-to-br from-funky-purple/10 to-funky-pink/10 rounded-lg flex items-center justify-center">
                  {currentShop.logo_image_url ? (
                    <img 
                      src={currentShop.logo_image_url} 
                      alt={currentShop.name}
                      className="w-16 h-16 object-contain rounded"
                    />
                  ) : (
                    <Store className="h-10 w-10 text-funky-purple" />
                  )}
                </div>
                
                <div className="flex-1">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-funky-purple to-funky-pink bg-clip-text text-transparent">
                    {currentShop.name}
                  </h1>
                  {currentShop.description && (
                    <p className="text-gray-600 mt-2">{currentShop.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-4">
                    <Badge variant="secondary">
                      {filteredProducts.length} Products Available
                    </Badge>
                    {currentShop.website_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(currentShop.website_url!, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Visit Website
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Search */}
          <div className="relative max-w-md">
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {productsLoading ? (
              [...Array(8)].map((_, i) => (
                <Card key={i}>
                  <div className="h-48 bg-gray-100 rounded-t-lg animate-pulse" />
                  <CardContent className="p-4">
                    <div className="h-4 bg-gray-100 rounded animate-pulse mb-2" />
                    <div className="h-3 bg-gray-100 rounded animate-pulse mb-4" />
                    <div className="h-8 bg-gray-100 rounded animate-pulse" />
                  </CardContent>
                </Card>
              ))
            ) : filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <Card key={product.id} className="group hover:shadow-lg transition-shadow">
                  <div className="h-48 bg-gray-50 rounded-t-lg overflow-hidden">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Gift className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>
                    
                    {product.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                    )}
                    
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-xl font-bold text-funky-purple">₹{product.price}</p>
                        {product.category && (
                          <Badge variant="outline" className="text-xs mt-1">
                            {product.category}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => handleGiftProduct(product)}
                      className="w-full bg-gradient-to-r from-funky-purple to-funky-pink hover:from-funky-pink hover:to-funky-purple"
                    >
                      <Gift className="h-4 w-4 mr-2" />
                      Gift This
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Gift className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Products Found</h3>
                <p className="text-gray-500">
                  {searchQuery ? 'Try adjusting your search terms' : 'This shop doesn\'t have any products yet'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
