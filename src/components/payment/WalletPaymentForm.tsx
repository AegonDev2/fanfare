import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/hooks/use-wallet";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Wallet, CheckCircle2, AlertCircle, Plus } from "lucide-react";
import { ProductDetails } from "@/types/order";
import { useNavigate } from "react-router-dom";

interface WalletPaymentFormProps {
  productPreview: ProductDetails;
  isProcessing: boolean;
  paymentStep: 'initial' | 'processing' | 'complete';
  onSubmit: (e: React.FormEvent) => void;
}

const WalletPaymentForm = ({
  productPreview,
  isProcessing,
  paymentStep,
  onSubmit,
}: WalletPaymentFormProps) => {
  const { wallet, loading: walletLoading, fetchWallet } = useWallet();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [hasSufficientBalance, setHasSufficientBalance] = useState(false);

  const totalAmount = productPreview.priceInr + productPreview.platformFee;

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  useEffect(() => {
    if (wallet) {
      setHasSufficientBalance(wallet.balance >= totalAmount);
    }
  }, [wallet, totalAmount]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Always allow order submission for admin review
    // Even if balance is insufficient or price extraction failed
    onSubmit(e);
  };

  const handleTopUpWallet = () => {
    navigate('/wallet?tab=topup');
  };

  if (paymentStep === 'complete') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6 flex flex-col items-center">
          <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
          <h3 className="text-lg font-semibold">Order Submitted Successfully</h3>
          <p className="text-sm text-muted-foreground mt-2 text-center">
            Your order has been submitted for admin review. Payment will be processed after approval.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (walletLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6 flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2">Loading wallet...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Wallet className="mr-2 h-5 w-5" />
          <span>Order Summary</span>
        </CardTitle>
        <CardDescription>
          Review your order and wallet balance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="font-semibold text-lg">{productPreview.name}</h3>
            <p className="text-muted-foreground">{productPreview.description}</p>
          </div>

          {/* Order Amount Breakdown */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Product Price</span>
              <span>₹{productPreview.priceInr.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Platform Fee</span>
              <span>₹{productPreview.platformFee.toFixed(2)}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-semibold">
              <span>Total Amount</span>
              <span>₹{totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <Separator />

          {/* Wallet Balance Section */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Wallet Balance</span>
              <span className="font-semibold">
                ₹{wallet?.balance.toFixed(2) || "0.00"}
              </span>
            </div>

            {/* Balance Status */}
            {wallet && (
              <div className="flex items-center gap-2 p-3 rounded-lg border">
                {hasSufficientBalance ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-700">
                      Sufficient balance available
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm text-yellow-700">
                      Insufficient balance (₹{(totalAmount - wallet.balance).toFixed(2)} short)
                    </span>
                  </>
                )}
              </div>
            )}

            {/* Top-up button for insufficient balance */}
            {!hasSufficientBalance && wallet && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleTopUpWallet}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-1" />
                Top Up Wallet
              </Button>
            )}
          </div>

          {/* Admin Review Notice */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Your order will be reviewed by admin first. 
              Payment will be processed from your wallet only after approval.
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={handleSubmit}
          disabled={isProcessing}
        >
          {isProcessing ? "Submitting..." : "Submit Order for Review"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default WalletPaymentForm;