
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Gift, Trash2, ShoppingCart, ArrowLeft, Loader2, Plus, Minus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Header from '@/components/landing/Header';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useGiftCart } from '@/hooks/useGiftCart';
import { useUser } from '@/hooks/useUser';

export default function GiftCart() {
  const { items, removeFromCart, clearCart, checkout, isLoading, refreshCart } = useGiftCart();
  const { user } = useUser();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [influencerDetails, setInfluencerDetails] = useState<Record<string, any>>({});
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  
  console.log("GiftCart rendered with items:", items);
  
  // Initialize quantities
  useEffect(() => {
    const initialQuantities: Record<string, number> = {};
    items.forEach(item => {
      initialQuantities[item.id] = item.quantity || 1;
    });
    setQuantities(initialQuantities);
  }, [items]);

  // Load influencer details for each item in the cart
  useEffect(() => {
    async function loadInfluencerDetails() {
      const influencerIds = [...new Set(items.map(item => item.influencerId))];
      
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
  }, [items]);

  useEffect(() => {
    // Refresh cart when component mounts
    refreshCart();
  }, [refreshCart, user]);

  // Update item quantity
  const updateQuantity = (itemId: string, change: number) => {
    setQuantities(prev => {
      const newQuantity = Math.max(1, (prev[itemId] || 1) + change);
      return { ...prev, [itemId]: newQuantity };
    });
  };

  // Calculate totals based on cart items and quantities
  const totalPrice = items.reduce((sum, item) => {
    const quantity = quantities[item.id] || 1;
    return sum + (Number(item.gift.price || 0) * quantity);
  }, 0);
  
  const platformFee = items.length > 0 ? items.length * 5 : 0;
  const totalAmount = totalPrice + platformFee;
  
  const handleCheckout = async () => {
    if (items.length === 0) {
      toast({
        title: 'Cart Empty',
        description: 'Your cart is empty. Please add some gifts.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to checkout',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }
    
    setProcessing(true);
    
    try {
      const orderId = await checkout();
      if (orderId) {
        // Redirect to success page
        navigate('/order-success', { 
          state: { orderId } 
        });
      }
    } catch (error) {
      console.error('Error processing checkout:', error);
      toast({
        title: 'Checkout Failed',
        description: 'There was an error processing your request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <div className="container mx-auto px-4 pt-20 py-8 flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-funky-purple" />
          <p className="mt-4 text-lg">Loading your cart...</p>
        </div>
      </div>
    );
  }
  
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
                  <CardTitle>Your Gifts ({items.length})</CardTitle>
                  
                  {items.length > 0 && (
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
                {items.length === 0 ? (
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
                    {items.map((item) => {
                      const influencer = influencerDetails[item.influencerId] || {};
                      const quantity = quantities[item.id] || 1;
                      
                      return (
                        <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
                          <div className="w-16 h-16 rounded-md overflow-hidden bg-white">
                            <img
                              src={item.gift.image_url || '/placeholder.svg'}
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
                            
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 w-7 p-0 rounded-full"
                                  onClick={() => updateQuantity(item.id, -1)}
                                  disabled={quantity <= 1}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="mx-2 min-w-[2rem] text-center">{quantity}</span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 w-7 p-0 rounded-full"
                                  onClick={() => updateQuantity(item.id, 1)}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-500 hover:text-red-700 h-8 w-8 p-0 rounded-full"
                                onClick={() => removeFromCart(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
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
                      (processing || !user) && "opacity-70 cursor-not-allowed"
                    )}
                    onClick={handleCheckout}
                    disabled={items.length === 0 || processing || !user}
                  >
                    {processing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
