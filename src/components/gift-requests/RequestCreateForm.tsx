
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { sendNotification } from "@/utils/notifications";
import { supabase } from "@/integrations/supabase/client";
import { generateWebsitePreview } from "@/utils/pikwy";
import { Skeleton } from "@/components/ui/skeleton";
import { Image, Loader2 } from "lucide-react";

const RequestCreateForm = ({ influencerId, onSubmit }: { influencerId: string, onSubmit?: () => void }) => {
  const [productUrl, setProductUrl] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [websitePreview, setWebsitePreview] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const { toast } = useToast();

  // Generate website preview when URL changes
  useEffect(() => {
    // Debounce the preview generation to prevent too many API calls
    const debounceTimer = setTimeout(() => {
      if (productUrl && productUrl.startsWith('http')) {
        generatePreview();
      }
    }, 1000);
    
    return () => clearTimeout(debounceTimer);
  }, [productUrl]);

  const generatePreview = async () => {
    if (!productUrl) return;
    
    setIsLoadingPreview(true);
    try {
      const imageUrl = await generateWebsitePreview(productUrl);
      setWebsitePreview(imageUrl);
    } catch (error) {
      console.error("Failed to generate preview:", error);
      setWebsitePreview(null);
    } finally {
      setIsLoadingPreview(false);
    }
  };

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
      setWebsitePreview(null);
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
          {websitePreview && (
            <div className="border rounded-md overflow-hidden">
              <div className="bg-gray-100 p-2 border-b flex items-center">
                <Image className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-sm font-medium text-gray-600">Website Preview</span>
              </div>
              <div className="aspect-video bg-white">
                <img src={websitePreview} alt="Product preview" className="w-full h-full object-contain" />
              </div>
            </div>
          )}
          
          {isLoadingPreview && !websitePreview && (
            <div className="rounded-md border overflow-hidden">
              <div className="bg-gray-100 p-2 border-b flex justify-between">
                <span className="text-sm font-medium text-gray-600">Loading Preview</span>
                <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
              </div>
              <Skeleton className="aspect-video" />
            </div>
          )}
          
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
