import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ShoppingBag, Check, ArrowLeft, CalendarIcon, Truck, Package, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { OrderDetails } from "@/types/admin";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const AdminOrderDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deliveryEstimate, setDeliveryEstimate] = useState<Date | null>(null);
  const [isPriceDialogOpen, setIsPriceDialogOpen] = useState(false);
  const [editedPrice, setEditedPrice] = useState<number | null>(null);

  useEffect(() => {
    if (id) {
      fetchOrderDetails(id);
    }
  }, [id]);

  const fetchOrderDetails = async (orderId: string) => {
    setIsLoading(true);
    try {
      // Check which table the order is in
      let { data: underProcessOrder, error: underProcessError } = await supabase
        .from("orders_under_process")
        .select("*, influencer:influencer_profiles(*)")
        .eq("id", orderId)
        .single();

      if (underProcessError) {
        // Try completed orders if not found in under_process
        let { data: completedOrder, error: completedError } = await supabase
          .from("orders_completed")
          .select("*, influencer:influencer_profiles(*)")
          .eq("id", orderId)
          .single();

        if (completedError) {
          throw new Error("Order not found");
        }

        await enrichOrderData(completedOrder, 'completed');
      } else {
        await enrichOrderData(underProcessOrder, 'under_process');
      }
    } catch (error) {
      console.error("Error fetching order:", error);
      toast({
        title: "Error",
        description: "Failed to load order details",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const enrichOrderData = async (orderData: any, status: string) => {
    try {
      // Get customer email
      const { data: fanData } = await supabase
        .from("profiles")
        .select("email")
        .eq("id", orderData.user_id)
        .single();

      const enrichedOrder = {
        ...orderData,
        status: status as 'under_process' | 'completed',
        fan_email: fanData?.email || "Unknown",
        influencer_name: orderData.influencer?.name || "Unknown",
      };

      setOrder(enrichedOrder);
      setEditedPrice(enrichedOrder.product_price || 0);
    } catch (error) {
      console.error("Error enriching order data:", error);
      toast({
        title: "Warning",
        description: "Some order details could not be loaded",
        variant: "destructive"
      });
    }
  };

  const handleUpdatePrice = async () => {
    if (!order || editedPrice === null) return;
    
    try {
      // Calculate new total based on edited price
      const platformFee = order.platform_fee || 5.00;
      const newTotal = Number(editedPrice) + platformFee;
      
      // Update the price in the database
      const { error } = await supabase
        .from("orders_under_process")
        .update({
          product_price: editedPrice,
          total_amount: newTotal
        })
        .eq("id", order.id);
      
      if (error) throw error;
      
      // Update local state
      setOrder({
        ...order,
        product_price: editedPrice,
        total_amount: newTotal
      });
      
      toast({
        title: "Price Updated",
        description: "Product price has been updated successfully",
      });
      
      setIsPriceDialogOpen(false);
    } catch (error) {
      console.error("Error updating price:", error);
      toast({
        title: "Error",
        description: "Failed to update product price",
        variant: "destructive"
      });
    }
  };

  const handleOrderComplete = async () => {
    if (!order) return;
    
    if (!deliveryEstimate) {
      toast({
        title: "Error",
        description: "Please select a delivery estimate date",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Call the Supabase function to move order to completed
      const { data, error } = await supabase.rpc('move_order_to_completed', {
        order_id: order.id,
        p_delivery_estimate: deliveryEstimate.toISOString().split('T')[0]
      });
      
      if (error) throw error;
      
      toast({
        title: "Order Completed",
        description: "Order has been marked as completed",
      });
      
      // Notify customer
      await supabase.from("notifications").insert({
        recipient_id: order.user_id,
        type: "order_completed",
        message: `Your order has been completed! Estimated delivery date: ${format(deliveryEstimate, 'PP')}`,
        reference_id: order.id,
      });
      
      // Redirect back to admin dashboard
      navigate("/admin");
      
    } catch (error) {
      console.error("Error completing order:", error);
      toast({
        title: "Error",
        description: "Failed to complete order",
        variant: "destructive"
      });
    }
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center items-center h-64">
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center items-center h-64">
          <p>Order not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Button
        variant="ghost"
        onClick={() => navigate("/admin")}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to All Orders
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center">
                    <ShoppingBag className="h-5 w-5 mr-2" />
                    Order Details
                  </CardTitle>
                  <CardDescription>
                    Order ID: {order.id}
                  </CardDescription>
                </div>
                <div className="flex items-center">
                  <span className={`px-3 py-1 rounded-full text-xs ${
                    order.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {order.status === 'completed' ? 'Completed' : 'In Process'}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-sm text-gray-500">Product Information</h3>
                  <div className="mt-1 border rounded-md p-3">
                    <p className="font-semibold">{order.product_title || "Unknown Product"}</p>
                    <p className="text-sm text-gray-600 break-all mt-1">{order.product_url}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-sm text-gray-500">Customer</h3>
                    <div className="mt-1 border rounded-md p-3">
                      <p className="text-sm">{order.fan_email}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-gray-500">Influencer</h3>
                    <div className="mt-1 border rounded-md p-3">
                      <p className="text-sm">{order.influencer_name}</p>
                    </div>
                  </div>
                </div>

                {order.message && (
                  <div>
                    <h3 className="font-medium text-sm text-gray-500">Gift Message</h3>
                    <div className="mt-1 border rounded-md p-3">
                      <p className="text-sm italic">"{order.message}"</p>
                    </div>
                  </div>
                )}

                {order.shipping_address && (
                  <div>
                    <h3 className="font-medium text-sm text-gray-500">Shipping Address</h3>
                    <div className="mt-1 border rounded-md p-3 space-y-1">
                      <p className="text-sm">
                        {order.shipping_address.address_line1 || order.shipping_address.street_address}
                      </p>
                      {order.shipping_address.address_line2 && (
                        <p className="text-sm">{order.shipping_address.address_line2}</p>
                      )}
                      <p className="text-sm">
                        {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}
                      </p>
                      <p className="text-sm">{order.shipping_address.country}</p>
                    </div>
                  </div>
                )}

                {order.status === 'completed' && order.delivery_estimate && (
                  <div>
                    <h3 className="font-medium text-sm text-gray-500">Delivery Information</h3>
                    <div className="mt-1 border rounded-md p-3 flex items-center">
                      <Truck className="h-4 w-4 mr-2 text-gray-600" />
                      <span className="text-sm">
                        Estimated delivery: {new Date(order.delivery_estimate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Order Date</span>
                  <span>{new Date(order.created_at).toLocaleDateString()}</span>
                </div>
                
                <div className="flex justify-between text-sm items-center">
                  <span>Product Price</span>
                  <div className="flex items-center">
                    <span>₹{order.product_price?.toFixed(2) || "0.00"}</span>
                    {order.status === 'under_process' && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="ml-2 p-1 h-auto"
                        onClick={() => setIsPriceDialogOpen(true)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>Platform Fee</span>
                  <span>₹{order.platform_fee?.toFixed(2) || "5.00"}</span>
                </div>
                
                <Separator className="my-2" />
                
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>₹{order.total_amount?.toFixed(2) || "5.00"}</span>
                </div>
              </div>
            </CardContent>
            
            {order.status === 'under_process' && (
              <CardFooter className="flex flex-col space-y-4">
                <div className="w-full">
                  <h3 className="font-medium text-sm text-gray-500 mb-2">Set Delivery Estimate</h3>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {deliveryEstimate ? format(deliveryEstimate, 'PPP') : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={deliveryEstimate}
                        onSelect={setDeliveryEstimate}
                        initialFocus
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <Button 
                  onClick={handleOrderComplete} 
                  className="w-full"
                  disabled={!deliveryEstimate}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Mark as Completed
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>

      {/* Price Edit Dialog */}
      <Dialog open={isPriceDialogOpen} onOpenChange={setIsPriceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Product Price</DialogTitle>
            <DialogDescription>
              Update the product price. This will also update the total amount charged to the customer.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <label htmlFor="price" className="block text-sm font-medium mb-1">
              Product Price (₹)
            </label>
            <Input
              id="price"
              type="number"
              min="0"
              step="0.01"
              value={editedPrice || 0}
              onChange={(e) => setEditedPrice(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPriceDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePrice}>
              Update Price
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrderDetails;
