
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Store, Package, Grid3X3, ExternalLink } from "lucide-react";
import FloatingHeader from '@/components/ui/floating-header';
import Navbar from '@/components/navigation/Navbar';
import { useNavigate } from "react-router-dom";
import ShopCard from '@/components/gift-shop/ShopCard';
import ProductGrid from '@/components/gift-shop/ProductGrid';
import CreateShopDialog from '@/components/gift-shop/CreateShopDialog';
import CreateProductDialog from '@/components/gift-shop/CreateProductDialog';
import ShopTileView from '@/components/gift-shop/ShopTileView';
import { useShops } from '@/hooks/useShops';
import { useShopProducts } from '@/hooks/useShopProducts';
import { useAllShopProducts } from '@/hooks/useAllShopProducts';
import { useUser } from '@/hooks/useUser';
import { hasRole } from '@/utils/roleManager';

export default function GiftShop() {
  const navigate = useNavigate();
  const [navOpen, setNavOpen] = useState(false);
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateShop, setShowCreateShop] = useState(false);
  const [showCreateProduct, setShowCreateProduct] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);
  const [viewMode, setViewMode] = useState<"shops" | "products">("shops");

  const { user } = useUser();
  const { data: shops = [], isLoading: shopsLoading, refetch: refetchShops } = useShops();
  const { data: allProducts = [], isLoading: allProductsLoading, refetch: refetchAllProducts } = useAllShopProducts();
  const { data: products = [], isLoading: productsLoading, refetch: refetchProducts } = useShopProducts(selectedShopId);

  // Check if user is admin
  useEffect(() => {
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

  const filteredAllProducts = allProducts.filter(product =>
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
      
      <div className="min-h-screen bg-background pt-16 pb-20">
        <div className="max-w-6xl mx-auto px-4 space-y-8">
          {/* Minimal Header */}
          <div className="text-center space-y-2 pt-8">
            <h1 className="text-4xl font-light tracking-tight">
              Gift Shop
            </h1>
            <p className="text-muted-foreground text-lg">Discover curated products for gifting</p>
          </div>

          {/* View Toggle & Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "shops" | "products")} className="w-auto">
              <TabsList className="grid w-full grid-cols-2 bg-muted/50">
                <TabsTrigger value="shops" className="flex items-center gap-2">
                  <Store className="h-4 w-4" />
                  Shops
                </TabsTrigger>
                <TabsTrigger value="products" className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  All Products
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="relative w-full sm:w-96">
              <Input
                placeholder={viewMode === "shops" ? "Search shops..." : "Search products..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-muted/30 border-muted-foreground/20 focus:border-primary"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          {/* Content */}
          <Tabs value={viewMode} className="w-full">
            <TabsContent value="shops" className="mt-0">
              <div className="space-y-6">
                {/* Shop Grid - Pairs of Two */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {shopsLoading ? (
                    [...Array(6)].map((_, i) => (
                      <div key={i} className="h-32 bg-muted/50 rounded-xl animate-pulse" />
                    ))
                  ) : filteredShops.length > 0 ? (
                    filteredShops.map((shop) => (
                      <Card 
                        key={shop.id}
                        className="group cursor-pointer border-muted-foreground/10 hover:border-primary/30 transition-all duration-300 hover:shadow-lg"
                        onClick={() => navigate(`/shop/${shop.id}`)}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center flex-shrink-0">
                              {shop.logo_image_url ? (
                                <img 
                                  src={shop.logo_image_url} 
                                  alt={shop.name}
                                  className="w-12 h-12 object-contain rounded-lg"
                                />
                              ) : (
                                <Store className="h-8 w-8 text-primary" />
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                                {shop.name}
                              </h3>
                              {shop.description && (
                                <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                                  {shop.description}
                                </p>
                              )}
                              <div className="flex items-center justify-between">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground"
                                >
                                  Browse Products
                                </Button>
                                {shop.website_url && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      window.open(shop.website_url!, '_blank');
                                    }}
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="col-span-2 text-center py-16">
                      <Store className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                      <h3 className="text-xl font-medium text-muted-foreground mb-2">No shops found</h3>
                      <p className="text-muted-foreground">Try adjusting your search criteria</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="products" className="mt-0">
              <div className="space-y-6">
                {/* Products Grid - Pairs of Two */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {allProductsLoading ? (
                    [...Array(8)].map((_, i) => (
                      <div key={i} className="h-40 bg-muted/50 rounded-xl animate-pulse" />
                    ))
                  ) : filteredAllProducts.length > 0 ? (
                    filteredAllProducts.map((product) => (
                      <Card 
                        key={product.id}
                        className="group cursor-pointer border-muted-foreground/10 hover:border-primary/30 transition-all duration-300 hover:shadow-lg"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center flex-shrink-0">
                              {product.image_url ? (
                                <img 
                                  src={product.image_url} 
                                  alt={product.name}
                                  className="w-16 h-16 object-cover rounded-lg"
                                />
                              ) : (
                                <Package className="h-8 w-8 text-primary" />
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors line-clamp-1">
                                {product.name}
                              </h3>
                              {product.description && (
                                <p className="text-muted-foreground text-sm line-clamp-2 mb-2">
                                  {product.description}
                                </p>
                              )}
                              <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                  <p className="font-semibold text-lg">₹{product.price}</p>
                                  {product.category && (
                                    <p className="text-xs text-muted-foreground">{product.category}</p>
                                  )}
                                </div>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground"
                                >
                                  Gift This
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="col-span-2 text-center py-16">
                      <Package className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                      <h3 className="text-xl font-medium text-muted-foreground mb-2">No products found</h3>
                      <p className="text-muted-foreground">Try adjusting your search criteria</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
