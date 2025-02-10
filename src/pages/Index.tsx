
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoginForm from "@/components/auth/LoginForm";
import SignUpForm from "@/components/auth/SignUpForm";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("user_type")
        .eq("id", session.user.id)
        .maybeSingle();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        return;
      }

      if (profile?.user_type === "influencer") {
        const { data: influencerProfile, error: influencerError } = await supabase
          .from("influencer_profiles")
          .select("id")
          .eq("id", session.user.id)
          .maybeSingle();

        if (influencerError) {
          console.error("Error fetching influencer profile:", influencerError);
          return;
        }

        if (!influencerProfile) {
          navigate("/create-profile");
          return;
        }
      }
    }
  };

  return (
    <div className="min-h-screen p-4 bg-background">
      <div className="max-w-md mx-auto pt-8">
        <Card className="p-6">
          <h1 className="text-3xl font-bold mb-4 text-center">GiftLoop Connect</h1>
          <p className="text-muted-foreground mb-6 text-center">
            Connect with your favorite influencers and share meaningful gifts.
          </p>
          
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
        </Card>
      </div>
    </div>
  );
};

export default Index;
