
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  ShoppingBag, 
  Package, 
  Truck, 
  CheckCircle, 
  ArrowRight,
  Clock,
  Search
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const OrderTrackingSection = () => {
  const [trackingId, setTrackingId] = useState("");
  const [isTracking, setIsTracking] = useState(false);
  const [trackingStatus, setTrackingStatus] = useState<'processing' | 'shipped' | 'delivered' | null>(null);
  const [error, setError] = useState("");

  const handleTrackOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingId.trim()) {
      setError("Please enter a tracking ID");
      return;
    }

    setError("");
    setIsTracking(true);
    
    // Mock API call
    setTimeout(() => {
      const statuses = ['processing', 'shipped', 'delivered'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)] as 'processing' | 'shipped' | 'delivered';
      setTrackingStatus(randomStatus);
      setIsTracking(false);
    }, 1500);
  };

  const resetTracking = () => {
    setTrackingId("");
    setTrackingStatus(null);
  };

  return (
    <section className="mb-16 relative">
      <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-md p-6 md:p-8 rounded-2xl shadow-lg border border-funky-purple/10 overflow-hidden relative">
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-gradient-to-tr from-funky-purple/10 to-funky-pink/10 rounded-full blur-3xl"></div>
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-gradient-to-bl from-funky-blue/10 to-funky-green/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-6 font-display bg-clip-text text-transparent bg-gradient-to-r from-funky-purple to-funky-pink">Track Your Gift</h2>
          
          {!trackingStatus ? (
            <div className="max-w-lg mx-auto">
              <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
                Enter your tracking ID to check the status of your gift
              </p>
              
              <form onSubmit={handleTrackOrder} className="space-y-4">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Enter your tracking ID (e.g., GF-1234567)"
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value)}
                    className="pl-10 bg-white dark:bg-gray-800 border-funky-purple/20 focus:border-funky-purple"
                  />
                  <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-funky-purple/60" />
                </div>
                
                {error && <p className="text-red-500 text-sm">{error}</p>}
                
                <Button 
                  type="submit" 
                  disabled={isTracking}
                  className="w-full bg-gradient-to-r from-funky-purple to-funky-pink hover:from-funky-pink hover:to-funky-purple text-white"
                >
                  {isTracking ? (
                    <>
                      <Search className="h-4 w-4 mr-2 animate-spin" />
                      Tracking...
                    </>
                  ) : (
                    <>
                      Track Order
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold font-display">Order Status</h3>
                <Button variant="outline" size="sm" onClick={resetTracking} className="text-xs border-funky-purple/20 text-funky-purple">
                  Track Another Order
                </Button>
              </div>
              
              <div className="relative">
                <div className="absolute top-9 left-[22px] w-[calc(100%-44px)] h-1 bg-gray-200 dark:bg-gray-700"></div>
                
                {/* Progress steps */}
                <div className="relative z-10 flex justify-between">
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center mb-2",
                      "bg-funky-purple/20 border-2 border-funky-purple text-funky-purple",
                      "shadow-lg shadow-funky-purple/20"
                    )}>
                      <ShoppingBag className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-medium text-funky-purple">Processing</span>
                    <span className="text-xs text-gray-500 mt-1">May 2, 2025</span>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center mb-2",
                      trackingStatus === 'shipped' || trackingStatus === 'delivered'
                        ? "bg-funky-purple/20 border-2 border-funky-purple text-funky-purple shadow-lg shadow-funky-purple/20"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500"
                    )}>
                      <Package className="h-5 w-5" />
                    </div>
                    <span className={cn(
                      "text-xs font-medium",
                      trackingStatus === 'shipped' || trackingStatus === 'delivered'
                        ? "text-funky-purple"
                        : "text-gray-500"
                    )}>Shipped</span>
                    {(trackingStatus === 'shipped' || trackingStatus === 'delivered') && (
                      <span className="text-xs text-gray-500 mt-1">May 3, 2025</span>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center mb-2",
                      trackingStatus === 'delivered'
                        ? "bg-funky-purple/20 border-2 border-funky-purple text-funky-purple shadow-lg shadow-funky-purple/20"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500"
                    )}>
                      <Truck className="h-5 w-5" />
                    </div>
                    <span className={cn(
                      "text-xs font-medium",
                      trackingStatus === 'delivered'
                        ? "text-funky-purple"
                        : "text-gray-500"
                    )}>Out for Delivery</span>
                    {trackingStatus === 'delivered' && (
                      <span className="text-xs text-gray-500 mt-1">May 4, 2025</span>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center mb-2",
                      trackingStatus === 'delivered'
                        ? "bg-funky-purple/20 border-2 border-funky-purple text-funky-purple shadow-lg shadow-funky-purple/20"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500"
                    )}>
                      <CheckCircle className="h-5 w-5" />
                    </div>
                    <span className={cn(
                      "text-xs font-medium",
                      trackingStatus === 'delivered'
                        ? "text-funky-purple"
                        : "text-gray-500"
                    )}>Delivered</span>
                    {trackingStatus === 'delivered' && (
                      <span className="text-xs text-gray-500 mt-1">May 4, 2025</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-8 p-4 bg-funky-purple/10 rounded-lg">
                <div className="flex items-start">
                  <Clock className="h-5 w-5 text-funky-purple mr-3 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium mb-1">Estimated Delivery</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {trackingStatus === 'processing' && "Your gift is being processed and will be shipped soon."}
                      {trackingStatus === 'shipped' && "Your gift is on its way! Expected delivery by May 5, 2025."}
                      {trackingStatus === 'delivered' && "Your gift has been delivered. Thank you for using FanFare!"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default OrderTrackingSection;
