
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Wallet, Transaction } from "@/types/wallet";

export const useWallet = () => {
  const [loading, setLoading] = useState(false);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const { toast } = useToast();
  
  // Fetch user wallet
  const fetchWallet = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      // Execute query to get wallet - using select() instead of maybeSingle() to handle multiple rows
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Check if wallet exists - use the most recent one if multiple exist
      if (data && data.length > 0) {
        setWallet(data[0] as Wallet);
        
        // If we found multiple wallets, log a warning - this shouldn't normally happen
        if (data.length > 1) {
          console.warn(`Found ${data.length} wallets for user ${user.id}. Using most recent one.`);
        }
      } else {
        // Create a wallet with 0 balance
        const { data: newWallet, error: createError } = await supabase
          .from('wallets')
          .insert({
            user_id: user.id,
            balance: 0
          })
          .select()
          .single();
        
        if (createError) throw createError;
        setWallet(newWallet as Wallet);
      }
    } catch (error: any) {
      console.error("Error fetching wallet:", error);
      toast({
        title: "Error fetching wallet",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);
  
  // Fetch user transactions
  const fetchTransactions = async () => {
    try {
      if (!wallet) {
        await fetchWallet();
        return; // Return early as fetchWallet will trigger this function again
      }
      
      setLoading(true);
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('wallet_id', wallet.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      setTransactions(data as Transaction[]);
    } catch (error: any) {
      console.error("Error fetching transactions:", error);
      toast({
        title: "Error fetching transactions",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Create Razorpay order
  const createRazorpayOrder = async (amount: number): Promise<{id: string, key: string} | null> => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      // Call our edge function to create a Razorpay order
      const { data, error } = await supabase.functions.invoke("razorpay-payment", {
        body: {
          action: "create_order",
          userId: user.id,
          amount: amount
        }
      });
      
      if (error) {
        throw error;
      }
      
      if (!data || !data.id || !data.key) {
        throw new Error("Invalid response from payment service");
      }
      
      return {
        id: data.id,
        key: data.key
      };
      
    } catch (error: any) {
      console.error("Error creating payment order:", error);
      toast({
        title: "Payment initialization failed",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  // Verify Razorpay payment
  const verifyRazorpayPayment = async (
    orderId: string, 
    paymentId: string, 
    signature: string
  ): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      // Call our edge function to verify the payment
      const { data, error } = await supabase.functions.invoke("razorpay-payment", {
        body: {
          action: "verify_payment",
          userId: user.id,
          orderId: orderId,
          paymentId: paymentId,
          signature: signature
        }
      });
      
      if (error || !data?.success) {
        throw new Error(data?.message || "Payment verification failed");
      }
      
      // Show success toast
      toast({
        title: "Payment successful",
        description: data.message || "Your wallet has been topped up",
      });
      
      // Refresh wallet data
      await fetchWallet();
      
      return true;
    } catch (error: any) {
      console.error("Error verifying payment:", error);
      toast({
        title: "Payment verification failed",
        description: error.message || "Please contact customer support",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Legacy top up wallet method (for backward compatibility)
  const topUpWallet = async (amount: number, paymentMethod: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      // Call the top_up_wallet function
      const { data, error } = await supabase.rpc('top_up_wallet', {
        p_user_id: user.id,
        p_amount: amount,
        p_description: `Top up via ${paymentMethod}`
      });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Wallet topped up successfully",
        description: `₹${amount} has been added to your wallet`,
      });
      
      // Refresh wallet data
      await fetchWallet();
      
      return true;
    } catch (error: any) {
      console.error("Error topping up wallet:", error);
      toast({
        title: "Top up failed",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Check wallet balance
  const checkWalletBalance = async (requiredAmount: number): Promise<boolean> => {
    try {
      if (!wallet) {
        await fetchWallet();
      }
      
      return wallet ? wallet.balance >= requiredAmount : false;
    } catch (error) {
      console.error("Error checking wallet balance:", error);
      return false;
    }
  };

  // Effect to fetch wallet on mount if user is logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        fetchWallet();
      }
    };
    
    checkSession();
  }, [fetchWallet]);
  
  return {
    wallet,
    transactions,
    loading,
    fetchWallet,
    fetchTransactions,
    topUpWallet,
    createRazorpayOrder,
    verifyRazorpayPayment,
    checkWalletBalance,
  };
};
