
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSecurityManager } from "@/utils/securityManager";

export const useAdminAuth = () => {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { verifyAdminWithFeedback } = useSecurityManager();

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        setIsLoading(true);
        
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error("Auth error:", userError);
          navigate('/auth');
          return;
        }

        if (!user) {
          console.log("No user found, redirecting to auth");
          navigate('/auth');
          return;
        }

        console.log("Current user:", user.id, user.email);

        // Use the enhanced security manager for admin verification
        const isAdmin = await verifyAdminWithFeedback();
        
        if (isAdmin) {
          console.log("Admin access verified via security manager");
          setUserRole('admin');
        } else {
          console.log("Admin access denied");
          navigate('/');
          return;
        }
      } catch (error) {
        console.error("Admin auth check error:", error);
        toast({
          title: "Authentication Error",
          description: "Please login again.",
          variant: "destructive"
        });
        navigate('/auth');
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminAccess();
  }, [navigate, toast, verifyAdminWithFeedback]);

  return { userRole, isLoading };
};
