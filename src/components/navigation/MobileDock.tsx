
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Gift, User, Search, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileDockProps {
  setNavOpen: (isOpen: boolean) => void;
}

const MobileDock = ({
  setNavOpen
}: MobileDockProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const dockItems = [
    {
      icon: Home,
      label: "Home",
      path: "/"
    }, 
    {
      icon: Search,
      label: "Search",
      path: "/creators"
    }, 
    {
      icon: Gift,
      label: "Gifts",
      path: "/gifts-sent"
    }, 
    {
      icon: User,
      label: "Profile",
      path: "/profile"
    }, 
    {
      icon: Menu,
      label: "Menu",
      action: () => setNavOpen(true)
    }
  ];
  
  const isActive = (path: string) => {
    if (path === "/") return location.pathname === path;
    return location.pathname.startsWith(path);
  };
  
  return (
    <div className="fixed bottom-0 left-0 right-0 md:hidden z-50 backdrop-blur-md border-t border-slate-700/30 bg-slate-950/80 flex justify-around items-center py-1">
      {dockItems.map((item, index) => (
        <div 
          key={index} 
          className={cn(
            "flex flex-col items-center justify-center pt-1 pb-1 px-2 rounded-full transition-all duration-300",
            isActive(item.path) && "bg-funky-purple/20"
          )}
          onClick={item.action ? item.action : () => navigate(item.path)}
        >
          <item.icon className={cn(
            "h-4 w-4 mb-1",
            isActive(item.path) ? "text-funky-purple" : "text-gray-300"
          )} />
          <span className={cn(
            "text-[10px] font-medium", 
            isActive(item.path) ? "text-funky-purple" : "text-gray-300"
          )}>
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
};

export default MobileDock;
