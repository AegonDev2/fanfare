
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Home } from "lucide-react";

interface HeaderProps {
  setNavOpen: (isOpen: boolean) => void;
}

const Header = ({ setNavOpen }: HeaderProps) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check initial auth state
    checkAuth();
    
    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        setIsAuthenticated(true);
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setIsAuthenticated(!!user);
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-30">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Button 
          variant="ghost" 
          className="flex items-center gap-2 text-2xl font-bold text-gray-800"
          onClick={() => navigate("/")}
        >
          <Home className="h-5 w-5" />
          Fan Fare
        </Button>
        <div className="flex items-center gap-4">
          {!isAuthenticated && (
            <Button variant="ghost" onClick={() => navigate("/auth")}>
              Sign In
            </Button>
          )}
          <button
            className="relative h-[25px] w-[30px] cursor-pointer transition-all duration-300"
            onClick={() => setNavOpen(true)}
            aria-label="Open navigation menu"
          >
            <span className="absolute top-0 left-0 h-0.5 w-full bg-red-500 transition-all duration-300" />
            <span className="absolute top-[10px] left-0 h-0.5 w-full bg-red-500 transition-all duration-300" />
            <span className="absolute bottom-0 left-0 h-0.5 w-full bg-red-500 transition-all duration-300" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
