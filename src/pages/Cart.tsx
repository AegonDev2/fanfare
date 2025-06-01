
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ShoppingCart, Trash2, Loader2 } from 'lucide-react';
import Header from '@/components/landing/Header';
import CartItem from '@/components/cart/CartItem';
import CartSummary from '@/components/cart/CartSummary';
import { useCart } from '@/hooks/useCart';
import { useUser } from '@/hooks/useUser';
import { supabase } from '@/integrations/supabase/client';

export default function Cart() {
  const {
    cartItems,
    isLoading,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    platformFee,
    total,
    itemCount
  } = useCart();
  
  const { user } = useUser();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [influencerDetails, setInfluencerDetails] = useState<Record<string, any>>({});

  // Load influencer details
  useEffect(() => {
    async function loadInfluencerDetails() {
      const influencerIds = [...new Set(cartItems.map(item => item.influencer_id))];
      if (influencerIds.length === 0) return;

      try {
        const { data, error } = await supabase
          .from('influencer_profiles')
          .select('id, name, profile_image')
          .in('id', influencerIds);
        
        if (error) throw error;
        
        const details: Record<string, any> = {};
        data?.forEach(influencer => {
          details[influencer.id] = influencer;
        });
        
        setInfluencerDetails(details);
      } catch (error) {
        console.error('Error loading influencer details:', error);
      }
    }
    
    loadInfluencerDetails();
  }, [cartItems]);

  const handleCheckout = async () => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to checkout',
        variant: 'destructive'
      });
      navigate('/auth');
      return;
    }

    if (itemCount === 0) {
      toast({
        title: 'Cart Empty',
        description: 'Please add some items to your cart',
        variant: 'destructive'
      });
      return;
    }

    setProcessing(true);
    try {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('gift_orders')
        .insert({
          user_id: user.id,
          status: 'pending',
          platform_fee: platformFee,
          total_amount: total
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Add order items
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        gift_name: item.gift_name,
        gift_price: item.gift_price,
        gift_image_url: item.gift_image_url,
        gift_description: item.gift_description,
        gift_url: item.gift_url || '',
        influencer_id: item.influencer_id,
        status: 'pending',
        message: item.message
      }));

      const { error: itemsError } = await supabase
        .from('gift_order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Clear cart
      await clearCart();
      
      toast({
        title: 'Order Placed',
        description: 'Your order has been placed successfully',
      });

      navigate('/order-success', { state: { orderId: order.id } });
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast({
        title: 'Checkout Failed',
        description: error.message || 'Failed to process your order',
        variant: 'destructive'
      });
    } finally {
      setProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 pt-20 py-8 flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
          <p className="mt-4 text-lg">Loading your cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 pt-20 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/gift-selection')}
            className="text-gray-600"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Continue Shopping
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Your Cart ({itemCount} items)
                  </CardTitle>
                  
                  {itemCount > 0 && (
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
                {itemCount === 0 ? (
                  <div className="text-center py-16">
                    <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-500 mb-2">Your cart is empty</h3>
                    <p className="text-gray-400 mb-6">Discover amazing gifts for your favorite influencers!</p>
                    
                    <Button onClick={() => navigate('/gift-selection')}>
                      Browse Gifts
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cartItems.map(item => {
                      const influencer = influencerDetails[item.influencer_id];
                      return (
                        <CartItem
                          key={item.id}
                          item={item}
                          influencerName={influencer?.name}
                          influencerImage={influencer?.profile_image}
                          onUpdateQuantity={updateQuantity}
                          onRemove={removeFromCart}
                        />
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-1">
            <CartSummary
              subtotal={subtotal}
              platformFee={platformFee}
              total={total}
              itemCount={itemCount}
              onCheckout={handleCheckout}
              isProcessing={processing}
              isAuthenticated={!!user}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
