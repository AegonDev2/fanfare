
import { useState, useEffect } from "react";
import { useOptimizedAuth } from "@/hooks/useOptimizedAuth";
import { useWallet } from '@/hooks/useWallet';
import { OptimizedNavigation } from "@/components/navigation/OptimizedNavigation";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet as WalletIcon, CreditCard, Receipt, PlusCircle, ArrowLeft } from "lucide-react";
import WalletHeader from "@/components/wallet/WalletHeader";
import TransactionHistory from "@/components/wallet/TransactionHistory";
import TopUpWallet from "@/components/wallet/TopUpWallet";
import { supabase } from "@/integrations/supabase/client";

const WalletPage = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useOptimizedAuth();
  const {
    wallet,
    transactions,
    isLoading: walletLoading,
    mutate,
    isMutating
  } = useWallet(user?.id);
  
  const [activeTab, setActiveTab] = useState<string>("balance");
  const { toast } = useToast();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please login to access your wallet",
        variant: "destructive"
      });
      // Will be handled by OptimizedNavigation
    }
  }, [authLoading, isAuthenticated, toast]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const loading = walletLoading || isMutating;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <OptimizedNavigation>
                {(navigate) => (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate('-1')}
                    className="lg:hidden"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                )}
              </OptimizedNavigation>
              <div className="flex items-center space-x-2">
                <WalletIcon className="w-6 h-6 text-primary" />
                <h1 className="text-xl font-bold text-gray-950">My Wallet</h1>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-2">
              <span className="text-sm text-gray-500">Balance:</span>
              <span className="text-lg font-semibold text-primary">
                ₹{wallet?.balance.toFixed(2) || "0.00"}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 pb-24">
        <WalletHeader wallet={wallet} loading={loading} />
        
        <div className="mt-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-8 py-0 my-0">
              <TabsTrigger value="balance" className="my-0">
                <WalletIcon className="w-4 h-4 mr-2" />
                <span>Balance</span>
              </TabsTrigger>
              <TabsTrigger value="topup">
                <PlusCircle className="w-4 h-4 mr-2" />
                <span>Top Up</span>
              </TabsTrigger>
              <TabsTrigger value="transactions">
                <Receipt className="w-4 h-4 mr-2" />
                <span>Transactions</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="balance">
              <Card className="bg-transparent">
                <CardHeader>
                  <CardTitle className="text-gray-950">Wallet Information</CardTitle>
                  <CardDescription>View and manage your wallet balance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-primary/10 p-6 rounded-lg">
                      <p className="text-sm text-gray-600">Available Balance</p>
                      <h2 className="text-4xl font-bold text-primary">
                        ₹{wallet?.balance.toFixed(2) || "0.00"}
                      </h2>
                    </div>
                    
                    <div className="grid gap-4 mt-4">
                      <p className="text-sm text-gray-600">
                        Your wallet balance is used to pay for gift requests when approved by influencers. 
                        You can top up your wallet using various payment methods.
                      </p>
                      
                      <button onClick={() => setActiveTab("topup")} className="flex items-center justify-center gap-2 p-3 rounded-md bg-primary text-white">
                        <PlusCircle className="w-5 h-5" />
                        <span>Add Money</span>
                      </button>
                      
                      <button onClick={() => setActiveTab("transactions")} className="flex items-center justify-center gap-2 p-3 rounded-md border border-gray-300 bg-stone-200 hover:bg-stone-100">
                        <Receipt className="w-5 h-5" />
                        <span>View Transactions</span>
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="topup">
              <TopUpWallet />
            </TabsContent>
            
            <TabsContent value="transactions">
              <TransactionHistory 
                transactions={transactions} 
                loading={loading} 
                onRefresh={() => {
                  // Refresh will be handled by React Query invalidation
                }} 
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default WalletPage;
