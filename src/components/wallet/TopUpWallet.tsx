
import { useState } from "react";
import { useWallet } from "@/hooks/use-wallet";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CreditCard, Banknote, Coins, CheckCircle2, Loader2 } from "lucide-react";
import { TopUpFormData } from "@/types/wallet";

const PRESET_AMOUNTS = [100, 500, 1000, 5000];

const TopUpWallet = () => {
  const { topUpWallet } = useWallet();
  const [formData, setFormData] = useState<TopUpFormData>({
    amount: 0,
    paymentMethod: "credit_card",
  });
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  
  const handleAmountSelect = (amount: number) => {
    setFormData({...formData, amount});
    setCustomAmount("");
  };
  
  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setCustomAmount(value);
    setFormData({...formData, amount: Number(value) || 0});
  };
  
  const handlePaymentMethodChange = (value: string) => {
    setFormData({
      ...formData, 
      paymentMethod: value as TopUpFormData["paymentMethod"]
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.amount <= 0) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real app, we would integrate with a payment gateway here
      // For demo purposes, we're directly topping up the wallet
      const success = await topUpWallet(formData.amount, formData.paymentMethod);
      
      if (success) {
        setPaymentSuccess(true);
        
        // Reset form after 3 seconds
        setTimeout(() => {
          setFormData({amount: 0, paymentMethod: "credit_card"});
          setCustomAmount("");
          setPaymentSuccess(false);
        }, 3000);
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (paymentSuccess) {
    return (
      <Card>
        <CardContent className="pt-6 flex flex-col items-center justify-center min-h-[300px]">
          <div className="bg-green-100 p-4 rounded-full">
            <CheckCircle2 className="h-16 w-16 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold mt-4">Payment Successful!</h2>
          <p className="text-gray-600 mt-2">
            ₹{formData.amount} has been added to your wallet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Money to Wallet</CardTitle>
        <CardDescription>Top up your wallet to make gift purchases</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label>Select Amount</Label>
              <div className="grid grid-cols-2 gap-3 mt-2 md:grid-cols-4">
                {PRESET_AMOUNTS.map((amount) => (
                  <Button
                    key={amount}
                    type="button"
                    variant={formData.amount === amount ? "default" : "outline"}
                    onClick={() => handleAmountSelect(amount)}
                  >
                    ₹{amount}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <Label htmlFor="customAmount">Custom Amount</Label>
              <div className="relative mt-2">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                <Input 
                  id="customAmount"
                  placeholder="Enter amount"
                  className="pl-8"
                  value={customAmount}
                  onChange={handleCustomAmountChange}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <RadioGroup 
                value={formData.paymentMethod} 
                onValueChange={handlePaymentMethodChange}
                className="grid grid-cols-1 gap-3 mt-2 md:grid-cols-3"
              >
                <Label 
                  htmlFor="credit_card"
                  className={`flex items-center justify-between p-4 rounded-md border cursor-pointer
                    ${formData.paymentMethod === "credit_card" ? "border-primary bg-primary/5" : "border-gray-200"}`}
                >
                  <div className="flex items-center space-x-3">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Credit Card</p>
                      <p className="text-xs text-gray-500">Visa, Mastercard, Rupay</p>
                    </div>
                  </div>
                  <RadioGroupItem value="credit_card" id="credit_card" />
                </Label>
                
                <Label 
                  htmlFor="upi"
                  className={`flex items-center justify-between p-4 rounded-md border cursor-pointer
                    ${formData.paymentMethod === "upi" ? "border-primary bg-primary/5" : "border-gray-200"}`}
                >
                  <div className="flex items-center space-x-3">
                    <Coins className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">UPI</p>
                      <p className="text-xs text-gray-500">PhonePe, GPay, Paytm</p>
                    </div>
                  </div>
                  <RadioGroupItem value="upi" id="upi" />
                </Label>
                
                <Label 
                  htmlFor="netbanking"
                  className={`flex items-center justify-between p-4 rounded-md border cursor-pointer
                    ${formData.paymentMethod === "netbanking" ? "border-primary bg-primary/5" : "border-gray-200"}`}
                >
                  <div className="flex items-center space-x-3">
                    <Banknote className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Net Banking</p>
                      <p className="text-xs text-gray-500">All major banks</p>
                    </div>
                  </div>
                  <RadioGroupItem value="netbanking" id="netbanking" />
                </Label>
              </RadioGroup>
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSubmit} 
          className="w-full" 
          disabled={formData.amount <= 0 || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>Add ₹{formData.amount || 0}</>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TopUpWallet;
