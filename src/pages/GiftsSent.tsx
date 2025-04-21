
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/landing/Header";

interface GiftRequest {
  id: string;
  product_url: string;
  product_title: string | null;
  product_price: number | null;
  message: string;
  created_at: string;
  status: string;
  influencer: { name: string } | null;
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  accepted: "Accepted",
  rejected: "Rejected",
  under_process: "Under Process",
  ordered: "Ordered",
  delivered: "Delivered",
};

const GiftsSent = () => {
  const { toast } = useToast();
  const [requests, setRequests] = useState<GiftRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSentGiftRequests = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) {
        setRequests([]);
        setLoading(false);
        return;
      }
      // Select gift requests sent BY this user, join influencer name
      let { data, error } = await supabase
        .from("gift_requests")
        .select(`
          id,
          product_url,
          product_title,
          product_price,
          message,
          created_at,
          status,
          influencer:influencer_id(name)
        `)
        .eq("sender_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Fix for the TypeScript error: Transform the data to ensure it matches the GiftRequest type
      const formattedData = (data || []).map(item => {
        // Handle potential errors in the joined data
        const influencer = typeof item.influencer === 'object' && item.influencer !== null
          ? item.influencer
          : { name: "Unknown Influencer" };
          
        return {
          ...item,
          influencer
        };
      });
      
      setRequests(formattedData as GiftRequest[]);
    } catch (error) {
      toast({
        title: "Error loading gifts",
        description: (error as Error).message,
        variant: "destructive",
      });
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchSentGiftRequests();
  }, [fetchSentGiftRequests]);

  return (
    <div className="min-h-screen w-full bg-[var(--background)]">
      <Header /> {/* Replicated header from home for nav + menu */}
      <div className="container mx-auto pt-28 pb-10 px-4 max-w-2xl">
        <h1 className="text-2xl font-bold mb-3">Gifts Sent</h1>
        <p className="mb-6 text-gray-600">
          Here you can track your gift requests sent to influencers.
        </p>
        {loading ? (
          <div className="mt-10 text-center text-muted-foreground">Loading your gift requests...</div>
        ) : requests.length === 0 ? (
          <div className="mt-10 text-center text-gray-600">You haven't sent any gifts yet.</div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {requests.map((req) => (
              <div key={req.id} className="border rounded-lg bg-white shadow-sm p-4">
                <div className="flex flex-row justify-between items-center gap-4">
                  <div>
                    <span className="text-lg font-semibold">{req.product_title || "Gift Request"}</span>
                    <div className="text-sm text-gray-500">
                      To: {req.influencer?.name || "Influencer"}
                    </div>
                    {req.product_price && (
                      <div className="text-xs mt-1 text-gray-500">
                        Price: ₹{req.product_price}
                      </div>
                    )}
                  </div>
                  <div>
                    <Badge variant="outline" className="capitalize text-xs">
                      {STATUS_LABELS[req.status] || req.status}
                    </Badge>
                  </div>
                </div>
                {req.message && (
                  <div className="mt-2 text-gray-700 text-sm bg-gray-50 rounded px-3 py-2">
                    "{req.message}"
                  </div>
                )}
                <div className="mt-3 text-xs text-gray-400">
                  Sent on: {req.created_at ? new Date(req.created_at).toLocaleString() : "-"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GiftsSent;
