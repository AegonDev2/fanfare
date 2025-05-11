
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigation } from "@/components/navigation/useNavigation";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, MapPin, Package, Truck, Navigation } from "lucide-react";

interface OrderData {
  id: string;
  status: string;
  created_at: string;
  product_url: string;
  product_title: string | null;
  influencer?: { name: string } | null;
  profiles?: { email: string } | null;
}

const STATUS_MAP = {
  pending: { label: "Pending", icon: Navigation },
  under_process: { label: "Under Process", icon: Truck },
  accepted: { label: "Accepted", icon: Package },
  completed: { label: "Completed", icon: MapPin },
  rejected: { label: "Rejected", icon: ArrowRight },
};

const OrderStatusTimeline = ({ status }: { status: string }) => {
  // Show steps visually, highlight current status
  const steps = [
    "pending",
    "under_process",
    "accepted",
    "completed",
    "rejected",
  ];
  const activeIdx = steps.indexOf(status);

  return (
    <div className="flex flex-row items-center gap-2 mt-2 overflow-x-auto">
      {steps
        .filter((s) => s !== "rejected" || status === "rejected") // Show rejected only if that's final status
        .map((s, idx) => {
          const Icon = STATUS_MAP[s]?.icon || ArrowRight;
          const active =
            (status === s && (s === "rejected" || s === "completed")) ||
            (s !== "rejected" && idx <= activeIdx) ||
            false;
          return (
            <div key={s} className="flex items-center">
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded ${
                  active
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                <Icon size={16} />
                <span className="capitalize text-xs">{STATUS_MAP[s]?.label}</span>
              </div>
              {idx < steps.length - 2 &&
                <span className="mx-1 text-gray-400">→</span>
              }
              {s === "accepted" && status === "rejected" && (
                <></>
              )}
            </div>
          );
        })}
    </div>
  );
};

const TrackOrder = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, userRole, userEmail } = useNavigation();

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        setOrders([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        let underProcessOrders: OrderData[] = [];
        let acceptedOrders: OrderData[] = [];
        let completedOrders: OrderData[] = [];
        let rejectedOrders: OrderData[] = [];
        
        // Helper function to make queries based on role
        const fetchFromTable = async (table: string, status: string) => {
          let query = supabase
            .from(table as any)
            .select("*, influencer:influencer_id(name), profiles:user_id(email)");
            
          if (userRole === "fan") {
            query = query.eq("user_id", user.id);
          } else if (userRole === "influencer") {
            query = query.eq("influencer_id", user.id);
          }
          
          const { data, error } = await query.order("created_at", { ascending: false });
          if (error) throw error;
          
          return (data || []).map((order: any) => ({ ...order, status }));
        };
        
        // Fetch orders from each status table
        underProcessOrders = await fetchFromTable("orders_under_process", "under_process");
        acceptedOrders = await fetchFromTable("orders_accepted", "accepted");
        completedOrders = await fetchFromTable("orders_completed", "completed");
        rejectedOrders = await fetchFromTable("orders_rejected", "rejected");
        
        // Combine all orders
        const allOrders = [
          ...underProcessOrders,
          ...acceptedOrders,
          ...completedOrders,
          ...rejectedOrders
        ];
        
        setOrders(allOrders);
      } catch (err) {
        toast({
          title: "Error loading orders",
          description: (err as Error).message || String(err),
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user, userRole, toast]);

  return (
    <div className="container mx-auto py-6 px-4 pb-24">
      <h1 className="text-2xl font-bold mb-4">Track Your Orders</h1>
      <p className="mb-6 text-gray-600">
        {userRole === "fan"
          ? "Here you can track your gift order status and see progress."
          : userRole === "influencer"
          ? "Here you can view and track all the gift requests you've received."
          : "Only fans and influencers can track orders."}
      </p>
      {loading ? (
        <div>Loading your orders...</div>
      ) : orders.length === 0 ? (
        <div className="text-gray-700">No orders found.</div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {orders.map((order) => (
            <div key={order.id} className="border p-4 rounded-lg bg-white shadow-sm">
              <div className="flex flex-row justify-between items-center gap-4">
                <div>
                  <span className="text-lg font-semibold">{order.product_title || "Gift Order"}</span>
                  <div className="text-sm text-gray-500">
                    {userRole === "fan"
                      ? `To: ${order.influencer?.name || "Influencer"}`
                      : userRole === "influencer"
                      ? `From: ${order.profiles?.email || "Fan"}`
                      : ""}
                  </div>
                  <div className="mt-1">
                    <Badge variant="outline" className="mr-2 capitalize">
                      Status: {order.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <OrderStatusTimeline status={order.status} />
                </div>
              </div>
              <div className="mt-4 text-xs text-gray-500">
                Placed on: {order.created_at ? new Date(order.created_at).toLocaleString() : ""}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TrackOrder;
