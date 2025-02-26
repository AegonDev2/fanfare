
interface NavUserProps {
  userEmail: string | null;
  userRole: string | null;
}

const NavUser = ({ userEmail, userRole }: NavUserProps) => {
  return (
    <footer className="absolute bottom-0 left-0 w-full bg-[var(--navbar-dark-secondary)] p-6">
      <div className="flex items-center">
        <div className="relative w-8 h-8 rounded-full overflow-hidden">
          <img
            src="https://storage.googleapis.com/a1aa/image/XZap5acURHVhX1bOw4h9xVM_CSgwW4lMTY9IVmySNr0.jpg"
            alt="Avatar"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="ml-4 flex flex-col">
          <span className="text-sm truncate">{userEmail || "Guest"}</span>
          <span className="text-xs text-[var(--navbar-light-secondary)] capitalize">
            {userRole || "Not logged in"}
          </span>
        </div>
      </div>
    </footer>
  );
};

export default NavUser;
