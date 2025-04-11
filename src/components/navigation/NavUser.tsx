
interface NavUserProps {
  user?: any;
  userEmail?: string | null;
  userRole?: string | null;
}

const NavUser = ({ user, userEmail, userRole }: NavUserProps) => {
  // Use user object if provided, otherwise fall back to userEmail and userRole
  const email = user?.email || userEmail || "Guest";
  const role = userRole || (user ? "User" : "Not logged in");
  
  // Format role with uppercase first letter for display
  const formattedRole = role.charAt(0).toUpperCase() + role.slice(1);

  return (
    <div className="p-6 bg-[var(--navbar-dark-secondary)] text-[var(--navbar-light-primary)]">
      <div className="flex items-center">
        <div className="relative w-8 h-8 rounded-full overflow-hidden bg-[var(--navbar-dark-primary)]">
          <img
            src="https://storage.googleapis.com/a1aa/image/XZap5acURHVhX1bOw4h9xVM_CSgwW4lMTY9IVmySNr0.jpg"
            alt="Avatar"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="ml-4 flex flex-col">
          <span className="text-sm truncate">{email}</span>
          <span className="text-xs text-[var(--navbar-light-secondary)] capitalize">
            {formattedRole}
          </span>
        </div>
      </div>
    </div>
  );
};

export default NavUser;
