
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import NavHeader from "./NavHeader";
import NavItem from "./NavItem";
import NavUser from "./NavUser";
import { useNavigation } from "./useNavigation";
import NotificationCenter from "@/components/notifications/NotificationCenter";

interface NavbarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Navbar = ({ isOpen, setIsOpen }: NavbarProps) => {
  const { navItems, activeUrl, isLoading, error } = useNavigation();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };

    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleCloseNav = () => {
    setIsOpen(false);
  };

  if (isLoading) {
    return <div>Loading navigation...</div>;
  }

  if (error) {
    console.error("Navigation error:", error);
    return (
      <div className="text-red-500">
        Error loading navigation. Please try again.
      </div>
    );
  }

  return (
    <nav
      className={cn(
        "fixed top-8 bottom-8 left-8 z-50 flex h-[calc(100%-4rem)] w-64 flex-col rounded-xl bg-white shadow-xl transition-all duration-300 ease-in-out",
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
    >
      <div className="flex justify-between items-center p-4">
        <NavHeader />
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCloseNav}
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <NavUser user={user} />

      <div className="mt-2 flex flex-col space-y-1 px-3">
        {navItems && navItems.map((item) => (
          <NavItem
            key={item.id}
            icon={item.icon}
            title={item.title}
            path={item.path}
            isActive={activeUrl === item.path}
            onClick={handleCloseNav}
          />
        ))}
      </div>

      <div className="mt-auto px-3 py-4 flex items-center justify-between">
        <div className="text-xs text-gray-500">FanFare v1.0.0</div>
        {user && <NotificationCenter />}
      </div>
    </nav>
  );
};

export default Navbar;
