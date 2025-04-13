import { Home, User, UserPlus, Settings, Gift, Info, Book, Users, Wallet } from "lucide-react";

interface NavItemProps {
  id: string;
  title: string;
  path: string;
  icon: string;
  isActive: boolean;
  onClick: () => void;
}

const iconMap: { [key: string]: any } = {
  Home,
  User,
  UserPlus,
  Settings,
  Gift,
  Info,
  Book,
  Users,
  Wallet
};

const NavItem = ({ title, icon, isActive, onClick }: NavItemProps) => {
  const Icon = iconMap[icon];

  return (
    <div
      className={`flex items-center px-4 py-4 cursor-pointer rounded-lg transition-all duration-300 ease-in-out my-2
        ${isActive 
          ? "text-[var(--navbar-dark-primary)] bg-[var(--navbar-light-primary)]" 
          : "text-[var(--navbar-light-secondary)] hover:bg-[var(--navbar-dark-secondary)] hover:text-[var(--navbar-light-primary)]"}`}
      onClick={onClick}
    >
      {Icon && <Icon className="h-5 w-5 min-w-5" />}
      <span className="ml-4 truncate">{title}</span>
    </div>
  );
};

export default NavItem;
