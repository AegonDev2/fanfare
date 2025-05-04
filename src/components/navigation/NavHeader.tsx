
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface NavHeaderProps {
  setIsOpen?: (isOpen: boolean) => void;
}

const NavHeader = ({
  setIsOpen
}: NavHeaderProps) => {
  const isMobile = useIsMobile();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  
  useEffect(() => {
    // Check user authentication status, role, and name
    const checkUserRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setUserRole(null);
          setUserName(null);
          return;
        }
        
        // Get user profile to fetch name
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('name, user_type')
          .eq('id', user.id)
          .single();
        
        if (profileError) {
          console.error("Error fetching user profile:", profileError);
          return;
        }
        
        if (profile) {
          setUserName(profile.name || null);
        }
        
        // Check if user has admin role
        const { data: roles, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);
        
        if (!error && roles && roles.length > 0) {
          const isAdmin = roles.some(r => r.role === 'admin');
          setUserRole(isAdmin ? 'admin' : profile?.user_type || 'user');
        } else {
          setUserRole(profile?.user_type || 'user');
        }
      } catch (error) {
        console.error("Error checking user role:", error);
        setUserRole(null);
        setUserName(null);
      }
    };
    
    checkUserRole();
  }, []);
  
  const handleClose = () => {
    if (setIsOpen) {
      // Use a timeout to prevent any race conditions
      setTimeout(() => {
        setIsOpen(false);
      }, 0);
    }
  };
  
  return (
    <header className="relative flex items-center justify-between min-h-[80px] px-6 text-[var(--navbar-light-primary)]">
      <h1 className="text-2xl font-graffiti bg-clip-text text-transparent bg-gradient-to-r from-funky-purple to-funky-pink">FanFare</h1>
      
      {setIsOpen && (
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-[var(--navbar-light-primary)] hover:bg-[var(--navbar-dark-secondary)]" 
          onClick={handleClose}
          aria-label="Close navigation"
        >
          <X className="h-5 w-5" />
        </Button>
      )}
      
      {userRole === 'admin' && (
        <div className="hidden md:block">
          <span className="px-2 py-1 bg-funky-purple/20 text-funky-purple text-xs rounded-md">Admin</span>
        </div>
      )}
      
      <hr className={cn(
        "absolute bottom-0 left-6",
        isMobile ? 'w-[calc(100%-3rem)]' : 'w-[calc(100%-3rem)]',
        "border-t border-[var(--navbar-dark-secondary)]"
      )} />
    </header>
  );
};

export default NavHeader;
