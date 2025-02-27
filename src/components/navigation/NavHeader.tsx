
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface NavHeaderProps {
  setIsOpen?: (isOpen: boolean) => void;
}

const NavHeader = ({ setIsOpen }: NavHeaderProps) => {
  return (
    <header className="relative flex items-center justify-between min-h-[80px] px-6 text-[var(--navbar-light-primary)]">
      <h1 className="text-2xl font-semibold">Fan Fare</h1>
      {setIsOpen && (
        <Button
          variant="ghost"
          size="icon"
          className="text-[var(--navbar-light-primary)] hover:bg-[var(--navbar-dark-secondary)]"
          onClick={() => setIsOpen(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
      <hr className="absolute bottom-0 left-6 w-[calc(100%-3rem)] border-t border-[var(--navbar-dark-secondary)]" />
    </header>
  );
};

export default NavHeader;
