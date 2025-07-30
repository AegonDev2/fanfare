import React, { useState, useCallback, useEffect, useMemo, memo, useRef } from 'react';
import { Search, ShoppingBag, Sparkles, Gift, Heart, ArrowRight, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useShops } from '@/hooks/useShops';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
// Removed embla-carousel import as it's causing issues - using custom implementation

const ProductCard = memo(({
  product
}: {
  product: any;
}) => {
  const navigate = useNavigate();
  const handleGiftClick = () => {
    const params = new URLSearchParams({
      giftName: encodeURIComponent(product.name),
      giftPrice: product.price.toString(),
      giftImage: encodeURIComponent(product.image_url || ''),
      giftId: product.id,
      gift: product.url || product.product_url || '',
      shopProduct: 'true' // Flag to indicate this is a shop product
    });
    navigate(`/place-order?${params.toString()}`);
  };
  return <Card className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white to-funky-pink/5 border-2 border-funky-pink/20 hover:border-funky-purple/40 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-funky-purple/25 cursor-pointer">
      <div className="absolute inset-0 bg-gradient-to-t from-funky-purple/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <CardContent className="p-1 lg:p-2 relative z-10">
        <div className="aspect-square mb-2 overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 relative">
          <img src={product.image_url || '/placeholder.svg'} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <Button size="icon" onClick={handleGiftClick} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm shadow-lg border border-funky-pink/20 text-funky-purple hover:bg-funky-purple hover:text-white transition-all duration-300 opacity-0 group-hover:opacity-100 transform scale-0 group-hover:scale-100">
            <Gift className="h-3.5 w-3.5" />
          </Button>
        </div>
        <div className="space-y-1.5">
          <h3 className="font-semibold text-gray-900 text-[10px] lg:text-xs leading-tight group-hover:text-funky-purple transition-colors duration-300 line-clamp-2 min-h-[2.5rem]">
            {product.name}
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <span className="text-[10px] lg:text-xs font-bold text-funky-purple">{product.price?.toLocaleString() || 'N/A'}</span>
            </div>
            
            <Badge variant="secondary" className="bg-funky-pink/10 text-funky-pink border-funky-pink/20 text-[10px] px-1.5 py-0.5">
              <Gift className="h-2.5 w-2.5 mr-1" />
              Gift
            </Badge>
          </div>
          
          <Button onClick={handleGiftClick} size="sm" className="w-full mt-2 bg-gradient-to-r from-funky-purple to-funky-pink hover:from-funky-pink hover:to-funky-purple text-white border-0 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 text-[9px] lg:text-[10px] py-1.5 h-7">
            <Heart className="h-2.5 w-2.5 mr-1" />
            Gift This
          </Button>
        </div>
      </CardContent>
    </Card>;
});
ProductCard.displayName = "ProductCard";
const GiftCarousel = ({
  products
}: {
  products: any[];
}) => {
  const isMobile = useIsMobile();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startX, setStartX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const itemsPerView = isMobile ? 2 : 4;
  const totalSlides = Math.ceil(products.length / itemsPerView);

  const scrollPrev = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  const scrollNext = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % totalSlides);
  }, [totalSlides]);

  // Touch/Mouse event handlers for swipe support
  const handleStart = (clientX: number) => {
    setStartX(clientX);
    setIsDragging(true);
  };

  const handleMove = (clientX: number) => {
    if (!isDragging) return;
  };

  const handleEnd = (clientX: number) => {
    if (!isDragging) return;
    setIsDragging(false);
    const deltaX = startX - clientX;
    const threshold = 50;

    if (deltaX > threshold) {
      scrollNext();
    } else if (deltaX < -threshold) {
      scrollPrev();
    }
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    handleEnd(e.changedTouches[0].clientX);
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    handleStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    handleEnd(e.clientX);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-slate-50/50 to-white border border-funky-purple/10 shadow-lg">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_30%_20%,rgba(168,85,247,0.4),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(236,72,153,0.4),transparent_50%)]"></div>
      
      <div 
        ref={carouselRef} 
        className="flex transition-transform duration-300 ease-out relative z-10 cursor-grab active:cursor-grabbing"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={isDragging ? handleMouseMove : undefined}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {Array.from({ length: totalSlides }).map((_, slideIndex) => (
          <div key={slideIndex} className="w-full flex-shrink-0">
            <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-4 p-6`}>
              {products
                .slice(slideIndex * itemsPerView, (slideIndex + 1) * itemsPerView)
                .map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Buttons - Desktop only */}
      <button
        onClick={scrollPrev}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-md rounded-full shadow-lg items-center justify-center text-funky-purple hover:bg-white hover:shadow-xl transition-all duration-200 hover:scale-105 hidden lg:flex z-20 border border-funky-purple/10"
      >
        <ArrowRight className="h-5 w-5 rotate-180" />
      </button>
      
      <button
        onClick={scrollNext}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-md rounded-full shadow-lg items-center justify-center text-funky-purple hover:bg-white hover:shadow-xl transition-all duration-200 hover:scale-105 hidden lg:flex z-20 border border-funky-purple/10"
      >
        <ArrowRight className="h-5 w-5" />
      </button>

      {/* Slide indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {Array.from({ length: totalSlides }).map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-200",
              index === currentIndex 
                ? "bg-funky-purple w-6" 
                : "bg-funky-purple/30 hover:bg-funky-purple/50"
            )}
          />
        ))}
      </div>
    </div>
  );
};
const GiftSection = () => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const {
    data: shops
  } = useShops();
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const {
          data,
          error
        } = await supabase.from('shop_products').select('*').eq('is_available', true).order('is_featured', {
          ascending: false
        }).order('ranking', {
          ascending: true
        }).order('created_at', {
          ascending: false
        }).limit(20);
        if (error) throw error;
        setProducts(data || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };
  const filteredProducts = useMemo(() => {
    return products.filter(product => product.name.toLowerCase().includes(searchValue.toLowerCase()) || product.description?.toLowerCase().includes(searchValue.toLowerCase()) || product.category?.toLowerCase().includes(searchValue.toLowerCase()));
  }, [products, searchValue]);
  const handleViewAllClick = () => {
    navigate('/gift-shop');
  };
  if (loading) {
    return <section className="mb-8 relative py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h2 className="font-display text-2xl lg:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-funky-purple to-funky-pink">
              Gift Collection
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="aspect-square rounded-3xl" />)}
          </div>
        </div>
      </section>;
  }
  return <section className="mb-8 relative py-8 px-4">
      <div className="absolute inset-0 bg-gradient-to-br from-funky-pink/5 to-funky-purple/5 rounded-3xl"></div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="flex items-center justify-between w-full md:w-auto">
            <h2 className="font-display text-2xl lg:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-funky-purple to-funky-pink"> Gift Collection</h2>
            
            <Button variant="ghost" size="sm" onClick={handleViewAllClick} className="text-funky-purple hover:text-funky-pink hover:bg-funky-purple/10 flex items-center gap-1 md:hidden">
              View All
              <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <Input placeholder="Search gifts..." type="text" value={searchValue} onChange={handleSearchChange} className="w-full md:w-64 lg:w-72 rounded-full backdrop-blur-sm border border-funky-purple/20 focus:border-funky-purple/50 pl-10 pr-4 py-2 text-sm shadow-lg bg-white/90" />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-funky-purple/60" />
            </div>
            
            <Button variant="outline" size="sm" onClick={handleViewAllClick} className="hidden md:flex items-center gap-2 border-funky-purple/30 text-funky-purple hover:bg-funky-purple/10 hover:border-funky-purple/50 rounded-full">
              View All
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="relative">
          {filteredProducts && filteredProducts.length > 0 ? <GiftCarousel products={filteredProducts.slice(0, 16)} /> : <div className="bg-white/50 backdrop-blur-sm p-12 rounded-3xl shadow-lg text-center border border-funky-purple/10">
              <ShoppingBag className="h-12 w-12 text-funky-purple/50 mb-4 mx-auto" />
              <p className="text-lg text-gray-600">No products found matching your search.</p>
              <p className="text-sm text-gray-500 mt-2">Try a different search term or browse all products.</p>
            </div>}
        </div>
      </div>
    </section>;
};
export default memo(GiftSection);