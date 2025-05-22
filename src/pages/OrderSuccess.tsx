
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Gift, ArrowLeft, ShoppingBag, Home } from 'lucide-react';
import Header from '@/components/landing/Header';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

export default function OrderSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const orderId = location.state?.orderId;
  
  useEffect(() => {
    async function fetchOrderDetails() {
      if (!orderId) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Fetch order items
        const { data: items, error } = await supabase
          .from('gift_order_items')
          .select('*')
          .eq('order_id', orderId);
          
        if (error) {
          console.error('Error fetching order items:', error);
          throw error;
        }
        
        console.log('Order items:', items);
        setOrderItems(items || []);
      } catch (error) {
        console.error('Error in fetchOrderDetails:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchOrderDetails();
  }, [orderId]);
  
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="container mx-auto px-4 pt-20 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="border-green-100 mb-6">
            <CardHeader className="bg-green-50 border-b border-green-100">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
                <CardTitle>Order Placed Successfully!</CardTitle>
              </div>
            </CardHeader>
            
            <CardContent className="py-6">
              <div className="text-center mb-6">
                <p className="text-gray-600 mb-4">
                  Thank you for your order! Your gift requests have been sent to the influencers for approval.
                </p>
                <p className="text-gray-500 text-sm">
                  You'll receive notifications when they accept or when your gifts are on their way.
                </p>
              </div>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-pulse w-full h-20 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="animate-pulse w-full h-20 bg-gray-200 rounded-lg"></div>
                </div>
              ) : orderItems.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium mb-3 flex items-center">
                    <Gift className="h-5 w-5 mr-2 text-funky-purple" />
                    Order Items
                  </h3>
                  
                  {orderItems.map((item, index) => (
                    <div key={index} className="p-3 border rounded-lg flex items-center gap-3">
                      {item.gift_image_url ? (
                        <img 
                          src={item.gift_image_url} 
                          alt={item.gift_name} 
                          className="h-12 w-12 object-cover rounded"
                        />
                      ) : (
                        <div className="h-12 w-12 bg-gray-100 rounded flex items-center justify-center">
                          <Gift className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                      
                      <div className="flex-1">
                        <p className="font-medium">{item.gift_name}</p>
                        <p className="text-sm text-gray-500">₹{item.gift_price}</p>
                      </div>
                      
                      <div className="px-2 py-1 rounded bg-yellow-50 text-yellow-700 text-xs border border-yellow-100">
                        Pending
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No items found for this order.
                </div>
              )}
            </CardContent>
            
            <CardFooter className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
              <Button 
                variant="outline" 
                className="w-full sm:w-auto"
                onClick={() => navigate('/')}
              >
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Button>
              
              <Button 
                className={cn(
                  "w-full sm:w-auto bg-gradient-to-r from-funky-purple to-funky-pink text-white"
                )}
                onClick={() => navigate('/gift-selection')}
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                Continue Shopping
              </Button>
            </CardFooter>
          </Card>
          
          <div className="text-center text-sm text-gray-500">
            <p>You can track your orders in your profile dashboard.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
