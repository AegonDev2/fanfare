import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import NavHeader from "./NavHeader";
import NavItem from "./NavItem";
import NavUser from "./NavUser";
import { useNavigation } from "./useNavigation";
import NotificationCenter from "@/components/notifications/NotificationCenter";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

interface NavbarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Navbar = ({ isOpen, setIsOpen }: NavbarProps) => {
  const navigate = useNavigate();
  const { navItems, activeUrl, isLoading, error, user } = useNavigation();
  const { toast } = useToast();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const isMobile = useIsMobile();

  const handleCloseNav = () => {
    setIsOpen(false);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    handleCloseNav();
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account",
      });
      
      navigate("/");
      handleCloseNav();
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Sign out failed",
        description: "There was a problem signing you out. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSigningOut(false);
    }
  };

  const navPosition = isMobile 
    ? "top-0 left-0 right-0 h-screen max-h-screen w-full overflow-hidden" 
    : "top-0 left-0 h-screen w-[280px] overflow-hidden";

  const navOpenStyle = isOpen ? `
    transform-none opacity-100 visible
  ` : isMobile ? `
    opacity-0 invisible transform -translate-y-full
  ` : `
    opacity-0 invisible transform -translate-x-full
  `;

  const contentStyle = isOpen ? `
    transform-origin-center scale-100 opacity-100
  ` : `
    transform-origin-center scale-[0.85] opacity-0
  `;

  if (isLoading) {
    return (
      <nav
        className={cn(
          "fixed z-50 flex flex-col bg-[var(--navbar-dark-primary)] shadow-xl transition-all duration-300 ease-in-out",
          navPosition,
          navOpenStyle
        )}
        style={{ 
          transition: "all 0.3s ease-in",
        }}
      >
        <div className="flex justify-center items-center h-full">
          <div className="text-[var(--navbar-light-primary)]">Loading navigation...</div>
        </div>
      </nav>
    );
  }

  if (error) {
    console.error("Navigation error:", error);
    return (
      <nav
        className={cn(
          "fixed z-50 flex flex-col bg-[var(--navbar-dark-primary)] shadow-xl transition-all duration-300 ease-in-out",
          navPosition,
          navOpenStyle
        )}
        style={{ 
          transition: "all 0.3s ease-in",
        }}
      >
        <div className="flex justify-center items-center h-full">
          <div className="text-red-500">
            Error loading navigation. Please try again.
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav
      className={cn(
        "fixed z-50 flex flex-col bg-[var(--navbar-dark-primary)] shadow-xl",
        navPosition,
        navOpenStyle
      )}
      style={{ 
        transition: "all 0.3s ease-in",
      }}
    >
      <NavHeader setIsOpen={setIsOpen} />

      <div 
        className={cn(
          "mt-4 flex-1 flex flex-col space-y-1 px-3 overflow-y-auto transition-all duration-300",
          contentStyle
        )}
        style={{ 
          transition: "all 0.3s ease-in",
        }}
      >
        {navItems && navItems.map((item, index) => (
          <div 
            key={item.id}
            className={cn(
              "transition-all duration-300",
              isOpen 
                ? `opacity-100 translate-x-0 translate-y-0` 
                : isMobile 
                  ? `opacity-0 translate-y-8` 
                  : `opacity-0 translate-x-8`
            )}
            style={{ 
              transitionDelay: `${isOpen ? index * 50 : 0}ms`,
              width: isOpen ? "100%" : "0",
              marginLeft: isOpen ? "0" : (index * -40) + "px"
            }}
          >
            <NavItem
              id={item.id}
              icon={item.icon}
              title={item.title}
              path={item.path}
              isActive={activeUrl === item.path}
              onClick={() => handleNavigation(item.path)}
            />
          </div>
        ))}

        {!user ? (
          <div 
            className={cn(
              "mt-4 px-4 space-y-2 transition-all duration-300",
              isOpen 
                ? `opacity-100 translate-x-0 translate-y-0`  
                : isMobile 
                  ? `opacity-0 translate-y-8` 
                  : `opacity-0 translate-x-8`
            )}
            style={{ 
              transitionDelay: `${isOpen ? (navItems?.length || 0) * 50 + 50 : 0}ms`,
              width: isOpen ? "100%" : "0"
            }}
          >
            <Button
              variant="outline"
              className="w-full bg-transparent border-[var(--navbar-light-secondary)] text-[var(--navbar-light-secondary)] hover:text-[var(--navbar-light-primary)] hover:bg-[var(--navbar-dark-secondary)]"
              onClick={() => handleNavigation("/auth")}
            >
              Sign In
            </Button>
            <Button
              className="w-full bg-[var(--navbar-light-primary)] text-[var(--navbar-dark-primary)]"
              onClick={() => handleNavigation("/auth?tab=signup")}
            >
              Join Now
            </Button>
          </div>
        ) : (
          <div
            className={cn(
              "transition-all duration-300",
              isOpen 
                ? `opacity-100 translate-x-0 translate-y-0` 
                : isMobile 
                  ? `opacity-0 translate-y-8` 
                  : `opacity-0 translate-x-8`
            )}
            style={{ 
              transitionDelay: `${isOpen ? (navItems?.length || 0) * 50 + 50 : 0}ms`,
              width: isOpen ? "100%" : "0"
            }}
          >
            <Button
              variant="outline"
              className="mt-4 mx-4 w-[calc(100%-2rem)] bg-transparent border-[var(--navbar-light-secondary)] text-[var(--navbar-light-secondary)] hover:text-[var(--navbar-light-primary)] hover:bg-[var(--navbar-dark-secondary)]"
              onClick={handleSignOut}
              disabled={isSigningOut}
            >
              {isSigningOut ? "Signing out..." : "Sign Out"}
            </Button>
          </div>
        )}
      </div>

      <div 
        className={cn(
          "mt-auto px-3 py-4 flex items-center justify-between text-[var(--navbar-light-secondary)] transition-all duration-300",
          isOpen 
            ? `opacity-100 translate-y-0` 
            : `opacity-0 translate-y-4`
        )}
        style={{ 
          transitionDelay: `${isOpen ? (navItems?.length || 0) * 50 + 100 : 0}ms` 
        }}
      >
        <div className="text-xs">FanFare v1.0.0</div>
        {user && <NotificationCenter />}
      </div>

      <div 
        className={cn(
          "transition-all duration-300",
          isOpen 
            ? `opacity-100 translate-y-0` 
            : `opacity-0 translate-y-4`
        )}
        style={{ 
          transitionDelay: `${isOpen ? (navItems?.length || 0) * 50 + 150 : 0}ms` 
        }}
      >
        <NavUser user={user} />
      </div>
    </nav>
  );
};

export default Navbar;
