
import { useState } from "react";
import { Menu, Search, ShoppingBag, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface HeaderProps {
  setNavOpen: (isOpen: boolean) => void;
}

const Header = ({ setNavOpen }: HeaderProps) => {
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Check if user is authenticated
  const checkAuth = async () => {
    const { data } = await supabase.auth.getSession();
    setUser(data?.session?.user);
  };

  useState(() => {
    checkAuth();
  });

  const toggleNav = () => {
    setNavOpen(true);
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-white shadow-md z-30">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-700"
            onClick={toggleNav}
          >
            <Menu className="h-6 w-6" />
          </Button>
          <a href="/" className="font-bold text-xl text-primary">
            Fan Fare
          </a>
        </div>

        {isSearchOpen ? (
          <div className="flex-1 max-w-md mx-4">
            <div className="relative">
              <Input
                className="pl-10"
                placeholder="Search for influencers or gifts..."
                autoFocus
                onBlur={() => setTimeout(() => setIsSearchOpen(false), 100)}
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
        ) : (
          <div className="hidden md:block">
            <nav className="flex gap-6">
              <a
                href="/"
                className="text-gray-700 hover:text-primary transition-colors"
              >
                Home
              </a>
              <a
                href="/influencers"
                className="text-gray-700 hover:text-primary transition-colors"
              >
                Influencers
              </a>
              <a
                href="/gift-shop"
                className="text-gray-700 hover:text-primary transition-colors"
              >
                Gift Shop
              </a>
              <a
                href="/about"
                className="text-gray-700 hover:text-primary transition-colors"
              >
                About
              </a>
            </nav>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-700"
            onClick={toggleSearch}
          >
            <Search className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-700"
            onClick={() => navigate("/place-order")}
          >
            <ShoppingBag className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-700"
            onClick={() => navigate(user ? "/profile" : "/auth")}
          >
            <User className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
