
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoginForm from "@/components/auth/LoginForm";
import SignUpForm from "@/components/auth/SignUpForm";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();
  const [isInfluencer, setIsInfluencer] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    checkUser();
  }, []);
  
  const checkUser = async () => {
    try {
      const {
        data: {
          session
        }
      } = await supabase.auth.getSession();
      if (session?.user) {
        // If user is logged in, redirect to landing page
        navigate("/");
        return;
      }
      
      // If no session, redirect to auth page
      navigate("/auth");
    } catch (error) {
      console.error("Error in checkUser:", error);
      navigate("/auth");
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isLoading) {
    return <div className="min-h-screen p-4 bg-background flex items-center justify-center">
        <p>Loading...</p>
      </div>;
  }
  
  return <div className="min-h-screen p-4 bg-background">
      <div className="max-w-md mx-auto pt-8">
        <Card className="p-6 bg-slate-50">
          <h1 className="text-3xl font-bold mb-4 text-center">GiftLoop Connect</h1>
          <p className="mb-6 text-center text-fuchsia-200">
            Connect with your favorite influencers and share meaningful gifts.
          </p>
          
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4 rounded-sm px-[11px] mx-0 py-0 my-0">
              <TabsTrigger value="login" className="bg-funky-purple mx-[5px] px-0 text-gray-50">Login</TabsTrigger>
              <TabsTrigger value="signup" className="mx-[5px] bg-funky-purple text-slate-50">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <LoginForm />
            </TabsContent>
            <TabsContent value="signup">
              <SignUpForm />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>;
};

export default Index;
