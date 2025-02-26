
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface NavItem {
  id: string;
  title: string;
  path: string;
  icon: string;
  roles: string[];
}

export const useNavigation = () => {
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();
  const location = useLocation();

  const fetchUserInfo = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email);
        setUserId(user.id);

        const { data: roleData, error: roleError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .maybeSingle();

        if (roleError) {
          console.error("Error fetching user role:", roleError);
          toast({
            title: "Error",
            description: "Failed to load user role",
            variant: "destructive",
          });
          return;
        }

        if (roleData) {
          setUserRole(roleData.role);
        } else {
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("user_type")
            .eq("id", user.id)
            .maybeSingle();

          if (!profileError && profile) {
            setUserRole(profile.user_type);
          }
        }

        fetchNavItems(user.id);
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
      toast({
        title: "Error",
        description: "Failed to load user information",
        variant: "destructive",
      });
    }
  };

  const fetchNavItems = async (currentUserId: string) => {
    const { data: navData, error } = await supabase
      .from("navigation_items")
      .select("*")
      .order("order_index");

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load navigation items",
        variant: "destructive",
      });
      return;
    }

    const { data: existingProfile } = await supabase
      .from("influencer_profiles")
      .select("id")
      .eq("id", currentUserId)
      .maybeSingle();

    const processedItems = navData.filter(item => {
      if (existingProfile) {
        if (item.title === "Create Profile") {
          return false;
        }
        if (item.title === "Profile") {
          item.path = `/profile/${currentUserId}`;
          return true;
        }
      } else {
        if (item.title === "Profile") {
          return false;
        }
        if (item.title === "Create Profile") {
          return true;
        }
      }
      return true;
    });

    setNavItems(processedItems);
  };

  const isActiveRoute = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    if (path.startsWith('/profile/')) {
      return location.pathname.startsWith('/profile/');
    }
    return location.pathname === path;
  };

  useEffect(() => {
    fetchUserInfo();
  }, []);

  return {
    navItems,
    userRole,
    userEmail,
    isActiveRoute,
  };
};
