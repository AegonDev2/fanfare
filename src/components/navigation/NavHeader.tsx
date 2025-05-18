import { Button } from "@/components/ui/button";
import { X, Trophy, User } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
interface NavHeaderProps {
  setIsOpen?: (isOpen: boolean) => void;
}
const NavHeader = ({
  setIsOpen
}: NavHeaderProps) => {
  const isMobile = useIsMobile();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    // Check user authentication status, role, and name
    const checkUserRole = async () => {
      try {
        setIsLoading(true);
        const {
          data: {
            user
          },
          error: userError
        } = await supabase.auth.getUser();
        if (userError) {
          console.error("Error fetching user:", userError);
          return;
        }
        if (!user) {
          setUserRole(null);
          setUserName(null);
          setUserId(null);
          return;
        }
        setUserId(user.id);

        // Get user profile to fetch name
        const {
          data: profile,
          error: profileError
        } = await supabase.from('profiles').select('name, user_type').eq('id', user.id).maybeSingle();
        if (profileError) {
          console.error("Error fetching user profile:", profileError);
          return;
        }
        if (profile) {
          setUserName(profile.name || null);
        }

        // Check if user has admin role
        const {
          data: roles,
          error: rolesError
        } = await supabase.from('user_roles').select('role').eq('user_id', user.id);
        if (rolesError) {
          console.error("Error fetching user roles:", rolesError);
          return;
        }
        if (roles && roles.length > 0) {
          const isAdmin = roles.some(r => r.role === 'admin');
          setUserRole(isAdmin ? 'admin' : profile?.user_type || 'user');
        } else {
          setUserRole(profile?.user_type || 'user');
        }
      } catch (error: any) {
        console.error("Error checking user role:", error);
        useToast().toast({
          title: "Error",
          description: "Failed to verify user permissions",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
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
  return <header className="relative flex items-center justify-between h-16 px-4 sm:px-6 bg-gradient-to-r from-funky-purple/10 to-funky-pink/10 backdrop-blur-sm">
      <h1 className="font-graffiti bg-clip-text bg-gradient-to-r from-funky-purple to-funky-pink text-xl sm:text-2xl font-medium drop-shadow-sm text-slate-50">
        FanFare
      </h1>
      
      {setIsOpen && <Button variant="ghost" size="icon" onClick={handleClose} aria-label="Close navigation" className="text-funky-purple hover:bg-funky-purple/10 hover:text-funky-pink transition-colors">
          <X className="h-4 w-4" />
        </Button>}
      
      <div className="hidden md:flex gap-3 items-center">
        {!isLoading && userRole === 'admin' && <span className="px-2 py-1 bg-funky-purple/20 text-funky-purple text-xs rounded-md flex items-center gap-1">
            <Trophy className="h-3 w-3" />
            Admin
          </span>}
        
        {!isLoading && userRole === 'influencer' && userId && <Link to={`/wishlist/${userId}`} className="px-2 py-1 bg-funky-purple/20 text-funky-purple text-xs rounded-md hover:bg-funky-purple/30 flex items-center gap-1 transition-colors">
            <User className="h-3 w-3" />
            My Wishlist
          </Link>}
      </div>
      
      <hr className={cn("absolute bottom-0 left-3 sm:left-6", "w-[calc(100%-1.5rem)] sm:w-[calc(100%-3rem)]", "border-t border-funky-purple/10")} />
    </header>;
};
export default NavHeader;