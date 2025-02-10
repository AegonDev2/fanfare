
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Header = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Fan Fare</h1>
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/auth")}>
            Sign In
          </Button>
          <Button variant="outline" className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            <i className="fas fa-bars text-2xl"></i>
          </Button>
        </div>
        {menuOpen && (
          <nav className="absolute top-16 right-4 bg-white shadow-lg rounded-lg p-4 space-y-2 z-50">
            <div className="space-y-2">
              <Button variant="ghost" className="w-full justify-start">Home</Button>
              <Button variant="ghost" className="w-full justify-start">Profile</Button>
              <Button variant="ghost" className="w-full justify-start">Track Order</Button>
              <Button variant="ghost" className="w-full justify-start">Settings</Button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
