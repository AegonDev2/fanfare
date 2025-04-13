
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/hooks/use-wallet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Wallet as WalletIcon, CreditCard, Receipt, PlusCircle } from "lucide-react";
import WalletHeader from "@/components/wallet/WalletHeader";
import TransactionHistory from "@/components/wallet/TransactionHistory";
import TopUpWallet from "@/components/wallet/TopUpWallet";
import { supabase } from "@/integrations/supabase/client";

const WalletPage = () => {
  const { wallet, transactions, loading, fetchWallet, fetchTransactions } = useWallet();
  const [activeTab, setActiveTab] = useState<string>("balance");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      
      if (!data.session) {
        toast({
          title: "Authentication required",
          description: "Please login to access your wallet",
          variant: "destructive",
        });
        navigate("/auth?tab=login");
        return;
      }
      
      setIsLoggedIn(true);
      fetchWallet();
      fetchTransactions();
    };
    
    checkSession();
  }, []);
  
  if (!isLoggedIn) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gray-100 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <WalletIcon className="w-8 h-8 mr-2 text-primary" />
          <h1 className="text-3xl font-bold">My Wallet</h1>
        </div>
        
        <WalletHeader wallet={wallet} loading={loading} />
        
        <div className="mt-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-8">
              <TabsTrigger value="balance">
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
              <Card>
                <CardHeader>
                  <CardTitle>Wallet Information</CardTitle>
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
                      
                      <button 
                        onClick={() => setActiveTab("topup")}
                        className="flex items-center justify-center gap-2 p-3 rounded-md bg-primary text-white"
                      >
                        <PlusCircle className="w-5 h-5" />
                        <span>Add Money</span>
                      </button>
                      
                      <button 
                        onClick={() => setActiveTab("transactions")}
                        className="flex items-center justify-center gap-2 p-3 rounded-md border border-gray-300"
                      >
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
                onRefresh={fetchTransactions}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default WalletPage;
