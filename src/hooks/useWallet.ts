import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { requestManager } from '@/utils/requestDeduplication';
import { Wallet, Transaction } from '@/types/wallet';

// Simplified wallet data fetcher
const fetchWalletData = async (userId: string): Promise<{wallet: Wallet | null, transactions: Transaction[]}> => {
  if (!userId) throw new Error('User ID is required');
  
  return requestManager.dedupeWithRetry(`wallet_${userId}`, async () => {
    console.log('💰 Fetching wallet data for:', userId);

    // Fetch wallet first
    const { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (walletError) throw walletError;

    let walletData = wallet;
    
    // Create wallet if it doesn't exist
    if (!walletData) {
      const { data: newWallet, error: createError } = await supabase
        .from('wallets')
        .insert({ user_id: userId, balance: 0 })
        .select()
        .single();
      
      if (createError) throw createError;
      walletData = newWallet;
    }

    // Fetch transactions
    const { data: transactions, error: txError } = await supabase
      .from('transactions')
      .select('*')  
      .eq('wallet_id', walletData.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (txError) throw txError;

    return {
      wallet: walletData,
      transactions: (transactions || []).map(tx => ({
        ...tx,
        type: tx.type as Transaction['type'],
        status: tx.status as Transaction['status']
      }))
    };
  });
};

export const useWallet = (userId: string | undefined) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const walletQuery = useQuery({
    queryKey: ['wallet', userId],
    queryFn: () => fetchWalletData(userId!),
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 seconds - wallet data changes frequently
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  // Handle errors
  if (walletQuery.error) {
    console.error('❌ Error fetching wallet data:', walletQuery.error);
    toast({
      title: "Error loading wallet",
      description: "Failed to load wallet data",
      variant: "destructive",
    });
  }

  // Mutation for wallet operations
  const walletMutation = useMutation({
    mutationFn: async ({ action, ...params }: { action: string; [key: string]: any }) => {
      if (action === 'createOrder') {
        const { data, error } = await supabase.functions.invoke("razorpay-payment", {
          body: {
            action: "create_order",
            userId: userId,
            amount: params.amount
          }
        });
        if (error) throw error;
        return data;
      }
      
      if (action === 'verifyPayment') {
        const { data, error } = await supabase.functions.invoke("razorpay-payment", {
          body: {
            action: "verify_payment",
            userId: userId,
            orderId: params.orderId,
            paymentId: params.paymentId,
            signature: params.signature
          }
        });
        if (error) throw error;
        return data;
      }
      
      throw new Error('Unknown wallet action');
    },
    onSuccess: (data, variables) => {
      if (variables.action === 'verifyPayment') {
        toast({
          title: "Payment successful",
          description: "Your wallet has been topped up",
        });
        
        // Invalidate and refetch wallet data
        queryClient.invalidateQueries({ queryKey: ['wallet', userId] });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Operation failed",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    }
  });

  return {
    wallet: walletQuery.data?.wallet,
    transactions: walletQuery.data?.transactions || [],
    isLoading: walletQuery.isLoading,
    error: walletQuery.error,
    mutate: walletMutation.mutate,
    isMutating: walletMutation.isPending,
  };
};