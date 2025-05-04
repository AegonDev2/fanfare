
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
      
      // Use explicit column selection with alias for the joined influencer name
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
          influencer_id,
          profiles!gift_requests_influencer_id_fkey (name)
        `)
        .eq("sender_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching gift requests:", error);
        throw error;
      }

      // Format data
      if (data) {
        const formattedRequests: GiftRequest[] = data.map(item => {
          // Safely access the name using proper typescript handling
          const influencerProfile = item.profiles as { name: string | null } | null;
          const influencerName = influencerProfile?.name || "Unknown Influencer";
          
          return {
            id: item.id,
            product_url: item.product_url,
            product_title: item.product_title,
            product_price: item.product_price,
            message: item.message,
            created_at: item.created_at,
            status: item.status,
            influencer_name: influencerName,
            // Set optional fields to null as they may not be in the gift_requests table
            platform_fee: null,
            total_amount: null,
            completed_at: null,
            delivery_estimate: null
          };
        });
        
        setRequests(formattedRequests);
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
