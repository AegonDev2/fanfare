
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
  Truck,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Edit3
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface OrderData {
  id: string;
  user_id: string;
  product_title: string;
  product_url: string;
  product_price: number;
  platform_fee?: number;
  total_amount?: number;
  created_at: string;
  status: string;
  original_status: string;
  influencer_id?: string;
  message?: string;
  rejection_reason?: string;
  fan_email?: string;
  fan_name?: string;
  influencer_name?: string;
  influencer_address?: {
    id: string;
    influencer_id: string;
    street_address: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    is_primary: boolean;
    created_at: string;
  } | null;
}

interface WalletData {
  balance: number;
  user_id: string;
}

interface AdminOrderCardProps {
  order: OrderData;
  onStatusChange: (orderId: string, newStatus: string, updatedOrder?: Partial<OrderData>) => void;
}

const RejectionReasonDisplay = ({ reason }: { reason: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className="p-3 bg-red-50 rounded-lg border border-red-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          <p className="text-sm font-medium text-red-900">Rejection Reason</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-red-600 hover:text-red-700 h-auto p-1"
        >
          {isExpanded ? (
            <>
              Hide <ChevronUp className="w-3 h-3 ml-1" />
            </>
          ) : (
            <>
              Show <ChevronDown className="w-3 h-3 ml-1" />
            </>
          )}
        </Button>
      </div>
      {isExpanded && (
        <div className="mt-2 pt-2 border-t border-red-200">
          <p className="text-sm text-red-700">{reason}</p>
        </div>
      )}
    </div>
  );
};

