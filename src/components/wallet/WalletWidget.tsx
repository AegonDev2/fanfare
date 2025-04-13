import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useWallet } from "@/hooks/use-wallet";
import { Wallet, PlusCircle } from "lucide-react";
const WalletWidget = () => {
  const {
    wallet,
    loading,
    fetchWallet
  } = useWallet();
  const navigate = useNavigate();
  useEffect(() => {
    fetchWallet();
  }, []);
  return <Card className="p-4 my-2 px-[11px] py-px">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Wallet className="h-5 w-5 text-primary" />
          <div>
            <p className="text-xs text-gray-500">Wallet Balance</p>
            {loading ? <Skeleton className="h-5 w-20" /> : <p className="font-medium">₹{wallet?.balance.toFixed(2) || "0.00"}</p>}
          </div>
        </div>
        <Button variant="outline" size="sm" className="text-xs" onClick={() => navigate("/wallet")}>
          <PlusCircle className="h-3 w-3 mr-1" />
          Top Up
        </Button>
      </div>
    </Card>;
};
export default WalletWidget;