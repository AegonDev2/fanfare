
import Header from "@/components/landing/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { OrderDetails } from "@/types/admin";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Package, ArrowLeft, CheckCircle, Clock, Truck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminOrderDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userRole } = useAdminAuth();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);

  // Redirect if not admin
  useEffect(() => {
    if (userRole === null) {
      // Still loading auth status, wait
      return;
    }
    
    if (userRole !== 'admin') {
      navigate('/');
    }
  }, [userRole, navigate]);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // First try under_process table
        let { data: underProcessOrder, error: underProcessError } = await supabase
          .from('orders_under_process')
          .select('*, influencer:influencer_id(*)')
          .eq('id', id)
          .maybeSingle();
          
        if (underProcessError) throw underProcessError;
        
        // Then try completed table if not found
        if (!underProcessOrder) {
          const { data: completedOrder, error: completedError } = await supabase
            .from('orders_completed')
            .select('*, influencer:influencer_id(*)')
            .eq('id', id)
            .maybeSingle();
            
          if (completedError) throw completedError;
          
          if (completedOrder) {
            // Explicitly type it as an object with added status property
            underProcessOrder = {
              ...completedOrder,
              status: 'completed'
            };
          }
        } else {
          // Explicitly add the status property
          underProcessOrder = {
            ...underProcessOrder,
            status: 'under_process'
          };
        }
        
        if (!underProcessOrder) {
          toast({
            title: "Order not found",
            description: `No order with ID ${id} was found`,
            variant: "destructive"
          });
          navigate('/admin-dashboard');
          return;
        }
        
        // Get fan's email
        const { data: fanData } = await supabase
          .from('profiles')
          .select('email, name')
          .eq('id', underProcessOrder.user_id)
          .maybeSingle();
          
        // Cast the enriched order to OrderDetails type using 'as'
        const enrichedOrder = {
          ...underProcessOrder,
          fan_email: fanData?.email || "Unknown",
          fan_name: fanData?.name || "Unknown Fan",
          influencer_name: underProcessOrder.influencer?.name || "Unknown",
        } as OrderDetails;
        
        setOrder(enrichedOrder);
      } catch (error) {
        console.error("Error fetching order details:", error);
        toast({
          title: "Error",
          description: "Failed to load order details",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [id, navigate, toast]);
  
  const handleCompleteOrder = async () => {
    if (!order || !id) return;
    
    try {
      const deliveryEstimate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const { data, error } = await supabase.rpc('move_order_to_completed', {
        order_id: id,
        p_delivery_estimate: deliveryEstimate
      });
      
      if (error) throw error;
      
      toast({
        title: "Order Processed",
        description: "Order has been marked as completed"
      });
      
      navigate('/admin-dashboard');
    } catch (error) {
      console.error("Error completing order:", error);
      toast({
        title: "Error",
        description: "Failed to process order",
        variant: "destructive"
      });
    }
  };
  
  if (loading || userRole === null) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <main className="container mx-auto p-4 pt-20">
          <div className="flex items-center justify-center h-64">
            <p>Loading order details...</p>
          </div>
        </main>
      </div>
    );
  }
  
  if (!order) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <main className="container mx-auto p-4 pt-20">
          <Button variant="outline" onClick={() => navigate('/admin-dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
          </Button>
          <Card className="mt-6">
            <CardContent className="py-10 text-center">
              <p>Order not found</p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }
  
  const shippingAddress = order.shipping_address as Record<string, string> | null;

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container mx-auto p-4 pt-20 pb-20">
        <div className="flex items-center mb-6">
          <Button variant="outline" onClick={() => navigate('/admin-dashboard')} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold">Order {id?.substring(0, 8)}</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" /> Order Details
                </CardTitle>
                <CardDescription>
                  {new Date(order.created_at).toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Product</h3>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium">{order.product_title || "Product"}</h4>
                    <p className="text-sm text-muted-foreground mb-2 break-all">{order.product_url}</p>
                    <div className="flex justify-between items-center">
                      <span>₹{order.product_price?.toFixed(2) || "0.00"}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Gift Message</h3>
                  <div className="border rounded-lg p-4 bg-muted/30">
                    <p className="italic text-sm">"{order.message || "No message provided"}"</p>
                  </div>
                </div>
                
                {shippingAddress && (
                  <div>
                    <h3 className="font-semibold mb-2">Shipping Address</h3>
                    <div className="border rounded-lg p-4">
                      <p>{shippingAddress.name || ""}</p>
                      <p>{shippingAddress.street || ""}</p>
                      <p>{shippingAddress.city || ""}, {shippingAddress.state || ""} {shippingAddress.zip || ""}</p>
                      <p>{shippingAddress.country || ""}</p>
                      <p>{shippingAddress.phone || ""}</p>
                    </div>
                  </div>
                )}
                
                <div>
                  <h3 className="font-semibold mb-2">Payment Summary</h3>
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between py-1">
                      <span>Product Price</span>
                      <span>₹{order.product_price?.toFixed(2) || "0.00"}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>Platform Fee</span>
                      <span>₹{order.platform_fee?.toFixed(2) || "0.00"}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-bold py-1">
                      <span>Total</span>
                      <span>₹{order.total_amount?.toFixed(2) || "0.00"}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
              
              {order.status === 'under_process' && (
                <CardFooter>
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={handleCompleteOrder}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" /> Mark as Processed
                  </Button>
                </CardFooter>
              )}
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start">
                    {order.status === 'completed' ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3" />
                    ) : (
                      <Clock className="h-5 w-5 text-amber-500 mt-0.5 mr-3" />
                    )}
                    <div>
                      <p className="font-medium">
                        {order.status === 'completed' ? 'Processed' : 'Awaiting Processing'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {order.status === 'completed' 
                          ? `Completed on ${new Date(order.completed_at || '').toLocaleDateString()}`
                          : 'Order is waiting for admin approval'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    {order.status === 'completed' ? (
                      <Truck className="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
                    ) : (
                      <Truck className="h-5 w-5 text-gray-300 mt-0.5 mr-3" />
                    )}
                    <div>
                      <p className="font-medium">
                        {order.status === 'completed' ? 'Shipping' : 'Shipping Pending'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {order.status === 'completed' && order.delivery_estimate
                          ? `Estimated delivery: ${new Date(order.delivery_estimate).toLocaleDateString()}`
                          : 'Will be available after processing'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">People</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Fan</h4>
                  <p>{order.fan_name}</p>
                  <p className="text-sm">{order.fan_email}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Influencer</h4>
                  <p>{order.influencer_name}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminOrderDetails;
