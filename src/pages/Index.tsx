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
        const {
          data: profile,
          error: profileError
        } = await supabase.from("profiles").select("user_type").eq("id", session.user.id).maybeSingle();
        if (profileError) {
          console.error("Error fetching profile:", profileError);
          return;
        }

        // If no profile exists, don't show the create profile option
        if (!profile) {
          console.log("No profile found for user");
          setIsLoading(false);
          return;
        }
        const isUserInfluencer = profile?.user_type === "influencer";
        setIsInfluencer(isUserInfluencer);
        if (isUserInfluencer) {
          const {
            data: influencerProfile,
            error: influencerError
          } = await supabase.from("influencer_profiles").select("id").eq("id", session.user.id).maybeSingle();
          if (influencerError) {
            console.error("Error fetching influencer profile:", influencerError);
            return;
          }
          setHasProfile(!!influencerProfile);
          if (!influencerProfile) {
            console.log("No influencer profile found, showing create profile option");
          }
        }
      }
    } catch (error) {
      console.error("Error in checkUser:", error);
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
        {isInfluencer && !hasProfile ? <Card className="p-6">
            <h1 className="text-3xl font-bold mb-4 text-center">Welcome Influencer!</h1>
            <p className="text-muted-foreground mb-6 text-center">
              Create your profile to get started with GiftLoop Connect.
            </p>
            <Button className="w-full" onClick={() => navigate("/create-profile")}>
              Create Profile
            </Button>
          </Card> : <Card className="p-6 bg-slate-50">
            <h1 className="text-3xl font-bold mb-4 text-center">GiftLoop Connect</h1>
            <p className="mb-6 text-center text-funky-purple">
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
          </Card>}
      </div>
    </div>;
};
export default Index;