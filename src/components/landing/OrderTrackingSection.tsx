import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Package, Truck, CheckCircle, ArrowRight, Clock, Search } from "lucide-react";
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
  return <section className="mb-16 relative">
      
    </section>;
};
export default OrderTrackingSection;