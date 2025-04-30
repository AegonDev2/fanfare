
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Home, ShoppingBag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// Define a type for order details which covers both tables
interface OrderDetails {
  id: string;
  created_at: string;
  user_id?: string;
  influencer_id?: string;
  product_url: string;
  product_title?: string;
  product_price?: number;
  platform_fee?: number;
  total_amount?: number;
  message?: string;
  shipping_address?: any;
  // Fields specific to completed orders
  completed_at?: string;
  delivery_estimate?: string;
  // Status to differentiate between tables
  status?: 'under_process' | 'completed';
}

const OrderSuccess = () => {
  const [searchParams] = useSearchParams();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const orderId = searchParams.get('id');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }

      try {
        // First try to find the order in the under_process table
        let { data, error } = await supabase
          .from('orders_under_process')
          .select('*')
          .eq('id', orderId)
          .single();

        // If not found there, try the completed table
        if (error) {
          const { data: completedData, error: completedError } = await supabase
            .from('orders_completed')
            .select('*')
            .eq('id', orderId)
            .single();
            
          if (!completedError) {
            data = {
              ...completedData,
              status: 'completed'
            };
          }
        } else {
          // Add status property if from under_process
          data = {
            ...data,
            status: 'under_process'
          };
        }

        if (data) {
          setOrderDetails(data);
        }
      } catch (error) {
        console.error("Error fetching order:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  return (
    <div className="min-h-screen bg-gray-100 pt-20">
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <div className="bg-green-100 p-6 rounded-full mb-6">
              <CheckCircle2 className="h-16 w-16 text-green-600" />
            </div>
            
            <h1 className="text-2xl font-bold mb-4">Order Successfully Placed!</h1>
            
            <p className="text-gray-600 mb-6">
              Your gift request has been submitted to the influencer for approval.
              You'll be notified when they respond.
            </p>
            
            <div className="grid grid-cols-2 gap-4 w-full mt-4">
              <Button 
                variant="outline"
                className="w-full" 
                onClick={() => navigate('/')}
              >
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
              <Button 
                className="w-full"
                onClick={() => navigate('/gift-requests')}
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                My Requests
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrderSuccess;
