
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
        // Get user email
        setUserEmail(user.email);

        // Get user role from user_roles table
        const { data: roleData, error: roleError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .single();

        if (roleError) {
          console.error("Error fetching user role:", roleError);
          return;
        }

        if (roleData) {
          setUserRole(roleData.role);
        }
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
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

    setNavItems(data);
  };

  return (
    <nav
      id="nav-bar"
      className={`fixed top-4 left-4 flex flex-col bg-[var(--navbar-dark-primary)] rounded-2xl text-[var(--navbar-light-primary)] font-sans overflow-hidden select-none transition-all duration-300 shadow-xl h-[calc(100vh-2rem)] animate-scale-in ${
        isMobile ? 'z-50' : ''
      }`}
      style={{
        width: "var(--navbar-width)",
      }}
    >
      <header
        id="nav-header"
        className="relative flex items-center min-h-[80px] pl-4"
      >
        <h1 id="nav-title" className="text-2xl">Fan Fare</h1>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 text-[var(--navbar-light-primary)]"
          onClick={() => setIsOpen(false)}
        >
          <X className="h-4 w-4" />
        </Button>
        <hr className="absolute bottom-0 left-4 w-[calc(100%-2rem)] border-t border-[var(--navbar-dark-secondary)]" />
      </header>

      <div
        id="nav-content"
        className="relative flex-1 overflow-x-hidden overflow-y-auto"
        style={{
          width: "var(--navbar-width)",
        }}
      >
        {navItems.map((item) => {
          if (!userRole || !item.roles.includes(userRole)) return null;
          
          const Icon = iconMap[item.icon];
          const isActive = location.pathname === item.path;
          
          return (
            <div
              key={item.id}
              className={`nav-button flex items-center px-4 py-4 cursor-pointer transition-colors duration-200 ${
                isActive 
                  ? "text-[var(--navbar-dark-primary)] bg-[var(--background)]" 
                  : "text-[var(--navbar-light-secondary)] hover:bg-[var(--navbar-dark-secondary)]"
              }`}
              onClick={() => navigate(item.path)}
            >
              {Icon && <Icon className="h-5 w-5 min-w-12 text-center" />}
              <span className="ml-4 truncate">{item.title}</span>
            </div>
          );
        })}
      </div>

      <footer
        id="nav-footer"
        className="relative w-full bg-[var(--navbar-dark-secondary)] rounded-2xl z-10 p-4"
      >
        <div className="flex items-center">
          <div
            id="nav-footer-avatar"
            className="relative w-8 h-8 rounded-full overflow-hidden"
          >
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
