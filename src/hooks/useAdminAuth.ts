
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useAdminAuth = () => {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

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

        // Special case for hardcoded admin user
        if (user.id === "724ce941-97c5-4b7d-b0ba-7ee9bd1df237" || user.email === 'admin@fanfare.com') {
          console.log("Hardcoded admin user detected");
          setUserRole('admin');
          setIsLoading(false);
          return;
        }

        // Check admin role from database using the security definer function
        const { data: isAdminResult, error: adminError } = await supabase
          .rpc('is_admin', { user_uuid: user.id });

        if (adminError) {
          console.error("Error checking admin role:", adminError);
          // Fallback: check user_roles table directly
          const { data: roles, error: rolesError } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .eq('role', 'admin');

          if (rolesError) {
            console.error("Error checking roles table:", rolesError);
            toast({
              title: "Access Denied",
              description: "Unable to verify admin permissions.",
              variant: "destructive"
            });
            navigate('/');
            return;
          }

          if (!roles || roles.length === 0) {
            toast({
              title: "Access Denied",
              description: "You don't have admin permissions.",
              variant: "destructive"
            });
            navigate('/');
            return;
          }

          setUserRole('admin');
        } else {
          if (isAdminResult) {
            console.log("User is admin via database function");
            setUserRole('admin');
          } else {
            console.log("User is not admin");
            toast({
              title: "Access Denied",
              description: "You don't have admin permissions.",
              variant: "destructive"
            });
            navigate('/');
            return;
          }
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
  }, [navigate, toast]);

  return { userRole, isLoading };
};
