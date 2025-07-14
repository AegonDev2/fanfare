
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Gift, ArrowRight, Sparkles } from "lucide-react";
import { memo } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useShops } from "@/hooks/useShops";
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

  return (
    <div 
      className="relative p-2 h-full rounded-2xl overflow-hidden transition-all duration-500 transform group hover:scale-105" 
      onMouseEnter={() => setIsHovering(true)} 
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-funky-pink/10 via-white to-funky-purple/10 backdrop-blur-sm rounded-2xl border border-funky-pink/20 shadow-xl transition-all duration-500 z-0 group-hover:shadow-2xl group-hover:border-funky-pink/40"></div>
      
      <div className="relative z-10">
        <div className={cn("w-full aspect-square mb-3 overflow-hidden rounded-xl transition-all duration-500 relative", isHovering ? "shadow-2xl shadow-funky-pink/30" : "shadow-lg")}>
          <img 
            src={product.image_url} 
            alt={product.name} 
            loading="lazy" 
            className={cn("w-full h-full object-cover transition-all duration-500", isHovering ? "scale-110 rotate-1" : "scale-100")} 
          />
          {isHovering && (
            <div className="absolute inset-0 bg-gradient-to-t from-funky-pink/30 via-transparent to-funky-purple/20 opacity-100 transition-opacity duration-300">
              <Sparkles className="absolute top-2 right-2 h-5 w-5 text-white animate-pulse" />
            </div>
          )}
        </div>
        
        <div className="mt-2 relative">
          <h3 className="text-xs lg:text-sm font-semibold truncate font-display text-gray-950 mb-1">{product.name}</h3>
          <p className="text-sm lg:text-base text-funky-pink font-bold mb-2">₹{product.price}</p>
          <Button 
            size="sm" 
            onClick={handleGiftClick} 
            className={cn(
              "w-full text-[10px] lg:text-xs py-2 px-3 transition-all duration-300 rounded-xl font-medium",
              "bg-gradient-to-r from-funky-pink to-funky-purple text-white hover:shadow-xl hover:shadow-funky-pink/30 hover:scale-105 transform"
            )}
          >
            <Gift className="h-3 w-3 mr-1" />
            Gift This
          </Button>
        </div>
      </div>
    </div>
  );
});

ProductCard.displayName = "ProductCard";

const GiftCarousel = ({ products }: { products: any[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const isMobile = useIsMobile();
  const carouselRef = useRef<HTMLDivElement>(null);
  
  const itemsPerView = isMobile ? 2 : 4;
  const totalSlides = Math.ceil(products.length / itemsPerView);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = prev + direction;
        if (next >= totalSlides - 1) {
          setDirection(-1);
          return totalSlides - 1;
        } else if (next <= 0) {
          setDirection(1);
          return 0;
        }
        return next;
      });
    }, 3500);

    return () => clearInterval(interval);
  }, [totalSlides, direction]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-funky-pink/5 to-funky-purple/5 border-2 border-gradient-to-r from-funky-pink/20 to-funky-purple/20 shadow-xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,105,180,0.1),transparent_50%)]"></div>
      
      <div 
        ref={carouselRef}
        className="flex transition-all duration-1000 ease-in-out relative z-10"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {Array.from({ length: totalSlides }).map((_, slideIndex) => (
          <div key={slideIndex} className="w-full flex-shrink-0">
            <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-3 p-6`}>
              {products
                .slice(slideIndex * itemsPerView, (slideIndex + 1) * itemsPerView)
                .map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
            </div>
          </div>
        ))}
      </div>


      {/* Decorative Elements */}
      <div className="absolute top-4 left-4 w-6 h-6 bg-funky-pink/20 rounded-full animate-pulse"></div>
      <div className="absolute top-8 right-8 w-4 h-4 bg-funky-purple/20 rounded-full animate-pulse delay-700"></div>
      <div className="absolute bottom-12 right-6 w-3 h-3 bg-funky-pink/30 rounded-full animate-pulse delay-1000"></div>
    </div>
  );
};

const GiftSection = () => {
  const navigate = useNavigate();
  const { data: shops = [] } = useShops();
  const [searchValue, setSearchValue] = useState("");
  const isMobile = useIsMobile();

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

  return (
    <section className="mb-4 relative px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2 sm:mb-4 gap-2 mx-1">
          <div className="flex items-center justify-between w-full md:w-auto">
            <h2 className="font-display bg-clip-text bg-gradient-to-r from-funky-purple to-funky-pink text-gray-900 text-lg lg:text-xl font-semibold mx-0">
              Gift Shop
            </h2>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/gift-shop')}
              className="text-funky-purple hover:text-funky-pink hover:bg-funky-purple/10 flex items-center gap-1 md:hidden"
            >
              View All
              <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none py-[6px]">
              <Input
                placeholder="Search Gifts"
                type="text"
                value={searchValue}
                onChange={handleSearchChange}
                className="w-full md:w-64 lg:w-72 rounded-full backdrop-blur-sm border border-funky-purple/20 focus:border-funky-purple/50 pl-8 pr-3 py-1 text-xs lg:text-sm shadow-sm bg-white"
              />
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 lg:h-4 lg:w-4 text-funky-purple/60" />
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/gift-shop')}
              className="hidden md:flex items-center gap-2 border-funky-purple/30 text-funky-purple hover:bg-funky-purple/10 hover:border-funky-purple/50"
            >
              View All
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="relative">
          {isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 px-1">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="p-2">
                  <Skeleton className="w-full aspect-square rounded-lg mb-2" />
                  <Skeleton className="w-3/4 h-3 mb-1" />
                  <Skeleton className="w-1/2 h-3 mb-1" />
                  <Skeleton className="w-full h-6" />
                </div>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <GiftCarousel products={filteredProducts} />
          ) : (
            <div className="p-8 rounded-3xl bg-gradient-to-br from-white to-gray-50 border-2 border-dashed border-funky-purple/20 text-center">
              <Gift className="h-12 w-12 text-funky-purple/30 mb-4 mx-auto" />
              <p className="text-sm lg:text-base text-gray-600 dark:text-gray-300">No products found matching your search.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default memo(GiftSection);
