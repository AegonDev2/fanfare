
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, Home, Gift, User, Search, Settings, Wallet, Trophy, Bell, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useUser } from "@/hooks/useUser";

interface NavbarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Navbar = ({ isOpen, setIsOpen }: NavbarProps) => {
  const navigate = useNavigate();
  const { user } = useUser();

  // Close navbar when clicking outside
  useEffect(() => {
    if (isOpen) {
      const handleClickOutside = (event: MouseEvent) => {
        const navbar = document.getElementById('navbar');
        if (navbar && !navbar.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };
      
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, setIsOpen]);

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const navItems = [
    {
      icon: Home,
      label: "Home",
      path: "/",
      action: () => handleNavigation("/")
    },
    {
      icon: Search,
      label: "Browse Gifts",
      path: "/gift-selection", 
      action: () => handleNavigation("/gift-selection")
    },
    {
      icon: Gift,
      label: user?.user_type === "influencer" ? "My Wishlist" : "Gifts Sent",
      path: user?.user_type === "influencer" ? `/wishlist/${user?.id}` : "/gifts-sent",
      action: () => handleNavigation(user?.user_type === "influencer" ? `/wishlist/${user?.id}` : "/gifts-sent")
    },
    ...(user?.user_type === "influencer" ? [{
      icon: Heart,
      label: "Gift Requests",
      path: "/gift-requests",
      action: () => handleNavigation("/gift-requests")
    }] : []),
    {
      icon: Trophy,
      label: "Leaderboard",
      path: "/leaderboard",
      action: () => handleNavigation("/leaderboard")
    },
    {
      icon: User,
      label: "Profile",
      path: `/profile/${user?.id || ''}`,
      action: () => handleNavigation(`/profile/${user?.id || ''}`)
    },
    {
      icon: Wallet,
      label: "Wallet",
      path: "/wallet",
      action: () => handleNavigation("/wallet")
    },
    {
      icon: Settings,
      label: "Settings",
      path: "/settings",
      action: () => handleNavigation("/settings")
    }
  ];

  return (
    <>
      {/* Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/50 z-40 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsOpen(false)}
      />
      
      {/* Navbar */}
      <nav
        id="navbar"
        className={cn(
          "fixed top-0 left-0 h-full w-80 bg-white dark:bg-gray-900 shadow-xl z-50 transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-funky-purple to-funky-pink bg-clip-text text-transparent">
              FanFare
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* User Info */}
          {user && (
            <div className="mb-6 p-4 bg-gradient-to-r from-funky-purple/10 to-funky-pink/10 rounded-lg">
              <p className="font-semibold text-gray-900 dark:text-white">
                Welcome back!
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {user.email}
              </p>
            </div>
          )}

          {/* Navigation Items */}
          <div className="space-y-2">
            {navItems.map((item, index) => (
              <Button
                key={index}
                variant="ghost"
                className="w-full justify-start text-left p-3 h-auto hover:bg-funky-purple/10 hover:text-funky-purple"
                onClick={item.action}
              >
                <item.icon className="h-5 w-5 mr-3" />
                <span>{item.label}</span>
              </Button>
            ))}
          </div>

          <Separator className="my-6" />

          {/* Additional Actions */}
          {!user && (
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleNavigation("/auth")}
              >
                Sign In
              </Button>
              <Button
                className="w-full bg-gradient-to-r from-funky-purple to-funky-pink text-white"
                onClick={() => handleNavigation("/auth?tab=signup")}
              >
                Join Now
              </Button>
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
