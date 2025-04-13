
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Home, ShoppingBag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const OrderSuccess = () => {
  const [searchParams] = useSearchParams();
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const orderId = searchParams.get('id');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        return;
      }

      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*, products(*)')
          .eq('id', orderId)
          .single();

        if (error) {
          throw error;
        }

        setOrderDetails(data);
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
