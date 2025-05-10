
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { sendNotification } from "@/utils/notifications";
import { supabase } from "@/integrations/supabase/client";

const RequestCreateForm = ({ influencerId, onSubmit }: { influencerId: string, onSubmit?: () => void }) => {
  const [productUrl, setProductUrl] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in.");
      
      console.log("Creating gift request with:", {
        product_url: productUrl,
        message,
        influencer_id: influencerId,
        sender_id: user.id
      });
      
      // Insert into gift_requests
      const { data, error } = await supabase.from("gift_requests").insert({
        product_url: productUrl,
        message,
        influencer_id: influencerId,
        sender_id: user.id,
        // product_title/price will be filled in automatically if scraping
      }).select().maybeSingle();

      if (error) throw error;

      console.log("Gift request created successfully:", data);

      // Notify influencer of new gift request
      await sendNotification(
        influencerId,
        "new_gift_request",
        "You have received a new gift request.",
        data?.id,
        user.id
      );

      setProductUrl("");
      setMessage("");
      toast({ title: "Gift request sent!" });
      onSubmit?.();
    } catch (err) {
      console.error("Error creating gift request:", err);
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Send a Gift Request</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            required
            type="url"
            placeholder="Product URL"
            value={productUrl}
            onChange={e => setProductUrl(e.target.value)}
          />
          <Input
            placeholder="Your message (optional)"
            value={message}
            onChange={e => setMessage(e.target.value)}
          />
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Sending..." : "Send Request"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default RequestCreateForm;
