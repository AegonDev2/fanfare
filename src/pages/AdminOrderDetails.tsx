import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import FloatingHeader from '@/components/ui/floating-header';
import Navbar from '@/components/navigation/Navbar';
import { 
  ArrowLeft, 
  Package,
  User,
  Calendar,
  DollarSign,
  MapPin,
  MessageSquare,
  ExternalLink
} from "lucide-react";
import { format } from "date-fns";

interface OrderDetails {
  id: string;
  user_id?: string;
  sender_id?: string;
  product_title: string;
  product_url: string;
  product_price: number;
  platform_fee?: number;
  total_amount?: number;
  created_at: string;
  message?: string;
  influencer_id?: string;
  shipping_address?: any;
  delivery_estimate?: string;
}

export default function AdminOrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [navOpen, setNavOpen] = useState(false);
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) {
        toast({
          title: "Error",
          description: "Order ID is missing.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single();

        if (error) {
          throw error;
        }

        // Use data directly from orders table
        const transformedOrder: OrderDetails = {
          id: data.id,
          user_id: data.user_id,
          sender_id: data.sender_id,
          product_title: data.product_title || 'Unknown Product',
          product_url: data.product_url,
          product_price: data.product_price || 0,
          platform_fee: data.platform_fee || 5.00,
          total_amount: data.total_amount || (data.product_price || 0) + 5.00,
          created_at: data.created_at,
          message: data.message,
          influencer_id: data.influencer_id,
          shipping_address: data.shipping_address,
          delivery_estimate: data.delivery_estimate,
        };

        setOrder(transformedOrder);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to load order details.",
          variant: "destructive",
        });
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, toast]);

  if (loading) {
    return (
      <>
        <FloatingHeader setNavOpen={setNavOpen} />
        <Navbar isOpen={navOpen} setIsOpen={setNavOpen} />
        <div className="min-h-screen bg-background pt-20">
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-funky-purple"></div>
          </div>
        </div>
      </>
    );
  }

  if (!order) {
    return (
      <>
        <FloatingHeader setNavOpen={setNavOpen} />
        <Navbar isOpen={navOpen} setIsOpen={setNavOpen} />
        <div className="min-h-screen bg-background pt-20">
          <div className="max-w-4xl mx-auto p-6">
            <Card>
              <CardContent className="pt-6 text-center">
                <h2 className="text-xl font-semibold mb-2">Order Not Found</h2>
                <p className="text-gray-600 mb-4">The requested order could not be found.</p>
                <Button onClick={() => navigate('/admin')}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <FloatingHeader setNavOpen={setNavOpen} />
      <Navbar isOpen={navOpen} setIsOpen={setNavOpen} />
      
      <div className="min-h-screen bg-background pt-20">
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="text-funky-purple hover:bg-funky-purple/10"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-funky-purple to-funky-pink bg-clip-text text-transparent">
              Order Details
            </h1>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Order ID: {order.id}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Product:</span>
                  </div>
                  <p className="text-gray-900">{order.product_title}</p>
                  <a href={order.product_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center gap-1">
                    <ExternalLink className="h-4 w-4" />
                    View Product
                  </a>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">User ID:</span>
                  </div>
                  <p className="text-gray-900">{order.user_id}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Order Date:</span>
                  </div>
                  <p className="text-gray-900">{format(new Date(order.created_at), 'MMM dd, yyyy hh:mm a')}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Amount:</span>
                  </div>
                  <p className="text-gray-900">₹{(order.total_amount || 0).toFixed(2)}</p>
                </div>
              </div>

              {order.message && (
                <div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Message:</span>
                  </div>
                  <p className="text-gray-900">{order.message}</p>
                </div>
              )}

              {order.influencer_id && (
                <div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Influencer ID:</span>
                  </div>
                  <p className="text-gray-900">{order.influencer_id}</p>
                </div>
              )}

              {order.shipping_address && (
                <div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Shipping Address:</span>
                  </div>
                  <p className="text-gray-900">
                    {order.shipping_address.street_address}, {order.shipping_address.city}, {order.shipping_address.state}, {order.shipping_address.postal_code}, {order.shipping_address.country}
                  </p>
                </div>
              )}

              {order.delivery_estimate && (
                <div>
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Delivery Estimate:</span>
                  </div>
                  <p className="text-gray-900">{order.delivery_estimate}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
