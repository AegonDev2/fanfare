
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CreditCard, CheckCircle2 } from "lucide-react";
import { ProductDetails } from "@/types/order";

interface PaymentFormProps {
  productPreview: ProductDetails;
  isProcessing: boolean;
  paymentStep: 'initial' | 'processing' | 'complete';
  onSubmit: () => void;
}

const PaymentForm = ({
  productPreview,
  isProcessing,
  paymentStep,
  onSubmit,
}: PaymentFormProps) => {
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const { toast } = useToast();

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and format with spaces
    const value = e.target.value.replace(/\D/g, "");
    const formattedValue = value
      .replace(/(.{4})/g, "$1 ")
      .trim()
      .substring(0, 19);
    setCardNumber(formattedValue);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Format as MM/YY
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 2) {
      setExpiryDate(value);
    } else {
      setExpiryDate(`${value.substring(0, 2)}/${value.substring(2, 4)}`);
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow up to 3 digits
    const value = e.target.value.replace(/\D/g, "").substring(0, 3);
    setCvv(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (cardNumber.length < 19) {
      toast({
        title: "Invalid card number",
        description: "Please enter a valid 16-digit card number",
        variant: "destructive",
      });
      return;
    }

    if (expiryDate.length < 5) {
      toast({
        title: "Invalid expiry date",
        description: "Please enter a valid expiry date (MM/YY)",
        variant: "destructive",
      });
      return;
    }

    if (cvv.length < 3) {
      toast({
        title: "Invalid CVV",
        description: "Please enter a valid 3-digit CVV code",
        variant: "destructive",
      });
      return;
    }

    onSubmit();
  };

  if (paymentStep === 'complete') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6 flex flex-col items-center">
          <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
          <h3 className="text-lg font-semibold">Payment Successful</h3>
          <p className="text-sm text-gray-500 mt-2">
            Your payment has been processed successfully. Processing your gift request...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <CreditCard className="mr-2 h-5 w-5" />
          <span>Payment Details</span>
        </CardTitle>
        <CardDescription>
          Enter your card information to complete the purchase
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cardName">Name on Card</Label>
            <Input
              id="cardName"
              placeholder="John Doe"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              required
              disabled={isProcessing}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cardNumber">Card Number</Label>
            <Input
              id="cardNumber"
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChange={handleCardNumberChange}
              required
              disabled={isProcessing}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input
                id="expiryDate"
                placeholder="MM/YY"
                value={expiryDate}
                onChange={handleExpiryChange}
                required
                disabled={isProcessing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvv">CVV</Label>
              <Input
                id="cvv"
                placeholder="123"
                value={cvv}
                onChange={handleCvvChange}
                required
                disabled={isProcessing}
                type="password"
              />
            </div>
          </div>

          <div className="mt-6">
            <div className="flex justify-between mb-2 text-sm">
              <span>Subtotal</span>
              <span>₹{productPreview.priceInr.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2 text-sm">
              <span>Platform Fee</span>
              <span>₹{productPreview.platformFee.toFixed(2)}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>₹{(productPreview.priceInr + productPreview.platformFee).toFixed(2)}</span>
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={handleSubmit}
          disabled={isProcessing}
        >
          {isProcessing ? "Processing..." : "Pay Now"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PaymentForm;
