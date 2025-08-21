import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { optimizedCache } from '@/utils/optimizedCache';

interface WalletData {
  wallet: any;
  transactions: any[];
}

// Batched wallet data fetcher
const fetchWalletData = async (userId: string): Promise<WalletData> => {
  const cacheKey = `wallet_data_${userId}`;
  const cached = optimizedCache.getDynamicData(userId, 'wallet');
  
  if (cached) {
    console.log('⚡ Using cached wallet data');
    return cached;
  }

  console.log('💰 Fetching wallet data for:', userId);

  try {
    // Batch both wallet and transactions in parallel
    const [walletResult, transactionResult] = await Promise.all([
      supabase
        .from('wallets')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle(),
      supabase
        .from('transactions')
        .select('*')
        .eq('wallet_id', null) // We'll update this after getting wallet
        .order('created_at', { ascending: false })
        .limit(50)
    ]);

    let wallet = walletResult.data;
    let transactions: any[] = [];

    // If no wallet exists, create one
    if (!wallet) {
      const { data: newWallet, error: createError } = await supabase
        .from('wallets')
        .insert({
          user_id: userId,
          balance: 0
        })
        .select()
        .single();
      
      if (createError) throw createError;
      wallet = newWallet;
    }

    // Fetch transactions for the wallet
    if (wallet) {
      const { data: txData, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .eq('wallet_id', wallet.id)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (!txError && txData) {
        transactions = txData;
      }
    }

    const result: WalletData = {
      wallet,
      transactions
    };

    // Cache for 2 minutes (wallet data changes frequently)
    optimizedCache.setDynamicData(userId, 'wallet', result);

    console.log('✅ Wallet data loaded and cached');
    return result;
  } catch (error) {
    console.error('❌ Error fetching wallet data:', error);
    throw error;
  }
};

export const useOptimizedWallet = (userId: string | undefined) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const walletQuery = useQuery({
    queryKey: ['wallet-data', userId],
    queryFn: () => fetchWalletData(userId!),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });

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
        queryClient.invalidateQueries({ queryKey: ['wallet-data', userId] });
        
        // Clear cache
        if (userId) {
          optimizedCache.clearUserData(userId);
        }
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
    ...walletQuery,
    wallet: walletQuery.data?.wallet,
    transactions: walletQuery.data?.transactions || [],
    mutate: walletMutation.mutate,
    isMutating: walletMutation.isPending,
  };
};