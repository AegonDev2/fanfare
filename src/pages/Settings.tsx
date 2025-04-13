
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Settings as SettingsIcon, Bell, User, Lock, Image, AlertTriangle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import Header from "@/components/landing/Header";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useUserManager } from "@/utils/userManager";

const Settings = () => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { deleteUser } = useUserManager();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/auth");
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      const { data } = await supabase.auth.getUser();
      
      if (!data.user) {
        throw new Error("User not authenticated");
      }
      
      const success = await deleteUser(data.user.id);
      
      if (success) {
        setDialogOpen(false);
        // Redirect to landing page
        setTimeout(() => {
          navigate("/");
        }, 1000);
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete account",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <SettingsIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-500 mt-1">Manage your account and preferences</p>
              </div>
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Account Settings Card */}
            <Card className="shadow-sm md:col-span-2">
              <CardHeader className="space-y-1">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <User className="h-5 w-5 text-purple-600" />
                  Account Settings
                </CardTitle>
                <CardDescription>
                  Manage your account details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Photo Section */}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <img 
                      src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d"
                      alt="Profile" 
                      className="h-24 w-24 rounded-full object-cover border-2 border-purple-100"
                    />
                    <Button 
                      size="icon"
                      variant="outline"
                      className="absolute bottom-0 right-0 rounded-full w-8 h-8 bg-white hover:bg-purple-50"
                    >
                      <Image className="h-4 w-4 text-purple-600" />
                    </Button>
                  </div>
                  <div>
                    <h3 className="font-medium text-base">Profile Photo</h3>
                    <p className="text-sm text-gray-500">Update your profile picture</p>
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <Button
                    variant="outline"
                    className="w-full justify-start h-14 text-base hover:bg-purple-50"
                    onClick={() => navigate("/edit-profile")}
                  >
                    <User className="mr-3 h-5 w-5 text-purple-600" />
                    <div className="text-left">
                      <div className="font-medium">Edit Profile</div>
                      <div className="text-sm text-gray-500">Update your personal information</div>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start h-14 text-base hover:bg-purple-50"
                    onClick={handleSignOut}
                  >
                    <Lock className="mr-3 h-5 w-5 text-purple-600" />
                    <div className="text-left">
                      <div className="font-medium">Sign Out</div>
                      <div className="text-sm text-gray-500">Securely log out of your account</div>
                    </div>
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-6">
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Delete Account
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="text-destructive">Delete Account</DialogTitle>
                      <DialogDescription>
                        This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <p className="text-sm font-medium">
                        To confirm, type "DELETE" in the field below
                      </p>
                      <Input 
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        placeholder="Type DELETE to confirm"
                      />
                    </div>
                    <DialogFooter>
                      <Button 
                        variant="outline" 
                        onClick={() => setDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        variant="destructive" 
                        disabled={confirmText !== "DELETE" || isDeleting}
                        onClick={handleDeleteAccount}
                      >
                        {isDeleting ? "Deleting..." : "Delete Account"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardFooter>
            </Card>

            {/* Notification Settings Card */}
            <Card className="shadow-sm md:col-span-2">
              <CardHeader className="space-y-1">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Bell className="h-5 w-5 text-purple-600" />
                  Notification Settings
                </CardTitle>
                <CardDescription>
                  Choose how you want to receive updates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between space-x-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications" className="text-base">Email Notifications</Label>
                    <p className="text-sm text-gray-500">Receive updates via email</p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>
                <div className="flex items-center justify-between space-x-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="push-notifications" className="text-base">Push Notifications</Label>
                    <p className="text-sm text-gray-500">Get notified on your device</p>
                  </div>
                  <Switch
                    id="push-notifications"
                    checked={pushNotifications}
                    onCheckedChange={setPushNotifications}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
