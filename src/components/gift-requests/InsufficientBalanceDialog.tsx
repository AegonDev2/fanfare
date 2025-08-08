import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Wallet, AlertTriangle } from "lucide-react";

interface InsufficientBalanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTopUpWallet: () => void;
  currentBalance: number;
  totalRequiredAmount: number;
  totalPendingAmount: number;
  pendingRequestsCount: number;
  newRequestAmount: number;
}

export const InsufficientBalanceDialog = ({
  open,
  onOpenChange,
  onTopUpWallet,
  currentBalance,
  totalRequiredAmount,
  totalPendingAmount,
  pendingRequestsCount,
  newRequestAmount
}: InsufficientBalanceDialogProps) => {
  const shortfallAmount = totalRequiredAmount - currentBalance;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <AlertDialogTitle>Insufficient Wallet Balance</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-3 text-left">
            <p>
              You don't have enough balance to place this gift request due to existing pending requests.
            </p>
            
            <div className="bg-muted p-3 rounded-lg space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Current wallet balance:</span>
                <span className="font-medium">₹{currentBalance.toFixed(2)}</span>
              </div>
              
              {pendingRequestsCount > 0 && (
                <div className="flex justify-between">
                  <span>Pending requests ({pendingRequestsCount}):</span>
                  <span className="font-medium">₹{totalPendingAmount.toFixed(2)}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span>New request:</span>
                <span className="font-medium">₹{newRequestAmount.toFixed(2)}</span>
              </div>
              
              <hr className="border-border" />
              
              <div className="flex justify-between font-semibold">
                <span>Total required:</span>
                <span>₹{totalRequiredAmount.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between text-destructive font-semibold">
                <span>Shortfall:</span>
                <span>₹{shortfallAmount.toFixed(2)}</span>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Please add funds to your wallet to proceed with this and any pending gift requests.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onTopUpWallet} className="gap-2">
            <Wallet className="h-4 w-4" />
            Top Up Wallet
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};