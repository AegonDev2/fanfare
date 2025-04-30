
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface GiftRequest {
  id: string;
  product_url: string;
  product_title: string | null;
  product_price: number | null;
  message: string | null;
  created_at: string;
  status: 'pending' | 'accepted' | 'rejected' | 'under process' | 'completed';
  influencer_name: string | null;
  platform_fee?: number | null;
  total_amount?: number | null;
  completed_at?: string | null;
  delivery_estimate?: string | null;
}

export const useGiftsSent = () => {
  const { toast } = useToast();
  const [requests, setRequests] = useState<GiftRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<GiftRequest | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

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
      
      // Fetch gift requests with all status information
      const { data, error } = await supabase
        .from("gift_requests")
        .select(`
          id,
          product_url,
          product_title,
          product_price,
          message,
          created_at,
          status,
          platform_fee,
          total_amount,
          completed_at,
          delivery_estimate,
          influencer:profiles(name)
        `)
        .eq("sender_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching gift requests:", error);
        throw error;
      }

      // Format data
      if (data) {
        const formattedRequests = data.map(item => ({
          ...item,
          influencer_name: item.influencer?.name || "Unknown Influencer"
        }));
        
        setRequests(formattedRequests as GiftRequest[]);
      }
    } catch (error: any) {
      toast({
        title: "Error loading gifts",
        description: error.message,
        variant: "destructive",
      });
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const handleDetailsClick = (request: GiftRequest) => {
    setSelectedRequest(request);
    setDialogOpen(true);
  };

  return {
    requests,
    loading,
    fetchSentGiftRequests,
    selectedRequest,
    setSelectedRequest,
    dialogOpen,
    setDialogOpen,
    handleDetailsClick
  };
};
