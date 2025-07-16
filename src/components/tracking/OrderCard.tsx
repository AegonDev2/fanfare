import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ExternalLink, Calendar, User, DollarSign, MessageSquare, X } from "lucide-react";
import { ORDER_STATUS_CONFIG, type TrackingOrder } from "@/types/tracking";
import OrderStatusTimeline from "./OrderStatusTimeline";

interface OrderCardProps {
  order: TrackingOrder;
  userRole: string;
  onCancelOrder: (orderId: string) => Promise<void>;
}

const OrderCard = ({ order, userRole, onCancelOrder }: OrderCardProps) => {
  const [isCanceling, setIsCanceling] = useState(false);
  const statusConfig = ORDER_STATUS_CONFIG[order.status];

  const handleCancelOrder = async () => {
    try {
      setIsCanceling(true);
      await onCancelOrder(order.id);
    } finally {
      setIsCanceling(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatPrice = (price: number | null) => {
    if (!price) return "N/A";
    return `₹${price.toFixed(2)}`;
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg leading-tight">
              {order.product_title || "Gift Order"}
            </h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>Placed on {formatDate(order.created_at)}</span>
            </div>
          </div>
          
          <Badge className={statusConfig.color}>
            {statusConfig.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Order Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-500" />
            <span className="text-sm">
              {userRole === 'fan' 
                ? `To: ${order.influencer?.name || 'Influencer'}`
                : `From: ${order.profiles?.email || 'Fan'}`
              }
            </span>
          </div>
          
          {order.total_amount && (
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-gray-500" />
              <span className="text-sm">Amount: {formatPrice(order.total_amount)}</span>
            </div>
          )}
        </div>

        {/* Message */}
        {order.message && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-start gap-2">
              <MessageSquare className="w-4 h-4 text-blue-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">Message</p>
                <p className="text-sm text-blue-700">{order.message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Product Link */}
        <div className="flex items-center gap-2">
          <a 
            href={order.product_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80"
          >
            View Product <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Delivery Estimate */}
        {order.delivery_estimate && (
          <div className="p-3 bg-green-50 rounded-lg">
            <p className="text-sm font-medium text-green-900">Expected Delivery</p>
            <p className="text-sm text-green-700">
              {new Date(order.delivery_estimate).toLocaleDateString()}
            </p>
          </div>
        )}

        {/* Rejection Reason */}
        {order.rejection_reason && (
          <div className="p-3 bg-red-50 rounded-lg">
            <p className="text-sm font-medium text-red-900">Rejection Reason</p>
            <p className="text-sm text-red-700">{order.rejection_reason}</p>
          </div>
        )}

        {/* Order Timeline */}
        <OrderStatusTimeline 
          currentStatus={order.status} 
          isInfluencer={userRole === 'influencer'}
        />

        {/* Cancel Button */}
        {order.can_cancel && userRole === 'fan' && (
          <div className="pt-2 border-t">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                  <X className="w-4 h-4 mr-2" />
                  Cancel Order
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel Order</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to cancel this order? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>No, Keep Order</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleCancelOrder}
                    disabled={isCanceling}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {isCanceling ? "Cancelling..." : "Yes, Cancel Order"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderCard;