
import { useState } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import FloatingHeader from '@/components/ui/floating-header';
import Navbar from '@/components/navigation/Navbar';
import AdminOrdersPanel from '@/components/admin/AdminOrdersPanel';
import { NotificationSender } from "@/components/notifications/NotificationSender";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";

export default function AdminDashboard() {
  const { userRole, isLoading } = useAdminAuth();
  const [navOpen, setNavOpen] = useState(false);
  const [showNotificationSender, setShowNotificationSender] = useState(false);

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <>
        <FloatingHeader setNavOpen={setNavOpen} />
        <Navbar isOpen={navOpen} setIsOpen={setNavOpen} />
        <div className="min-h-screen bg-background pt-20">
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-funky-purple"></div>
            <span className="ml-2">Verifying admin access...</span>
          </div>
        </div>
      </>
    );
  }

  // Only render admin panel if user has admin role
  if (userRole !== 'admin') {
    return null; // This should not render as useAdminAuth handles redirects
  }

  return (
    <>
      <FloatingHeader setNavOpen={setNavOpen} />
      <Navbar isOpen={navOpen} setIsOpen={setNavOpen} />
      
      <div className="min-h-screen bg-background pt-20">
        <div className="max-w-7xl mx-auto p-6">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-funky-purple to-funky-pink bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-2">Manage orders, view statistics, and more</p>
            </div>
            <Button 
              onClick={() => setShowNotificationSender(!showNotificationSender)}
              className="flex items-center gap-2"
            >
              <Bell className="h-4 w-4" />
              Send Notifications
            </Button>
          </div>

          {showNotificationSender && (
            <div className="mb-8">
              <NotificationSender onClose={() => setShowNotificationSender(false)} />
            </div>
          )}

          <AdminOrdersPanel />
        </div>
      </div>
    </>
  );
}
