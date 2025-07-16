
import { useState } from "react";
import { useNavigation } from "@/components/navigation/useNavigation";
import { useOrderTracking } from "@/hooks/useOrderTracking";
import OrderCard from "@/components/tracking/OrderCard";
import { Loader2, Package, Clock } from "lucide-react";
import FloatingHeader from '@/components/ui/floating-header';
import Navbar from '@/components/navigation/Navbar';

const TrackOrder = () => {
  const [navOpen, setNavOpen] = useState(false);
  const { userRole } = useNavigation();
  const { orders, loading, cancelOrder } = useOrderTracking();

  return (
    <>
      <FloatingHeader setNavOpen={setNavOpen} />
      <Navbar isOpen={navOpen} setIsOpen={setNavOpen} />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pt-20">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <Package className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Track Your Orders</h1>
            <p className="text-gray-600 max-w-md mx-auto">
              {userRole === "fan"
                ? "Monitor your gift orders and their delivery status."
                : userRole === "influencer"
                ? "View and track all the gift requests you've received."
                : "Track orders and manage delivery status."}
            </p>
          </div>

          {/* Content Section */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <div className="relative">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <div className="absolute inset-0 w-12 h-12 border-2 border-primary/20 rounded-full"></div>
              </div>
              <p className="text-gray-500 font-medium">Loading your orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
                <Clock className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                {userRole === "fan" 
                  ? "When you place gift orders, they will appear here for tracking."
                  : "When fans send you gift requests, they will appear here."
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
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
    </>
  );
};

export default TrackOrder;
