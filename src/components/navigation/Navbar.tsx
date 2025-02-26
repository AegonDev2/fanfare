
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Home, User, UserPlus, Settings, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";

interface NavItem {
  id: string;
  title: string;
  path: string;
  icon: string;
  roles: string[];
}

interface NavbarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const iconMap: { [key: string]: any } = {
  Home,
  User,
  UserPlus,
  Settings,
};

const Navbar = ({ isOpen, setIsOpen }: NavbarProps) => {
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    }
    fetchUserInfo();
    fetchNavItems();
  }, [isMobile, setIsOpen]);

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

  const fetchNavItems = async () => {
    const { data, error } = await supabase
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

    // Filter out create-profile if user already has a profile
    if (userId) {
      const { data: existingProfile } = await supabase
        .from("influencer_profiles")
        .select("id")
        .eq("id", userId)
        .maybeSingle();

      const filteredItems = data.filter(item => {
        if (item.path === "/create-profile") {
          return !existingProfile;
        }
        return true;
      });

      setNavItems(filteredItems);
    } else {
      setNavItems(data);
    }
  };

  return (
    <nav
      className={`w-64 rounded-2xl text-[var(--navbar-light-primary)] 
        font-sans overflow-hidden transition-all duration-300 ease-in-out shadow-xl
        bg-[var(--navbar-dark-primary)] h-[calc(100vh-5rem)] my-4`}
    >
      <header className="relative flex items-center min-h-[80px] px-6">
        <h1 className="text-2xl font-semibold">Fan Fare</h1>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 text-[var(--navbar-light-primary)]"
          onClick={() => setIsOpen(false)}
        >
          <X className="h-4 w-4" />
        </Button>
        <hr className="absolute bottom-0 left-6 w-[calc(100%-3rem)] border-t border-[var(--navbar-dark-secondary)]" />
      </header>

      <div className="h-[calc(100%-160px)] overflow-y-auto px-2">
        {navItems.map((item) => {
          if (!userRole || !item.roles.includes(userRole)) return null;
          
          const Icon = iconMap[item.icon];
          const isActive = location.pathname === item.path;
          
          return (
            <div
              key={item.id}
              className={`flex items-center px-4 py-4 cursor-pointer rounded-lg transition-all duration-300 ease-in-out my-2
                ${isActive 
                  ? "text-[var(--navbar-dark-primary)] bg-[var(--background)]" 
                  : "text-[var(--navbar-light-secondary)] hover:bg-[var(--navbar-dark-secondary)]"}`}
              onClick={() => navigate(item.path)}
            >
              {Icon && <Icon className="h-5 w-5 min-w-12 text-center" />}
              <span className="ml-4 truncate">{item.title}</span>
            </div>
          );
        })}
      </div>

      <footer className="absolute bottom-0 left-0 w-full bg-[var(--navbar-dark-secondary)] p-6">
        <div className="flex items-center">
          <div className="relative w-8 h-8 rounded-full overflow-hidden">
            <img
              src="https://storage.googleapis.com/a1aa/image/XZap5acURHVhX1bOw4h9xVM_CSgwW4lMTY9IVmySNr0.jpg"
              alt="Avatar"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="ml-4 flex flex-col">
            <span className="text-sm truncate">{userEmail || "Guest"}</span>
            <span className="text-xs text-[var(--navbar-light-secondary)] capitalize">
              {userRole || "Not logged in"}
            </span>
          </div>
        </div>
      </footer>
    </nav>
  );
};

export default Navbar;
