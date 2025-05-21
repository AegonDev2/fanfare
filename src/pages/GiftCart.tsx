
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Gift, Trash2, ShoppingCart, ArrowLeft } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Header from '@/components/landing/Header';
import { useGiftCart, CartItem } from '@/hooks/useGiftCart';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

export default function GiftCart() {
  const { cartItems, removeFromCart, clearCart } = useGiftCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [influencerDetails, setInfluencerDetails] = useState<Record<string, any>>({});
  
  console.log("GiftCart rendered with cartItems:", cartItems);
  
  // Load influencer details for each item in the cart
  useEffect(() => {
    async function loadInfluencerDetails() {
      const influencerIds = [...new Set(cartItems.map(item => item.influencerId))];
      
      if (influencerIds.length === 0) return;
      
      try {
        console.log("Fetching influencer details for IDs:", influencerIds);
        const { data, error } = await supabase
          .from('influencer_profiles')
          .select('id, name, profile_image')
          .in('id', influencerIds);
          
        if (error) throw error;
        
        const details: Record<string, any> = {};
        data?.forEach(influencer => {
          details[influencer.id] = influencer;
        });
        
        console.log("Fetched influencer details:", details);
        setInfluencerDetails(details);
      } catch (error) {
        console.error('Error loading influencer details:', error);
      }
    }
    
    loadInfluencerDetails();
  }, [cartItems]);

  const totalPrice = cartItems.reduce((sum, item) => sum + (item.gift?.price || 0), 0);
  const platformFee = cartItems.length > 0 ? 5 : 0;
  const totalAmount = totalPrice + platformFee;
  
  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      toast({
        title: 'Cart Empty',
        description: 'Your cart is empty. Please add some gifts.',
        variant: 'destructive',
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Process each gift request
      for (const item of cartItems) {
        // For each gift, redirect to place order with the gift URL
        navigate(`/place-order?gift=${encodeURIComponent(item.gift.gift_url || '')}&influencer=${item.influencerId}`, { replace: true });
        // We only process the first item and let the user complete that flow
        // After the first order is complete, they can come back to process the remaining items
        break;
      }
    } catch (error) {
      console.error('Error processing checkout:', error);
      toast({
        title: 'Checkout Failed',
        description: 'There was an error processing your request. Please try again.',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="container mx-auto px-4 pt-20 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/gift-selection')}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Continue Shopping
          </Button>
          
          <h1 className="text-2xl font-bold">Your Gift Cart</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Your Gifts ({cartItems.length})</CardTitle>
                  
                  {cartItems.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearCart}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Clear Cart
                    </Button>
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                {cartItems.length === 0 ? (
                  <div className="text-center py-16">
                    <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-500 mb-2">Your cart is empty</h3>
                    <p className="text-gray-400 mb-6">Add some gifts to get started!</p>
                    
                    <Button onClick={() => navigate('/gift-selection')}>
                      Browse Gifts
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cartItems.map((item, index) => {
                      const influencer = influencerDetails[item.influencerId] || {};
                      console.log(`Item ${index}:`, item, "Influencer:", influencer);
                      
                      return (
                        <div key={index} className="flex gap-4 p-4 border rounded-lg">
                          <div className="w-16 h-16 rounded-md overflow-hidden bg-white">
                            <img
                              src={item.gift.image_url}
                              alt={item.gift.name}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <h3 className="font-medium">{item.gift.name}</h3>
                              <p className="font-medium text-funky-purple">₹{item.gift.price}</p>
                            </div>
                            
                            <div className="flex items-center mt-2">
                              <Gift className="h-3 w-3 text-gray-400 mr-1" />
                              <span className="text-xs text-gray-500 mr-2">For:</span>
                              
                              <div className="flex items-center">
                                <Avatar className="h-5 w-5 mr-1">
                                  <AvatarImage src={influencer.profile_image || undefined} />
                                  <AvatarFallback className="text-[9px] bg-funky-purple/10">
                                    {influencer.name?.slice(0, 2).toUpperCase() || '?'}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs font-medium">{influencer.name || 'Loading...'}</span>
                              </div>
                            </div>
                            
                            {item.message && (
                              <div className="mt-2 text-xs text-gray-500 italic">
                                "{item.message.length > 50 ? `${item.message.slice(0, 50)}...` : item.message}"
                              </div>
                            )}
                          </div>
                          
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-500 hover:text-red-700 h-8 w-8 p-0 rounded-full"
                            onClick={() => removeFromCart(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>₹{totalPrice.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Platform Fee</span>
                    <span>₹{platformFee.toFixed(2)}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span className="text-funky-purple">₹{totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter>
                <div className="w-full space-y-3">
                  <Button
                    className={cn(
                      "w-full bg-gradient-to-r from-funky-purple to-funky-pink text-white",
                      loading && "opacity-70 cursor-not-allowed"
                    )}
                    onClick={handleCheckout}
                    disabled={cartItems.length === 0 || loading}
                  >
                    {loading ? (
                      <>
                        <ShoppingCart className="h-4 w-4 mr-2 animate-pulse" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Checkout
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate('/gift-selection')}
                  >
                    Continue Shopping
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
