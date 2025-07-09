import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Gift } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { memo } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useShops } from "@/hooks/useShops";
import { useShopProducts } from "@/hooks/useShopProducts";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
const ProductCard = memo(({
  product
}: {
  product: any;
}) => {
  const navigate = useNavigate();
  const [isHovering, setIsHovering] = useState(false);
  const handleGiftClick = useCallback(() => {
    navigate(`/place-order?productName=${encodeURIComponent(product.name)}&productPrice=${product.price}&productUrl=${encodeURIComponent(product.product_url || '')}&productImage=${encodeURIComponent(product.image_url || '')}&shopProduct=true`);
  }, [navigate, product]);
  return <div className="relative p-1 lg:p-2 h-full rounded-xl overflow-hidden transition-all duration-300 transform group" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
      <div className="absolute inset-0 bg-gradient-to-tr from-funky-purple/5 to-funky-pink/5 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg transition-all duration-500 z-0 group-hover:bg-gradient-to-tr group-hover:from-funky-purple/10 group-hover:to-funky-pink/10 bg-slate-50"></div>
      
      <div className="relative z-10">
        <div className={cn("w-full aspect-square mb-2 overflow-hidden rounded-lg transition-all duration-500", isHovering ? "shadow-lg shadow-funky-purple/20" : "")}>
          <img src={product.image_url} alt={product.name} loading="lazy" className={cn("w-full h-full object-cover transition-all duration-500", isHovering ? "scale-110" : "scale-100")} />
        </div>
        
        <div className="mt-1 relative">
          <h3 className="text-xs lg:text-sm font-semibold truncate font-display text-gray-950">{product.name}</h3>
          <p className="text-xs lg:text-sm text-funky-purple font-medium">₹{product.price}</p>
          <Button size="sm" onClick={handleGiftClick} className={cn("mt-1 w-full text-[10px] lg:text-xs py-1 px-2 transition-all duration-300", "bg-gradient-to-r from-funky-purple to-funky-pink text-white hover:shadow-lg hover:shadow-funky-purple/20")}>
            <Gift className="h-3 w-3 mr-1" />
            Gift This
          </Button>
        </div>
      </div>
    </div>;
});
ProductCard.displayName = "ProductCard";
const GiftSection = () => {
  const { data: shops = [] } = useShops();
  const [searchValue, setSearchValue] = useState("");
  const carouselRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Get all products from all shops
  const allShopProducts = useMemo(() => {
    const products: any[] = [];
    shops.forEach(shop => {
      // For now, we'll create a hook to fetch all shop products
      // This is a simplified approach - in production you might want to optimize this
    });
    return products;
  }, [shops]);

  // We need to create a custom hook to get all shop products
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('shop_products')
          .select('*')
          .eq('is_available', true)
          .order('name');
        
        if (error) throw error;
        setAllProducts(data || []);
      } catch (error) {
        console.error('Error fetching shop products:', error);
        setAllProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllProducts();
  }, []);

  // Using useMemo to filter products to prevent unnecessary re-renders
  const filteredProducts = useMemo(() => {
    if (!allProducts || !Array.isArray(allProducts)) return [];
    if (searchValue.trim() === "") {
      return allProducts;
    }
    return allProducts.filter(product => 
      product.name.toLowerCase().includes(searchValue.toLowerCase()) || 
      (product.description && product.description.toLowerCase().includes(searchValue.toLowerCase()))
    );
  }, [allProducts, searchValue]);
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  }, []);
  return <section className="mb-4 relative px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2 sm:mb-4 gap-2 mx-1">
          <h2 className="font-display bg-clip-text bg-gradient-to-r from-funky-purple to-funky-pink text-gray-900 text-lg lg:text-xl font-semibold mx-0">Gift Shop</h2>
          
          <div className="relative w-full md:w-auto py-[6px]">
            <Input placeholder="Search Gifts" type="text" value={searchValue} onChange={handleSearchChange} className="w-full md:w-64 lg:w-72 rounded-full backdrop-blur-sm border border-funky-purple/20 focus:border-funky-purple/50 pl-8 pr-3 py-1 text-xs lg:text-sm shadow-sm bg-zinc-100" />
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 lg:h-4 lg:w-4 text-funky-purple/60" />
          </div>
        </div>
        
        <div className="relative" ref={carouselRef}>
          {isLoading ? <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 px-1">
              {[...Array(4)].map((_, i) => <div key={i} className="p-2">
                  <Skeleton className="w-full aspect-square rounded-lg mb-2" />
                  <Skeleton className="w-3/4 h-3 mb-1" />
                  <Skeleton className="w-1/2 h-3 mb-1" />
                  <Skeleton className="w-full h-6" />
                </div>)}
            </div> : <Carousel opts={{
          align: "start",
          loop: true,
          skipSnaps: false,
          dragFree: true
        }} className="w-full">
              <CarouselContent className="-ml-1">
                {filteredProducts.length > 0 ? filteredProducts.map(product => <CarouselItem key={product.id} className="pl-1 basis-1/2 lg:basis-1/4 transition-all duration-300">
                      <ProductCard product={product} />
                    </CarouselItem>) : <CarouselItem className="pl-1 basis-full">
                    <div className="p-3 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-funky-purple/10 text-center">
                      <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-300">No products found matching your search.</p>
                    </div>
                  </CarouselItem>}
              </CarouselContent>
              
              <CarouselPrevious className="left-0 h-6 w-6 lg:h-8 lg:w-8 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-funky-purple/20 hover:bg-funky-purple/10 text-funky-purple" />
              <CarouselNext className="right-0 h-6 w-6 lg:h-8 lg:w-8 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-funky-purple/20 hover:bg-funky-purple/10 text-funky-purple" />
            </Carousel>}
        </div>
      </div>
    </section>;
};
export default memo(GiftSection);