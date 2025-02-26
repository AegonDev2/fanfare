
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface NavHeaderProps {
  setIsOpen: (isOpen: boolean) => void;
}

const NavHeader = ({ setIsOpen }: NavHeaderProps) => {
  return (
    <header className="relative flex items-center min-h-[80px] px-6">
      <h1 className="text-2xl font-semibold">Fan Fare</h1>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 text-[var(--navbar-light-primary)]"
        onClick={() => setIsOpen(false)}
      >
        <X className="h-4 w-4" />
      </Button>
      <hr className="absolute bottom-0 left-6 w-[calc(100%-3rem)] border-t border-[var(--navbar-dark-secondary)]" />
    </header>
  );
};

export default NavHeader;