export default function AdminOrderCard({ order, onStatusChange }: AdminOrderCardProps) {
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [walletLoading, setWalletLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [showEditDescriptionDialog, setShowEditDescriptionDialog] = useState(false);
  const [editedDescription, setEditedDescription] = useState(order.product_title || "");
  const { toast } = useToast();

  const fetchWalletBalance = async () => {
    if (!order.user_id) return;
    
    setWalletLoading(true);
    try {
      console.log("Fetching wallet for user:", order.user_id);
      
      const { data, error } = await supabase
        .from('wallets')
        .select('balance, user_id')
        .eq('user_id', order.user_id)
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
        console.log("No wallet found, creating wallet for user:", order.user_id);
        const { data: newWallet, error: createError } = await supabase
          .from('wallets')
          .insert({
            user_id: order.user_id,
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

    // Check wallet balance at approval time
    const finalAmount = order.product_price + (order.platform_fee || 5) + deliveryFee;
    if (walletData && walletData.balance < finalAmount) {
      toast({
        title: "Insufficient Wallet Balance",
        description: `User has ₹${walletData.balance} but needs ₹${finalAmount}. Please ask user to top up wallet before approval.`,
        variant: "destructive"
      });
      return;
    }

    try {
      console.log("Approving order:", order.id, "with delivery date:", deliveryDate);
      
      // Update order status to approved_waiting_influencer
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'approved_waiting_influencer',
          admin_approved: true,
          admin_approved_at: new Date().toISOString(),
          delivery_estimate: deliveryDate,
          delivery_fee: deliveryFee,
          total_amount: finalAmount
        })
        .eq('id', order.id);

      if (error) {
        console.error("Error approving order:", error);
        throw error;
      }

      toast({
        title: "Order Approved",
        description: `Order sent to influencer for approval with delivery date: ${format(new Date(deliveryDate), 'MMM dd, yyyy')} and delivery fee: ₹${deliveryFee}`,
      });

      setShowApproveDialog(false);
      setDeliveryDate("");
      setDeliveryFee(0);
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
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'rejected_by_admin',
          rejection_reason: rejectionReason,
          rejected_by: 'admin'
        })
        .eq('id', order.id);

      if (error) throw error;

      // Send notification to user about rejection
      try {
        const { data, error: notificationError } = await supabase
          .from('notifications')
          .insert({
            recipient_id: order.user_id,
            type: 'order_rejected',
            message: `Your gift order has been rejected by admin. Reason: ${rejectionReason}`,
            reference_id: order.id,
            is_read: false
          });

        if (notificationError) {
          console.error("Error sending rejection notification:", notificationError);
        }
      } catch (notifError) {
        console.error("Failed to send rejection notification:", notifError);
      }

      toast({
        title: "Order Rejected",
        description: "Order has been rejected and user has been notified",
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

  const handleComplete = async () => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', order.id);

      if (error) throw error;

      toast({
        title: "Order Completed",
        description: "Order has been marked as completed",
      });

      onStatusChange(order.id, 'completed');
    } catch (error: any) {
      console.error("Error completing order:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to complete order", 
        variant: "destructive"
      });
    }
  };

  const handleEditDescription = async () => {
    if (!editedDescription.trim()) {
      toast({
        title: "Error",
        description: "Description cannot be empty",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('orders')
        .update({
          product_title: editedDescription.trim()
        })
        .eq('id', order.id);

      if (error) throw error;

      toast({
        title: "Description Updated",
        description: "Gift description has been updated successfully",
      });

      setShowEditDescriptionDialog(false);
      // Update local state and notify parent
      order.product_title = editedDescription.trim();
      onStatusChange(order.id, 'description_updated', { product_title: editedDescription.trim() });
    } catch (error: any) {
      console.error("Error updating description:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update description", 
        variant: "destructive"
      });
    }
  };

  const totalAmount = order.total_amount || (order.product_price + (order.platform_fee || 5));
  const totalWithDelivery = totalAmount + deliveryFee;
  const hasSufficientBalance = walletData ? walletData.balance >= totalWithDelivery : false;

  const getStatusDisplay = (originalStatus: string) => {
    switch (originalStatus) {
      case 'pending_admin_approval':
        return 'Pending Admin Approval';
      case 'approved_waiting_influencer':
        return 'Waiting for Influencer';
      case 'accepted':
        return 'Accepted by Influencer';
      case 'completed':
        return 'Completed';
      case 'rejected_by_admin':
        return 'Rejected by Admin';
      case 'rejected_by_influencer':
        return 'Rejected by Influencer';
      default:
        return originalStatus.charAt(0).toUpperCase() + originalStatus.slice(1);
    }
  };

  const getStatusColor = (originalStatus: string) => {
    switch (originalStatus) {
      case 'pending_admin_approval':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved_waiting_influencer':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'rejected_by_admin':
      case 'rejected_by_influencer':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="shadow-sm border-gray-100 hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-2 flex-1">
            <CardTitle className="text-lg font-semibold line-clamp-1 flex-1">
              {order.product_title}
            </CardTitle>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setEditedDescription(order.product_title || "");
                setShowEditDescriptionDialog(true);
              }}
              className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
              title="Edit description"
            >
              <Edit3 className="h-3 w-3" />
            </Button>
          </div>
          <Badge 
            variant="outline"
            className={getStatusColor(order.original_status)}
          >
            {getStatusDisplay(order.original_status)}
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
            <span>₹{totalAmount}{deliveryFee > 0 && ` + ₹${deliveryFee} delivery`}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span>{format(new Date(order.created_at), 'MMM dd, yyyy')}</span>
          </div>
        </div>

        {order.fan_name && (
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-gray-400" />
            <span>Fan: {order.fan_name} ({order.fan_email})</span>
          </div>
        )}

        {/* Influencer Information Section - Only for gift orders */}
        {order.influencer_name && (
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
            <div className="flex items-center gap-2 text-sm font-medium text-blue-800 mb-2">
              <User className="h-4 w-4" />
              <span>Influencer: {order.influencer_name}</span>
            </div>
            
            {order.influencer_address && (
              <div className="text-sm text-blue-700 space-y-1">
                <div className="font-medium">Shipping Address:</div>
                <div>{order.influencer_address.street_address}</div>
                <div>
                  {order.influencer_address.city}, {order.influencer_address.state} {order.influencer_address.postal_code}
                </div>
                <div>{order.influencer_address.country}</div>
              </div>
            )}
            
            {!order.influencer_address && (
              <div className="text-sm text-amber-600">
                ⚠️ No shipping address found for this influencer
              </div>
            )}
          </div>
        )}

        {order.message && (
          <div className="text-sm">
            <span className="font-medium">Message:</span>
            <p className="text-gray-600 mt-1">{order.message}</p>
          </div>
        )}

        {/* Rejection Reason Display */}
        {(order.original_status === 'rejected_by_admin' || order.original_status === 'rejected_by_influencer') && order.rejection_reason && (
          <RejectionReasonDisplay reason={order.rejection_reason} />
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
                      <span className="text-red-600">Insufficient (₹{(totalWithDelivery - walletData.balance).toFixed(2)} short)</span>
                    </>
                  )}
                </div>
              </div>
              {deliveryFee > 0 && (
                <div className="text-xs text-gray-500 mt-1">
                  Total with delivery: ₹{totalWithDelivery}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          {order.original_status === 'pending_admin_approval' && (
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
                      Set an estimated delivery date and delivery fee for this order:
                    </p>
                    <div className="space-y-4">
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
                      <div className="space-y-2">
                        <Label htmlFor="delivery-fee">Delivery Fee (₹)</Label>
                        <Input
                          id="delivery-fee"
                          type="number"
                          min="0"
                          step="0.01"
                          value={deliveryFee}
                          onChange={(e) => setDeliveryFee(parseFloat(e.target.value) || 0)}
                          placeholder="0"
                        />
                        <p className="text-xs text-gray-500">
                          Total amount: ₹{totalAmount + deliveryFee}
                        </p>
                      </div>
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

          {(order.original_status === 'approved_waiting_influencer' || order.original_status === 'accepted') && (
            <Button
              size="sm"
              className="flex-1"
              onClick={() => handleComplete()}
            >
              <Truck className="h-4 w-4 mr-1" />
              Mark Complete
            </Button>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={() => window.open(`/admin/order/${order.id}`, '_blank')}
          >
            View Details
          </Button>
        </div>

        {/* Edit Description Dialog */}
        <Dialog open={showEditDescriptionDialog} onOpenChange={setShowEditDescriptionDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Gift Description</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Update the gift description to improve clarity for the influencer:
              </p>
              <div className="space-y-2">
                <Label htmlFor="description">Gift Description</Label>
                <Textarea
                  id="description"
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  placeholder="Enter a clear description of the gift..."
                  rows={3}
                />
                <p className="text-xs text-gray-500">
                  This will be visible to the influencer and on all tracking pages.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleEditDescription}
                  disabled={!editedDescription.trim() || editedDescription === order.product_title}
                >
                  Update Description
                </Button>
                <Button
                  onClick={() => {
                    setShowEditDescriptionDialog(false);
                    setEditedDescription(order.product_title || "");
                  }}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
