
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

const PlaceOrder = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const giftItem = searchParams.get("gift") || "";
  const influencerId = searchParams.get("influencer") || "";
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to place an order",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      const { error } = await supabase.from("orders").insert({
        user_id: user.id,
        influencer_id: influencerId,
        product_url: giftItem,
        status: "pending"
      });

      if (error) throw error;

      toast({
        title: "Order placed successfully",
        description: "Your order has been submitted",
      });
      
      navigate("/");
    } catch (error) {
      console.error("Error placing order:", error);
      toast({
        title: "Error",
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto mt-8">
        <Card className="p-6">
          <h1 className="text-2xl font-semibold mb-6">Place Your Order</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Gift Item</label>
              <Input value={giftItem} disabled />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Message (Optional)</label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Add a message to your order..."
                className="min-h-[100px]"
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Placing Order..." : "Place Order"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  </div>
  );
};

export default PlaceOrder;
