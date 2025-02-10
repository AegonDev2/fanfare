
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Home, User, UserPlus, Settings } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface NavItem {
  id: string;
  title: string;
  path: string;
  icon: string;
  roles: string[];
}

const iconMap: { [key: string]: any } = {
  Home,
  User,
  UserPlus,
  Settings,
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    fetchUserRole();
    fetchNavItems();
  }, []);

  const fetchUserRole = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_type")
        .eq("id", user.id)
        .single();
      
      if (profile) {
        setUserRole(profile.user_type);
      }
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
      className="flex flex-col fixed left-4 top-4 h-[calc(100%-2rem)] bg-[var(--navbar-dark-primary)] rounded-2xl text-[var(--navbar-light-primary)] font-sans overflow-hidden select-none"
      style={{
        width: isOpen ? "var(--navbar-width)" : "var(--navbar-width-min)",
      }}
    >
      <input
        type="checkbox"
        id="nav-toggle"
        className="hidden"
        checked={!isOpen}
        onChange={(e) => setIsOpen(!e.target.checked)}
      />

      <header
        id="nav-header"
        className="relative flex items-center min-h-[80px] pl-4"
      >
        {isOpen && <h1 id="nav-title" className="text-2xl">Fan Fare</h1>}
        <label
          htmlFor="nav-toggle"
          className="absolute right-0 w-12 h-full flex items-center justify-center cursor-pointer"
        >
          <div id="nav-toggle-burger" className="relative w-4 h-0.5 bg-[var(--navbar-dark-primary)]" />
        </label>
        <hr className="absolute bottom-0 left-4 w-[calc(100%-2rem)] border-t border-[var(--navbar-dark-secondary)]" />
      </header>

      <div
        id="nav-content"
        className="relative flex-1 overflow-x-hidden overflow-y-auto"
        style={{
          width: isOpen ? "var(--navbar-width)" : "var(--navbar-width-min)",
        }}
      >
        {navItems.map((item) => {
          if (!userRole || !item.roles.includes(userRole)) return null;
          
          const Icon = iconMap[item.icon];
          const isActive = location.pathname === item.path;
          
          return (
            <div
              key={item.id}
              className={`nav-button ${isActive ? "text-[var(--navbar-dark-primary)]" : "text-[var(--navbar-light-secondary)]"}`}
              onClick={() => navigate(item.path)}
            >
              {Icon && <Icon className="min-w-12 text-center" />}
              {isOpen && <span className="ml-4">{item.title}</span>}
            </div>
          );
        })}
        <div
          id="nav-content-highlight"
          className="absolute left-4 w-[calc(100%-1rem)] h-[54px] bg-[var(--background)] rounded-l-2xl transition-all duration-200"
          style={{
            top: `${navItems.findIndex(item => item.path === location.pathname) * 54 + 16}px`,
          }}
        />
      </div>

      <footer
        id="nav-footer"
        className="relative w-full h-[54px] bg-[var(--navbar-dark-secondary)] rounded-2xl z-10"
      >
        <div className="relative w-full h-[54px] flex items-center">
          <div
            id="nav-footer-avatar"
            className="relative ml-4 w-8 h-8 rounded-full overflow-hidden transition-transform duration-200"
            style={{
              left: isOpen ? "0" : "50%",
              transform: isOpen ? "none" : "translateX(-50%)",
            }}
          >
            <img
              src="https://storage.googleapis.com/a1aa/image/XZap5acURHVhX1bOw4h9xVM_CSgwW4lMTY9IVmySNr0.jpg"
              alt="Avatar"
              className="h-full w-full object-cover"
            />
          </div>
          {isOpen && (
            <div className="ml-4 flex flex-col">
              <span className="text-sm">User Profile</span>
              <span className="text-xs text-[var(--navbar-light-secondary)]">
                {userRole || "Guest"}
              </span>
            </div>
          )}
        </div>
      </footer>
    </nav>
  );
};

export default Navbar;
