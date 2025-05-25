
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Gift, User, Search, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/hooks/useUser";

interface MobileDockProps {
  setNavOpen: (isOpen: boolean) => void;
}

const MobileDock = ({ setNavOpen }: MobileDockProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();
  
  // Only show the mobile dock on pages other than landing
  const showMobileDock = location.pathname !== "/";
  
  if (!showMobileDock) {
    return null;
  }
  
  const dockItems = [
    {
      icon: Home,
      label: "Home",
      path: "/",
      action: () => navigate("/")
    }, 
    {
      icon: Search,
      label: "Search",
      path: "/gift-selection",
      action: () => navigate("/gift-selection")
    }, 
    {
      icon: Gift,
      label: "Gifts",
      path: user?.user_type === "influencer" ? "/wishlist" : "/gifts-sent",
      action: () => navigate(user?.user_type === "influencer" ? "/wishlist" : "/gifts-sent")
    }, 
    {
      icon: User,
      label: "Profile",
      path: user ? `/profile/${user.id}` : "/auth",
      action: () => navigate(user ? `/profile/${user.id}` : "/auth")
    }, 
    {
      icon: Menu,
      label: "Menu",
      path: "/settings",
      action: () => setNavOpen(true)
    }
  ];
  
  const isActive = (path: string) => {
    if (path === "/") return location.pathname === path;
    return location.pathname.startsWith(path);
  };
  
  return (
    <div className="fixed bottom-0 left-0 right-0 md:hidden z-50 backdrop-blur-md border-t border-slate-700/30 bg-slate-950/80 flex justify-around items-center py-[8px] my-0 px-0">
      {dockItems.map((item, index) => (
        <div 
          key={index} 
          className={cn(
            "flex flex-col items-center justify-center pt-1 pb-1 px-2 rounded-full transition-all duration-300 cursor-pointer", 
            isActive(item.path) && "bg-funky-purple/20"
          )} 
          onClick={item.action}
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
