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
        console.log("Processing auth callback...");
        console.log("Current URL:", window.location.href);
        console.log("Hash:", window.location.hash);
        console.log("Search:", window.location.search);

        // Handle OAuth callback by getting session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Auth callback error:", error);
          toast({
            variant: "destructive",
            title: "Authentication failed",
            description: error.message || "Failed to complete authentication. Please try again."
          });
          navigate("/auth");
          return;
        }

        if (data.session) {
          console.log("Session found:", data.session);
          // Check if user has a profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.session.user.id)
            .single();

          if (!profile) {
            console.log("No profile found, creating one...");
            // Create profile for new Google user
            const { error: profileError } = await supabase
              .from('profiles')
              .insert({
                id: data.session.user.id,
                email: data.session.user.email!,
                name: data.session.user.user_metadata?.full_name || data.session.user.user_metadata?.name || 'User',
                user_type: 'fan' // Default to fan
              });

            if (profileError) {
              console.error("Profile creation error:", profileError);
            }
          }

          toast({
            title: "Success!",
            description: "Successfully authenticated with Google!"
          });
          
          // Redirect to home
          navigate("/");
        } else {
          console.log("No session found");
          // No session, redirect to auth
          navigate("/auth");
        }
      } catch (error) {
        console.error("Callback handling error:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "An error occurred during authentication."
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