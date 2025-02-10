
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";

interface HeaderProps {
  setNavOpen: (isOpen: boolean) => void;
}

const Header = ({ setNavOpen }: HeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-30">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Fan Fare</h1>
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/auth")}>
            Sign In
          </Button>
          <button
            className="relative h-[25px] w-[30px] cursor-pointer transition-all duration-300"
            onClick={() => setNavOpen(true)}
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
