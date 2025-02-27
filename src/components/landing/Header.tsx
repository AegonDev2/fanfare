
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

interface HeaderProps {
  setNavOpen?: (isOpen: boolean) => void;
}

const Header = ({ setNavOpen }: HeaderProps) => {
  const toggleNav = () => {
    if (setNavOpen) {
      setNavOpen(true); // Use boolean value directly instead of callback
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-sm z-20 border-b border-gray-200">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-3">
          {/* Menu toggle button */}
          <Button
            variant="outline"
            size="icon"
            className="rounded-full h-10 w-10 bg-white shadow-md hover:bg-gray-100"
            onClick={toggleNav}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <Link to="/" className="text-lg font-semibold">
            Fan Fare
          </Link>
        </div>
        
        <div className="flex items-center gap-3">
          <Link to="/place-order">
            <Button variant="outline" size="sm">
              Send a Gift
            </Button>
          </Link>
          <Link to="/auth">
            <Button size="sm">
              Login
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
