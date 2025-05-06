import { Home, User, UserPlus, Settings, Gift, Info, Book, Users, Wallet, LayoutDashboard, Package, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
interface NavItemProps {
  id: string;
  title: string;
  path: string;
  icon: string;
  isActive: boolean;
  onClick: () => void;
}
const iconMap: {
  [key: string]: any;
} = {
  Home,
  User,
  UserPlus,
  Settings,
  Gift,
  Info,
  Book,
  Users,
  Wallet,
  LayoutDashboard
};
const NavItem = ({
  title,
  icon,
  isActive,
  onClick
}: NavItemProps) => {
  const Icon = iconMap[icon];
  return <div className={cn("flex items-center px-4 py-4 cursor-pointer rounded-lg transition-all duration-300 ease-in-out my-2 group", isActive ? "bg-gradient-to-r from-funky-purple/90 to-funky-pink/90 text-white shadow-md" : "text-[var(--navbar-light-secondary)] hover:bg-[var(--navbar-dark-secondary)] hover:text-[var(--navbar-light-primary)]")} onClick={onClick}>
      {Icon && <div className={cn("relative", isActive ? "animate-bounce-subtle" : "")}>
          <Icon className="h-5 w-5 min-w-5" />
          {!isActive && <span className="absolute -inset-1 bg-transparent rounded-full group-hover:bg-funky-purple/20 group-hover:animate-pulse-glow text-orange-100 font-normal"></span>}
        </div>}
      <span className="ml-4 truncate text-slate-50">{title}</span>
    </div>;
};
export const navItems = [
  {
    title: "Home",
    path: "/",
    icon: <Home className="h-5 w-5" />,
    roles: ["user", "influencer", "admin"],
  },
  {
    title: "Profile",
    path: "/profile",
    icon: <User className="h-5 w-5" />,
    roles: ["user", "influencer", "admin"],
  },
  {
    title: "Gift Requests",
    path: "/gift-requests",
    icon: <Gift className="h-5 w-5" />,
    roles: ["influencer"],
  },
  {
    title: "Gifts Sent",
    path: "/gifts-sent",
    icon: <Package className="h-5 w-5" />,
    roles: ["user"],
  },
  {
    title: "Leaderboard",
    path: "/leaderboard",
    icon: <Trophy className="h-5 w-5" />,
    roles: ["user", "influencer", "admin"],
  },
  {
    title: "Wallet",
    path: "/wallet",
    icon: <Wallet className="h-5 w-5" />,
    roles: ["user"],
  },
  {
    title: "Admin",
    path: "/admin",
    icon: <Settings className="h-5 w-5" />,
    roles: ["admin"],
  },
];
export default NavItem;
