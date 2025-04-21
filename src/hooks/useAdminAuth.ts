
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { hasRole } from "@/utils/roleManager";

export const useAdminAuth = () => {
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/auth');
          return;
        }
        const isAdmin = await hasRole(user.id, 'admin');
        if (!isAdmin) {
          toast({
            title: "Access Denied",
            description: "You don't have permission to view this page.",
            variant: "destructive"
          });
          navigate('/');
          return;
        }
        setUserRole('admin');
      } catch (error) {
        console.error("Authentication error:", error);
        toast({
          title: "Authentication Error",
          description: "Please login again.",
          variant: "destructive"
        });
        navigate('/auth');
      }
    };

    checkAdminAccess();
    // only run on mount
    // eslint-disable-next-line
  }, []);

  return { userRole };
};
