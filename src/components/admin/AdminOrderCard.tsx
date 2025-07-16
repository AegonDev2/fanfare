import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  ExternalLink,
  Calendar,
  DollarSign,
  Wallet,
  User,
  AlertCircle,
  Truck
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface OrderData {
  id: string;
  user_id?: string;
  sender_id?: string;
  product_title: string;
  product_url: string;
  product_price: number;
  platform_fee?: number;
  total_amount?: number;
  created_at: string;
  status?: string;
  influencer_id?: string;
  message?: string;
  fan_email?: string;
  fan_name?: string;
  influencer_name?: string;
}

interface WalletData {
  balance: number;
  user_id: string;
}

interface AdminOrderCardProps {
  order: OrderData;
  onStatusChange: (orderId: string, newStatus: string) => void;
}

export default function AdminOrderCard({ order, onStatusChange }: AdminOrderCardProps) {
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [walletLoading, setWalletLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState("");
  const { toast } = useToast();

  const fetchWalletBalance = async () => {
    if (!order.user_id && !order.sender_id) return;
    
    setWalletLoading(true);
    try {
      const userId = order.user_id || order.sender_id;
      console.log("Fetching wallet for user:", userId);
      
      // Use maybeSingle instead of single to handle cases where wallet doesn't exist
      const { data, error } = await supabase
        .from('wallets')
        .select('balance, user_id')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching wallet:", error);
        toast({
          title: "Error",
          description: "Could not fetch wallet balance",
          variant: "destructive"
        });
        return;
      }

      if (!data) {
        // Wallet doesn't exist, create one with 0 balance
        console.log("No wallet found, creating wallet for user:", userId);
        const { data: newWallet, error: createError } = await supabase
          .from('wallets')
          .insert({
            user_id: userId,
            balance: 0
          })
          .select('balance, user_id')
          .single();

        if (createError) {
          console.error("Error creating wallet:", createError);
          toast({
            title: "Error",
            description: "Could not create wallet",
            variant: "destructive"
          });
          return;
        }

        setWalletData(newWallet);
        toast({
          title: "Wallet Created",
          description: "New wallet created with ₹0 balance",
        });
      } else {
        setWalletData(data);
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Could not fetch wallet balance",
        variant: "destructive"
      });
    } finally {
      setWalletLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!deliveryDate) {
      toast({
        title: "Error",
        description: "Please select an estimated delivery date",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log("Approving order:", order.id, "with delivery date:", deliveryDate);
      
      // Check if order exists in orders_under_process first
      const { data: existingOrder, error: checkError } = await supabase
        .from('orders_under_process')
        .select('id')
        .eq('id', order.id)
        .maybeSingle();

      if (checkError) {
        console.error("Error checking order:", checkError);
        throw checkError;
      }

      if (!existingOrder) {
        // Order already processed or doesn't exist
        toast({
          title: "Order Already Processed",
          description: "This order has already been processed or moved to gift requests",
          variant: "default"
        });
        onStatusChange(order.id, 'already_processed');
        return;
      }

      // Move order to gift_requests for influencer approval with delivery estimate
      const { error } = await supabase.rpc('move_order_to_gift_request', {
        order_id: order.id,
        delivery_estimate: deliveryDate
      });

      if (error) {
        console.error("RPC error:", error);
        throw error;
      }

      toast({
        title: "Order Approved",
        description: `Order sent to influencer for approval with delivery date: ${format(new Date(deliveryDate), 'MMM dd, yyyy')}`,
      });

      setShowApproveDialog(false);
      setDeliveryDate("");
      onStatusChange(order.id, 'approved');
    } catch (error: any) {
      console.error("Error approving order:", error);
      toast({
        title: "Error", 
        description: error.message || "Failed to approve order",
        variant: "destructive"
      });
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a rejection reason",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase.rpc('reject_order_with_reason', {
        order_id: order.id,
        rejection_reason: rejectionReason,
        rejected_by: 'admin'
      });

      if (error) throw error;

      toast({
        title: "Order Rejected",
        description: "Order has been rejected",
      });

      setShowRejectDialog(false);
      setRejectionReason("");
      onStatusChange(order.id, 'rejected');
    } catch (error: any) {
      console.error("Error rejecting order:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to reject order", 
        variant: "destructive"
      });
    }
  };

  const totalAmount = order.total_amount || (order.product_price + (order.platform_fee || 5));
  const hasSufficientBalance = walletData ? walletData.balance >= totalAmount : false;

  return (
    <Card className="shadow-sm border-gray-100 hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold line-clamp-1">
            {order.product_title}
          </CardTitle>
          <Badge 
            variant={
              order.status === 'pending' ? 'secondary' :
              order.status === 'under process' ? 'outline' :
              order.status === 'completed' ? 'secondary' : 'secondary'
            }
            className={
              order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              order.status === 'under process' ? 'bg-blue-100 text-blue-800 border-blue-300' :
              order.status === 'completed' ? 'bg-green-100 text-green-800' : ''
            }
          >
            {order.status === 'under process' ? 'Processing' : 
             order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
          </Badge>
        </div>
        <p className="text-sm text-gray-500">Order ID: {order.id}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <ExternalLink className="h-4 w-4 text-gray-400" />
          <a 
            href={order.product_url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-600 hover:underline truncate"
          >
            View Product
          </a>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-gray-400" />
            <span>₹{totalAmount}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span>{format(new Date(order.created_at), 'MMM dd, yyyy')}</span>
          </div>
        </div>

        {order.fan_name && (
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-gray-400" />
            <span>{order.fan_name} ({order.fan_email})</span>
          </div>
        )}

        {order.message && (
          <div className="text-sm">
            <span className="font-medium">Message:</span>
            <p className="text-gray-600 mt-1">{order.message}</p>
          </div>
        )}

        {/* Wallet Balance Section */}
        <div className="border-t pt-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">User Wallet</span>
            <Button
              size="sm"
              variant="outline"
              onClick={fetchWalletBalance}
              disabled={walletLoading}
            >
              <Wallet className="h-4 w-4 mr-1" />
              {walletLoading ? "Loading..." : "Check Balance"}
            </Button>
          </div>
          
          {walletData && (
            <div className="mt-2 p-2 bg-gray-50 rounded">
              <div className="flex items-center justify-between text-sm">
                <span>Balance: ₹{walletData.balance}</span>
                <div className="flex items-center gap-1">
                  {hasSufficientBalance ? (
                    <span className="text-green-600">✓ Sufficient</span>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <span className="text-red-600">Insufficient (₹{(totalAmount - walletData.balance).toFixed(2)} short)</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          {(order.status === 'pending' || order.status === 'under_process') && (
            <>
              <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    className="flex-1"
                  >
                    <Truck className="h-4 w-4 mr-1" />
                    Approve Order
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Approve Order</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Set an estimated delivery date for this order:
                    </p>
                    <div className="space-y-2">
                      <Label htmlFor="delivery-date">Estimated Delivery Date</Label>
                      <Input
                        id="delivery-date"
                        type="date"
                        value={deliveryDate}
                        onChange={(e) => setDeliveryDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleApprove}
                        disabled={!deliveryDate}
                      >
                        Approve Order
                      </Button>
                      <Button
                        onClick={() => setShowApproveDialog(false)}
                        variant="outline"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                  >
                    Reject
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Reject Order</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Please provide a reason for rejecting this order:
                    </p>
                    <Textarea
                      placeholder="Enter rejection reason..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={handleReject}
                        variant="destructive"
                        disabled={!rejectionReason.trim()}
                      >
                        Reject Order
                      </Button>
                      <Button
                        onClick={() => setShowRejectDialog(false)}
                        variant="outline"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={() => window.open(`/admin/order/${order.id}`, '_blank')}
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}