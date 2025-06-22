
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Package, Clock, ArrowRight } from 'lucide-react';
import FloatingHeader from '@/components/ui/floating-header';
import Navbar from '@/components/navigation/Navbar';

export default function OrderSuccess() {
  const [navOpen, setNavOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const orderId = location.state?.orderId;

  useEffect(() => {
    // If no order ID is provided, redirect to home
    if (!orderId) {
      navigate('/home');
    }
  }, [orderId, navigate]);

  const handleTrackOrder = () => {
    navigate('/track-order', { state: { orderId } });
  };

  const handleBackToHome = () => {
    navigate('/home');
  };

  return (
    <>
      <FloatingHeader setNavOpen={setNavOpen} />
      <Navbar isOpen={navOpen} setIsOpen={setNavOpen} />
      
      <div className="min-h-screen bg-background pt-20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Order Placed Successfully!
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Your gift order has been submitted and is being processed.
              </p>
              
              {orderId && (
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <p className="text-sm text-gray-500">Order ID</p>
                  <p className="font-mono text-sm font-semibold">{orderId}</p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Package className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">What's next?</p>
                  <p className="text-sm text-blue-700">We'll process your order and send updates to your email.</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
                <Clock className="h-5 w-5 text-amber-600" />
                <div>
                  <p className="font-medium text-amber-900">Processing Time</p>
                  <p className="text-sm text-amber-700">Orders typically take 1-3 business days to process.</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={handleTrackOrder}
                className="w-full bg-gradient-to-r from-funky-purple to-funky-pink text-white"
              >
                Track Your Order
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleBackToHome}
                className="w-full"
              >
                Return to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
