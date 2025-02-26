
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigation } from "./useNavigation";
import NavHeader from "./NavHeader";
import NavItem from "./NavItem";
import NavUser from "./NavUser";

interface NavbarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Navbar = ({ isOpen, setIsOpen }: NavbarProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { navItems, userRole, userEmail, isActiveRoute } = useNavigation();

  return (
    <nav
      className={`w-64 rounded-2xl text-[var(--navbar-light-primary)] 
        font-sans overflow-hidden transition-all duration-300 ease-in-out shadow-xl
        bg-[var(--navbar-dark-primary)] h-[calc(100vh-5rem)] my-4`}
    >
      <NavHeader setIsOpen={setIsOpen} />

      <div className="h-[calc(100%-160px)] overflow-y-auto px-2">
        {navItems.map((item) => {
          if (!userRole || !item.roles.includes(userRole)) return null;
          
          return (
            <NavItem
              key={item.id}
              {...item}
              isActive={isActiveRoute(item.path)}
              onClick={() => {
                navigate(item.path);
                setIsOpen(false);
              }}
            />
          );
        })}
      </div>

      <NavUser userEmail={userEmail} userRole={userRole} />
    </nav>
  );
};

export default Navbar;
