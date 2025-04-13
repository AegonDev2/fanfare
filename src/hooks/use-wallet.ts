
import { useState } from "react";
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
      
      // Get user wallet using a raw SQL query to work around TypeScript limitations
      const { data, error } = await supabase
        .rpc('execute_sql', { 
          sql_query: `SELECT * FROM wallets WHERE user_id = '${user.id}' LIMIT 1`
        })
        .single();
      
      if (error) {
        // If error is because wallet doesn't exist, create one
        if (error.message.includes('not_found')) {
          // Create a wallet with 0 balance
          const { data: newWallet, error: createError } = await supabase
            .rpc('execute_sql', { 
              sql_query: `INSERT INTO wallets (user_id, balance) VALUES ('${user.id}', 0) RETURNING *`
            })
            .single();
            
          if (createError) throw createError;
          
          if (newWallet) {
            setWallet({
              id: newWallet.id,
              user_id: newWallet.user_id,
              balance: parseFloat(newWallet.balance),
              created_at: newWallet.created_at,
              updated_at: newWallet.updated_at
            });
          }
        } else {
          throw error;
        }
      } else if (data) {
        setWallet({
          id: data.id,
          user_id: data.user_id,
          balance: parseFloat(data.balance),
          created_at: data.created_at,
          updated_at: data.updated_at
        });
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
      }
      
      setLoading(true);
      
      // Use raw SQL query to work around TypeScript limitations
      const { data, error } = await supabase
        .rpc('execute_sql', { 
          sql_query: `SELECT * FROM transactions WHERE wallet_id = '${wallet?.id}' ORDER BY created_at DESC`
        });
      
      if (error) {
        throw error;
      }
      
      if (data) {
        const formattedTransactions: Transaction[] = data.map((item: any) => ({
          id: item.id,
          wallet_id: item.wallet_id,
          amount: parseFloat(item.amount),
          type: item.type,
          status: item.status,
          description: item.description,
          reference_id: item.reference_id,
          created_at: item.created_at
        }));
        
        setTransactions(formattedTransactions);
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
      
      // Use execute_sql RPC to call our top_up_wallet function
      const { data, error } = await supabase
        .rpc('execute_sql', { 
          sql_query: `SELECT top_up_wallet('${user.id}', ${amount}, 'Top up via ${paymentMethod}')`
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
