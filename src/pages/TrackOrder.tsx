
import { useNavigation } from "@/components/navigation/useNavigation";
import { useOrderTracking } from "@/hooks/useOrderTracking";
import OrderCard from "@/components/tracking/OrderCard";
import { Loader2 } from "lucide-react";

const TrackOrder = () => {
  const { userRole } = useNavigation();
  const { orders, loading, cancelOrder } = useOrderTracking();

  return (
    <div className="container mx-auto py-6 px-4 pb-24">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Track Your Orders</h1>
        <p className="mb-8 text-muted-foreground">
          {userRole === "fan"
            ? "Monitor your gift orders and their delivery status. You can cancel orders before they're accepted by the influencer."
            : userRole === "influencer"
            ? "View and track all the gift requests you've received from your fans."
            : "Only fans and influencers can track orders."}
        </p>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="ml-2 text-muted-foreground">Loading your orders...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">No orders found.</div>
            <p className="text-sm text-muted-foreground">
              {userRole === "fan" 
                ? "When you place gift orders, they will appear here for tracking."
                : "When fans send you gift requests, they will appear here."
              }
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                userRole={userRole || ''}
                onCancelOrder={cancelOrder}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackOrder;
