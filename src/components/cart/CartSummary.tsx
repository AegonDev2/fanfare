
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Loader2 } from 'lucide-react';

interface CartSummaryProps {
  subtotal: number;
  platformFee: number;
  total: number;
  itemCount: number;
  onCheckout: () => void;
  isProcessing: boolean;
  isAuthenticated: boolean;
}

export default function CartSummary({
  subtotal,
  platformFee,
  total,
  itemCount,
  onCheckout,
  isProcessing,
  isAuthenticated
}: CartSummaryProps) {
  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal ({itemCount} items)</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Platform Fee</span>
            <span>₹{platformFee.toFixed(2)}</span>
          </div>
          
          <Separator />
          
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span className="text-purple-600">₹{total.toFixed(2)}</span>
          </div>
        </div>
        
        <div className="mt-6 space-y-3">
          <Button 
            className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white"
            onClick={onCheckout}
            disabled={itemCount === 0 || isProcessing || !isAuthenticated}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Checkout
              </>
            )}
          </Button>
          
          {!isAuthenticated && (
            <p className="text-xs text-center text-gray-500">
              Please log in to checkout
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
