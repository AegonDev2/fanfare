
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";

const OrderTrackingSection = () => {
  return <section className="mb-8 px-[6px]">
      <h2 className="font-semibold text-gray-800 mb-4 text-xl px-[12px] flex items-center">
        <ShoppingBag className="h-5 w-5 mr-2 text-primary" />
        Order Tracking
      </h2>
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Order #12345</h3>
            <p className="text-gray-600">
              Status: <span className="text-yellow-500">Pending Approval</span>
            </p>
          </div>
          <Button>View Details</Button>
        </div>
      </div>
    </section>;
};
export default OrderTrackingSection;
