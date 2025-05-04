
import { cn } from "@/lib/utils";

interface NavUserProps {
  user?: any;
  userEmail?: string | null;
  userRole?: string | null;
  userName?: string | null;
}

const NavUser = ({ user, userEmail, userRole, userName }: NavUserProps) => {
  // Use user object if provided, otherwise fall back to userEmail, userName, and userRole
  const email = user?.email || userEmail || "Guest";
  const name = userName || user?.name || user?.email?.split('@')[0] || "User";
  const role = userRole || (user ? "User" : "Not logged in");
  
  // Format role with uppercase first letter for display
  const formattedRole = role.charAt(0).toUpperCase() + role.slice(1);

  return (
    <div className="p-6 bg-[var(--navbar-dark-secondary)] text-[var(--navbar-light-primary)]">
      <div className="flex items-center">
        <div className={cn(
          "relative w-10 h-10 rounded-full overflow-hidden bg-[var(--navbar-dark-primary)]",
          "border-2 border-funky-purple",
          "shadow-[0_0_10px_0_rgba(139,92,246,0.5)]"
        )}>
          <img
            src="https://storage.googleapis.com/a1aa/image/XZap5acURHVhX1bOw4h9xVM_CSgwW4lMTY9IVmySNr0.jpg"
            alt="Avatar"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-funky-purple/30 to-transparent"></div>
        </div>
        <div className="ml-4 flex flex-col">
          <span className="text-sm truncate font-medium">{name}</span>
          <span className="text-xs text-gray-400 truncate">{email}</span>
          <span className="text-xs text-funky-pink capitalize font-medium">
            {formattedRole}
          </span>
        </div>
      </div>
    </div>
  );
};

export default NavUser;
