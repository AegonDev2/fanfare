
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

interface NavbarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Navbar = ({ isOpen, setIsOpen }: NavbarProps) => {
  const navigate = useNavigate();
  const { navItems, activeUrl, isLoading, error, user } = useNavigation();
  const { toast } = useToast();
  const [isSigningOut, setIsSigningOut] = useState(false);

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

  if (isLoading) {
    return (
      <nav
        className={cn(
          "fixed top-8 bottom-8 left-8 z-50 flex h-[calc(100%-4rem)] w-64 flex-col rounded-xl bg-[var(--navbar-dark-primary)] shadow-xl transition-all duration-300 ease-in-out",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
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
          "fixed top-8 bottom-8 left-8 z-50 flex h-[calc(100%-4rem)] w-64 flex-col rounded-xl bg-[var(--navbar-dark-primary)] shadow-xl transition-all duration-300 ease-in-out",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
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
        "fixed top-8 bottom-8 left-8 z-50 flex h-[calc(100%-4rem)] w-64 flex-col rounded-xl bg-[var(--navbar-dark-primary)] shadow-xl transition-all duration-300 ease-in-out",
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
    >
      <NavHeader setIsOpen={setIsOpen} />

      <div className="mt-6 flex-1 flex flex-col space-y-1 px-3 overflow-y-auto">
        {navItems && navItems.map((item) => (
          <NavItem
            key={item.id}
            id={item.id}
            icon={item.icon}
            title={item.title}
            path={item.path}
            isActive={activeUrl === item.path}
            onClick={() => handleNavigation(item.path)}
          />
        ))}

        {!user ? (
          <div className="mt-4 px-4 space-y-2">
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
          <Button
            variant="outline"
            className="mt-4 mx-4 bg-transparent border-[var(--navbar-light-secondary)] text-[var(--navbar-light-secondary)] hover:text-[var(--navbar-light-primary)] hover:bg-[var(--navbar-dark-secondary)]"
            onClick={handleSignOut}
            disabled={isSigningOut}
          >
            {isSigningOut ? "Signing out..." : "Sign Out"}
          </Button>
        )}
      </div>

      <div className="mt-auto px-3 py-4 flex items-center justify-between text-[var(--navbar-light-secondary)]">
        <div className="text-xs">FanFare v1.0.0</div>
        {user && <NotificationCenter />}
      </div>

      <NavUser user={user} />
    </nav>
  );
};

export default Navbar;
