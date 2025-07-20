import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Mail, CheckCircle } from "lucide-react";
import FloatingHeader from '@/components/ui/floating-header';
import Navbar from '@/components/navigation/Navbar';
import { useState } from "react";

const EmailVerification = () => {
  const navigate = useNavigate();
  const [navOpen, setNavOpen] = useState(false);

  return (
    <>
      <FloatingHeader setNavOpen={setNavOpen} />
      <Navbar isOpen={navOpen} setIsOpen={setNavOpen} />
      <div className="min-h-screen p-4 bg-slate-50 pt-20">
        <div className="max-w-md mx-auto pt-8">
          <Card className="p-8 bg-white text-center">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <Mail className="h-16 w-16 text-funky-purple" />
                <CheckCircle className="h-6 w-6 text-green-500 absolute -top-1 -right-1 bg-white rounded-full" />
              </div>
            </div>
            
            <h1 className="text-2xl font-bold mb-4 text-gray-900">
              Check Your Email
            </h1>
            
            <p className="text-gray-600 mb-6 leading-relaxed">
              We've sent you a verification link at your email address. 
              Please click the link in the email to verify your account and get started.
            </p>
            
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Next steps:</strong>
                  <br />
                  1. Check your email inbox (and spam folder)
                  <br />
                  2. Click the verification link
                  <br />
                  3. You'll be redirected to your dashboard
                </p>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full mt-6" 
                onClick={() => navigate("/auth")}
              >
                Back to Login
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};

export default EmailVerification;