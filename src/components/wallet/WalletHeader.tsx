import { Wallet } from "@/types/wallet";
import { Skeleton } from "@/components/ui/skeleton";
import { Wallet as WalletIcon } from "lucide-react";
interface WalletHeaderProps {
  wallet: Wallet | null;
  loading: boolean;
}
const WalletHeader = ({
  wallet,
  loading
}: WalletHeaderProps) => {
  if (loading) {
    return <div className="bg-white rounded-lg p-6 shadow-md">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>;
  }
  return <div className="bg-white rounded-lg p-6 shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="bg-primary/10 p-3 rounded-full">
            <WalletIcon className="h-6 w-6 text-primary" />
          </div>
          <div className="ml-4">
            <h3 className="text-sm text-gray-500">Available Balance</h3>
            <p className="text-2xl font-bold text-gray-950">₹{wallet?.balance.toFixed(2) || "0.00"}</p>
          </div>
        </div>
        <div className="hidden md:block">
          <p className="text-sm text-gray-500">Wallet ID</p>
          <p className="text-xs text-gray-400 font-mono">{wallet?.id || "Not available"}</p>
        </div>
      </div>
    </div>;
};
export default WalletHeader;