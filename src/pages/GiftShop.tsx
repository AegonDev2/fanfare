
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Store } from "lucide-react";
import FloatingHeader from '@/components/ui/floating-header';
import Navbar from '@/components/navigation/Navbar';
import ShopCard from '@/components/gift-shop/ShopCard';
import ProductGrid from '@/components/gift-shop/ProductGrid';
import CreateShopDialog from '@/components/gift-shop/CreateShopDialog';
import CreateProductDialog from '@/components/gift-shop/CreateProductDialog';
import ShopTileView from '@/components/gift-shop/ShopTileView';
import { useShops } from '@/hooks/useShops';
import { useShopProducts } from '@/hooks/useShopProducts';
import { useUser } from '@/hooks/useUser';
import { hasRole } from '@/utils/roleManager';
import { supabase } from '@/integrations/supabase/client';

export default function GiftShop() {
  const [navOpen, setNavOpen] = useState(false);
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateShop, setShowCreateShop] = useState(false);
  const [showCreateProduct, setShowCreateProduct] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);

  const { user } = useUser();
  const { data: shops = [], isLoading: shopsLoading, refetch: refetchShops } = useShops();
  const { data: products = [], isLoading: productsLoading, refetch: refetchProducts } = useShopProducts(selectedShopId);

  // Check if user is admin
  useState(() => {
    const checkAdminRole = async () => {
      if (user) {
        const isUserAdmin = await hasRole(user.id, 'admin');
        setIsAdmin(isUserAdmin);
      }
      setCheckingRole(false);
    };
    checkAdminRole();
  }, [user]);

  const filteredShops = shops.filter(shop => 
    shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shop.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (checkingRole) {
    return (
      <>
        <FloatingHeader setNavOpen={setNavOpen} />
        <Navbar isOpen={navOpen} setIsOpen={setNavOpen} />
        <div className="min-h-screen bg-background pt-20 p-4 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-funky-purple mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </>
    );
  }

  // Admin view - management interface
  if (isAdmin) {
    return (
      <>
        <FloatingHeader setNavOpen={setNavOpen} />
        <Navbar isOpen={navOpen} setIsOpen={setNavOpen} />
        
        <div className="min-h-screen bg-background pt-20 p-4">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-funky-purple to-funky-pink bg-clip-text text-transparent">
                  Gift Shop Management
                </h1>
                <p className="text-gray-600 mt-1">Manage shops and products for gifting</p>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => setShowCreateShop(true)}
                  className="bg-funky-purple hover:bg-funky-purple/90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Shop
                </Button>
                <Button 
                  onClick={() => setShowCreateProduct(true)}
                  variant="outline"
                  disabled={!selectedShopId}
                  className="border-funky-purple text-funky-purple hover:bg-funky-purple/10"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Input
                placeholder="Search shops and products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Shops Sidebar */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Store className="h-5 w-5 mr-2" />
                      Shops ({filteredShops.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {shopsLoading ? (
                      <div className="space-y-2">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
                        ))}
                      </div>
                    ) : filteredShops.length > 0 ? (
                      filteredShops.map((shop) => (
                        <ShopCard
                          key={shop.id}
                          shop={shop}
                          isSelected={selectedShopId === shop.id}
                          onSelect={() => setSelectedShopId(shop.id)}
                          onRefetch={refetchShops}
                        />
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-4">No shops found</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Products Grid */}
              <div className="lg:col-span-2">
                <ProductGrid
                  products={filteredProducts}
                  isLoading={productsLoading}
                  selectedShopId={selectedShopId}
                  onRefetch={refetchProducts}
                />
              </div>
            </div>
          </div>
        </div>

        <CreateShopDialog
          open={showCreateShop}
          onOpenChange={setShowCreateShop}
          onSuccess={() => {
            refetchShops();
            setShowCreateShop(false);
          }}
        />

        <CreateProductDialog
          open={showCreateProduct}
          onOpenChange={setShowCreateProduct}
          shopId={selectedShopId}
          shops={shops}
          onSuccess={() => {
            refetchProducts();
            setShowCreateProduct(false);
          }}
        />
      </>
    );
  }

  // Fan/Influencer view - browse interface
  return (
    <>
      <FloatingHeader setNavOpen={setNavOpen} />
      <Navbar isOpen={navOpen} setIsOpen={setNavOpen} />
      
      <div className="min-h-screen bg-background pt-20 p-4">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-funky-purple to-funky-pink bg-clip-text text-transparent">
              Gift Shop
            </h1>
            <p className="text-gray-600 mt-1">Discover amazing shops and products for gifting</p>
          </div>

          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <Input
              placeholder="Search shops..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>

          {/* Shop Tiles */}
          <ShopTileView
            shops={filteredShops}
            isLoading={shopsLoading}
            onShopSelect={setSelectedShopId}
            selectedShopId={selectedShopId}
          />

          {/* Selected Shop Products */}
          {selectedShopId && (
            <div className="mt-8">
              <ProductGrid
                products={filteredProducts}
                isLoading={productsLoading}
                selectedShopId={selectedShopId}
                onRefetch={refetchProducts}
                isReadOnly={true}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
