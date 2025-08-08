import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface PendingGiftRequest {
  id: string;
  total_amount: number;
  platform_fee: number;
  product_price: number | null;
  status: string;
  product_title: string | null;
  created_at: string;
}

export const usePendingGiftRequests = () => {
  const [loading, setLoading] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<PendingGiftRequest[]>([]);

  // Get all pending gift requests for the current user that haven't been paid for yet
  const fetchPendingGiftRequests = useCallback(async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Get orders that are pending admin approval or approved but waiting for influencer response
      // These are the orders where money hasn't been deducted yet
      const { data, error } = await supabase
        .from('orders')
        .select('id, total_amount, platform_fee, product_price, status, product_title, created_at')
        .eq('user_id', user.id)
        .eq('gift_type', true)
        .in('status', ['pending_admin_approval', 'approved_waiting_influencer'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setPendingRequests(data || []);
      return data || [];
    } catch (error) {
      console.error("Error fetching pending gift requests:", error);
      setPendingRequests([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate total amount needed for all pending requests
  const calculateTotalPendingAmount = useCallback((requests: PendingGiftRequest[] = pendingRequests): number => {
    return requests.reduce((total, request) => {
      // Use total_amount if available, otherwise calculate from product_price + platform_fee
      const requestAmount = request.total_amount || 
        ((request.product_price || 0) + (request.platform_fee || 5.00));
      return total + requestAmount;
    }, 0);
  }, [pendingRequests]);

  // Check if user has sufficient balance for all pending requests + new amount
  const checkSufficientBalanceForNewRequest = useCallback(async (
    newRequestAmount: number,
    currentWalletBalance: number
  ): Promise<{
    hasSufficientBalance: boolean;
    totalPendingAmount: number;
    totalRequiredAmount: number;
    pendingRequestsCount: number;
  }> => {
    const requests = await fetchPendingGiftRequests();
    const totalPendingAmount = calculateTotalPendingAmount(requests);
    const totalRequiredAmount = totalPendingAmount + newRequestAmount;
    const hasSufficientBalance = currentWalletBalance >= totalRequiredAmount;

    return {
      hasSufficientBalance,
      totalPendingAmount,
      totalRequiredAmount,
      pendingRequestsCount: requests.length
    };
  }, [fetchPendingGiftRequests, calculateTotalPendingAmount]);

  return {
    pendingRequests,
    loading,
    fetchPendingGiftRequests,
    calculateTotalPendingAmount,
    checkSufficientBalanceForNewRequest
  };
};