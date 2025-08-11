import React, { useState, useCallback, useEffect, useMemo, memo, useRef } from 'react';
import { Search, ShoppingBag, Sparkles, Gift, Heart, ArrowRight, Star, ExternalLink } from 'lucide-react';
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

  const handleLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent parent card click
    const productUrl = product.url || product.product_url;
    if (productUrl) {
      window.open(productUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return <Card className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white to-funky-pink/5 border-2 border-funky-pink/20 hover:border-funky-purple/40 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-funky-purple/25 cursor-pointer">
      <div className="absolute inset-0 bg-gradient-to-t from-funky-purple/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <CardContent className="p-1 lg:p-2 relative z-10">
        <div className="aspect-square mb-2 overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 relative">
          <img src={product.image_url || '/placeholder.svg'} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <Button 
            size="icon" 
            onClick={handleLinkClick} 
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm shadow-lg border border-funky-pink/20 text-funky-purple hover:bg-funky-purple hover:text-white transition-all duration-300 opacity-0 group-hover:opacity-100 transform scale-0 group-hover:scale-100"
            title="View Product"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
        </div>
        
        <div className="space-y-1">
          <h3 className="font-semibold text-gray-900 text-xs lg:text-sm line-clamp-2 leading-tight group-hover:text-funky-purple transition-colors duration-300">
            {product.name}
          </h3>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <span className="text-xs lg:text-sm font-bold text-funky-purple">
                ₹{product.price?.toLocaleString() || 'N/A'}
              </span>
            </div>
            
            <Badge variant="secondary" className="bg-funky-pink/10 text-funky-pink border-funky-pink/20 text-[10px] px-1.5 py-0.5">
              <Gift className="h-2.5 w-2.5 mr-1" />
              Gift
            </Badge>
          </div>
          
          <Button onClick={handleGiftClick} size="sm" className="w-full mt-2 bg-gradient-to-r from-funky-purple to-funky-pink hover:from-funky-pink hover:to-funky-purple text-white border-0 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 text-[10px] lg:text-xs py-1.5">
            <Heart className="h-3 w-3 mr-1" />
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
  return <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-funky-pink/5 to-funky-purple/5 border-2 border-gradient-to-r from-funky-pink/20 to-funky-purple/20 shadow-xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,105,180,0.1),transparent_50%)]"></div>
      
      <div ref={carouselRef} className="flex transition-transform duration-300 ease-out relative z-10 cursor-grab active:cursor-grabbing" style={{
      transform: `translateX(-${currentIndex * 100}%)`
    }} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} onMouseDown={handleMouseDown} onMouseMove={isDragging ? handleMouseMove : undefined} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
        {Array.from({
        length: totalSlides
      }).map((_, slideIndex) => <div key={slideIndex} className="w-full flex-shrink-0">
            <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-4 p-4`}>
              {products.slice(slideIndex * itemsPerView, (slideIndex + 1) * itemsPerView).map(product => <ProductCard key={product.id} product={product} />)}
            </div>
          </div>)}
      </div>

      {/* Navigation Buttons - Only visible on desktop/laptop */}
      <button onClick={scrollPrev} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full shadow-lg items-center justify-center text-funky-purple hover:bg-white transition-all duration-200 hover:scale-110 hidden lg:flex z-20">
        <ArrowRight className="h-4 w-4 rotate-180" />
      </button>
      
      <button onClick={scrollNext} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full shadow-lg items-center justify-center text-funky-purple hover:bg-white transition-all duration-200 hover:scale-110 hidden lg:flex z-20">
        <ArrowRight className="h-4 w-4" />
      </button>

      {/* Decorative Elements */}
      <div className="absolute top-4 left-4 w-6 h-6 bg-funky-pink/20 rounded-full animate-pulse"></div>
      <div className="absolute top-8 right-8 w-4 h-4 bg-funky-purple/20 rounded-full animate-pulse delay-700"></div>
      <div className="absolute bottom-12 right-6 w-3 h-3 bg-funky-pink/30 rounded-full animate-pulse delay-1000"></div>
    </div>;
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