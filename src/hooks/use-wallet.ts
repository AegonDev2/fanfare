
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Wallet, Transaction } from "@/types/wallet";

export const useWallet = () => {
  const [loading, setLoading] = useState(false);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const { toast } = useToast();
  
  // Fetch user wallet
  const fetchWallet = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      // Get user wallet
      const { data, error } = await supabase
        .from('wallets')
        .select()
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        // If error is because wallet doesn't exist, create one
        if (error.message.includes('No rows found')) {
          // Create a wallet with 0 balance by inserting directly
          const { data: newWallet, error: createError } = await supabase
            .from('wallets')
            .insert({ user_id: user.id, balance: 0 })
            .select()
            .single();
            
          if (createError) throw createError;
          
          if (newWallet) {
            setWallet(newWallet as Wallet);
          }
        } else {
          throw error;
        }
      } else if (data) {
        setWallet(data as Wallet);
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
  };
  
  // Fetch user transactions
  const fetchTransactions = async () => {
    try {
      if (!wallet) {
        await fetchWallet();
        if (!wallet) return;
      }
      
      setLoading(true);
      
      const { data, error } = await supabase
        .from('transactions')
        .select()
        .eq('wallet_id', wallet.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setTransactions(data as Transaction[]);
      }
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
  
  // Top up wallet
  const topUpWallet = async (amount: number, paymentMethod: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      // Call the top_up_wallet function
      const { data, error } = await supabase
        .rpc('top_up_wallet', {
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
  }, []);
  
  return {
    wallet,
    transactions,
    loading,
    fetchWallet,
    fetchTransactions,
    topUpWallet,
    checkWalletBalance,
  };
};
