
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/useUser";
import { hasRole } from "@/utils/roleManager";
import FloatingHeader from '@/components/ui/floating-header';
import Navbar from '@/components/navigation/Navbar';
import AdminOrdersPanel from '@/components/admin/AdminOrdersPanel';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { toast } = useToast();
  const [navOpen, setNavOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        if (!user) {
          navigate('/auth');
          return;
        }

        // Special check for hardcoded admin user
        if (user.id === "724ce941-97c5-4b7d-b0ba-7ee9bd1df237" || user.email === 'admin@fanfare.com') {
          setIsAdmin(true);
          setIsCheckingAuth(false);
          return;
        }

        // Check role from database
        const adminRole = await hasRole(user.id, 'admin');
        if (!adminRole) {
          toast({
            title: "Unauthorized",
            description: "You do not have permission to access this page.",
            variant: "destructive"
          });
          navigate('/home');
          return;
        }

        setIsAdmin(true);
      } catch (error) {
        console.error("Error checking admin access:", error);
        toast({
          title: "Authentication Error",
          description: "Failed to verify admin access. Please try again.",
          variant: "destructive"
        });
        navigate('/');
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAdminAccess();
  }, [user, navigate, toast]);

  if (isCheckingAuth || !isAdmin) {
    return (
      <>
        <FloatingHeader setNavOpen={setNavOpen} />
        <Navbar isOpen={navOpen} setIsOpen={setNavOpen} />
        <div className="min-h-screen bg-background pt-20">
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-funky-purple"></div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <FloatingHeader setNavOpen={setNavOpen} />
      <Navbar isOpen={navOpen} setIsOpen={setNavOpen} />
      
      <div className="min-h-screen bg-background pt-20">
        <div className="max-w-7xl mx-auto p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-funky-purple to-funky-pink bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-2">Manage orders, view statistics, and more</p>
          </div>

          <AdminOrdersPanel />
        </div>
      </div>
    </>
  );
}
