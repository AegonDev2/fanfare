
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  setNavOpen?: (isOpen: boolean) => void;
}

const Header = ({ setNavOpen }: HeaderProps) => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-sm z-20 border-b border-gray-200">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <div className="flex items-center">
          {/* Site logo/title - Left empty in center to be replaced by the fixed menu button in App.tsx */}
          <div className="ml-10">
            <Link to="/" className="text-lg font-semibold">
              Fan Fare
            </Link>
          </div>
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
