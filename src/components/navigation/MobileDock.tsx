
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Gift, User, Search, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface MobileDockProps {
  setNavOpen: (isOpen: boolean) => void;
}

const MobileDock = ({
  setNavOpen
}: MobileDockProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const dockItems = [{
    icon: Home,
    label: "Home",
    path: "/"
  }, {
    icon: Search,
    label: "Search",
    path: "/creators"
  }, {
    icon: Gift,
    label: "Gifts",
    path: "/gifts-sent"
  }, {
    icon: User,
    label: "Profile",
    path: "/profile"
  }, {
    icon: Menu,
    label: "Menu",
    action: () => setNavOpen(true)
  }];
  
  const isActive = (path: string) => {
    if (path === "/") return location.pathname === path;
    return location.pathname.startsWith(path);
  };
  
  return (
    <div className="mobile-dock md:hidden z-50 bg-slate-900/95">
      {dockItems.map((item, index) => (
        <div 
          key={index} 
          className={cn("dock-item", isActive(item.path) && "dock-item-active")} 
          onClick={item.action ? item.action : () => navigate(item.path)}
        >
          <item.icon 
            className={cn(
              "h-6 w-6 mb-1", 
              isActive(item.path) ? "text-funky-purple" : "text-gray-400 dark:text-gray-300"
            )} 
          />
          <span 
            className={cn(
              "text-xs font-medium", 
              isActive(item.path) ? "text-funky-purple" : "text-gray-400 dark:text-gray-300"
            )}
          >
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
};

export default MobileDock;
