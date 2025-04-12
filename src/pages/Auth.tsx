
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoginForm from "@/components/auth/LoginForm";
import SignUpForm from "@/components/auth/SignUpForm";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import UpdatePasswordForm from "@/components/auth/UpdatePasswordForm";

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPasswordUpdate, setShowPasswordUpdate] = useState(false);
  
  useEffect(() => {
    // Check if this is a password reset or email verification flow
    const checkActionType = async () => {
      const params = new URLSearchParams(location.hash.substring(1));
      const type = params.get("type");
      
      // If this is a password recovery action, show password update form
      if (type === "recovery") {
        setShowPasswordUpdate(true);
      }
    };
    
    checkActionType();
  }, [location]);

  return (
    <div className="min-h-screen p-4 bg-background">
      <div className="max-w-md mx-auto pt-8">
        <Card className="p-6">
          <Button 
            variant="ghost" 
            className="mb-4"
            onClick={() => navigate("/")}
          >
            ← Back to Home
          </Button>
          <h1 className="text-3xl font-bold mb-4 text-center">GiftLoop Connect</h1>
          <p className="text-muted-foreground mb-6 text-center">
            Connect with your favorite influencers and share meaningful gifts.
          </p>
          
          {showPasswordUpdate ? (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-center">Update Your Password</h2>
              <UpdatePasswordForm />
            </div>
          ) : (
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <LoginForm />
              </TabsContent>
              <TabsContent value="signup">
                <SignUpForm />
              </TabsContent>
            </Tabs>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Auth;
