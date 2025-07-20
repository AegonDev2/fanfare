import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the session from the URL hash
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Auth callback error:", error);
          toast({
            variant: "destructive",
            title: "Verification failed",
            description: "Failed to verify your email. Please try again."
          });
          navigate("/auth");
          return;
        }

        if (data.session) {
          // User is verified and logged in
          toast({
            title: "Email verified!",
            description: "Welcome to FanFare! Your account has been verified successfully."
          });
          
          // Redirect to dashboard/home
          navigate("/");
        } else {
          // No session, redirect to auth
          navigate("/auth");
        }
      } catch (error) {
        console.error("Callback handling error:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "An error occurred during verification."
        });
        navigate("/auth");
      }
    };

    handleAuthCallback();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-funky-purple mx-auto mb-4"></div>
        <p className="text-gray-600">Verifying your email...</p>
      </div>
    </div>
  );
};

export default AuthCallback;