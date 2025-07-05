import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoginForm from "@/components/auth/LoginForm";
import SignUpForm from "@/components/auth/SignUpForm";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import UpdatePasswordForm from "@/components/auth/UpdatePasswordForm";
import PasswordResetForm from "@/components/auth/PasswordResetForm";
const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPasswordUpdate, setShowPasswordUpdate] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("login");
  useEffect(() => {
    // Check for password reset flow or tab selection from URL
    const checkFlow = async () => {
      // Parse the hash parameters properly
      const hashParams = new URLSearchParams(location.hash.substring(1));

      // Check for recovery type in hash or type parameter
      const type = hashParams.get("type");
      const hasAccessToken = hashParams.has("access_token");
      console.log("Auth flow type:", type);
      console.log("Current URL hash:", location.hash);
      console.log("Has access token:", hasAccessToken);

      // If this is a recovery action with access token, show password update form
      if (type === "recovery" || hasAccessToken && location.hash.includes("type=recovery")) {
        setShowPasswordUpdate(true);
      }

      // Check for tab param in the URL
      const urlParams = new URLSearchParams(location.search);
      const tabParam = urlParams.get("tab");
      if (tabParam === "signup") {
        setActiveTab("signup");
      } else if (tabParam === "reset") {
        setShowPasswordReset(true);
      }
    };

    // Check for existing session
    const checkSession = async () => {
      const {
        data
      } = await supabase.auth.getSession();
      if (data.session) {
        // User is already logged in, redirect to home
        navigate("/");
      }
    };
    checkFlow();
    checkSession();
  }, [location, navigate]);
  const togglePasswordReset = () => {
    setShowPasswordReset(!showPasswordReset);
    setShowPasswordUpdate(false);
  };
  return <div className="min-h-screen p-4 bg-slate-50">
      <div className="max-w-md mx-auto pt-8">
        <Card className="p-6 bg-slate-50">
          <Button variant="ghost" className="mb-4" onClick={() => navigate("/")}>
            ← Back to Home
          </Button>
          <h1 className="text-3xl font-bold mb-4 text-center">GiftLoop Connect</h1>
          <p className="text-muted-foreground mb-6 text-center">
            Connect with your favorite influencers and share meaningful gifts.
          </p>
          
          {showPasswordUpdate ? <div className="space-y-4">
              <h2 className="text-xl font-semibold text-center">Update Your Password</h2>
              <UpdatePasswordForm />
            </div> : showPasswordReset ? <div className="space-y-4">
              <h2 className="text-xl font-semibold text-center">Reset Your Password</h2>
              <PasswordResetForm />
              <Button variant="link" className="w-full mt-2" onClick={togglePasswordReset}>
                Back to Login
              </Button>
            </div> : <Tabs defaultValue={activeTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4 bg-slate-50 rounded-sm py-0 my-[3px] mx-[3px] px-px">
                <TabsTrigger value="login" className="bg-funky-purple text-slate-50 my-0 py-0 px-0 mx-[4px]">Login</TabsTrigger>
                <TabsTrigger value="signup" className="bg-funky-purple text-slate-50 mx-[4px] py-0 my-0">Sign Up</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <LoginForm onForgotPassword={togglePasswordReset} />
              </TabsContent>
              <TabsContent value="signup">
                <SignUpForm />
              </TabsContent>
            </Tabs>}
        </Card>
      </div>
    </div>;
};
export default Auth;