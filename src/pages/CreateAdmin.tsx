
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://utuguowpwezberrmqabw.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0dWd1b3dwd2V6YmVycm1xYWJ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczOTE3MTA4NiwiZXhwIjoyMDU0NzQ3MDg2fQ.QQs-MLDhBE42nQVuQP2iR_YeQS6WrdrcPMKP45uA_R0";

// Create a Supabase client with the service role key for admin operations
const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const CreateAdmin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAssigningRole, setIsAssigningRole] = useState(false);
  const [specificUserId, setSpecificUserId] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const adminEmail = "fanfare11work@gmail.com";
  const adminPassword = "FanFare@Admin12"; // Fixed admin password

  useEffect(() => {
    const checkAuthAndAdminStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setIsAuthenticated(false);
          return;
        }
        
        setIsAuthenticated(true);
        
        // Check if user has admin role
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle();
          
        if (roleError && roleError.code !== 'PGRST116') {
          console.error("Error checking admin role:", roleError);
        }
        
        setIsAdmin(!!roleData);
      } catch (error) {
        console.error("Error checking auth status:", error);
      }
    };
    
    checkAuthAndAdminStatus();
  }, []);

  const createAdminUser = async () => {
    setIsLoading(true);

    try {
      console.log("Starting admin creation process");
      
      // First try to sign in to check if admin exists with correct password
      const { data: signInData, error: signInError } = await adminClient.auth.signInWithPassword({
        email: adminEmail,
        password: adminPassword,
      });
      
      // If sign in works, admin exists with correct password
      if (!signInError && signInData?.user) {
        console.log("Admin exists with correct password", signInData.user.id);
        
        // Ensure profile exists
        await ensureProfileExists(signInData.user.id);
        
        // Ensure admin role is assigned
        await assignAdminRole(signInData.user.id);
        
        toast({
          title: "Admin User Verified",
          description: `${adminEmail} already exists and has the correct password.`,
        });
        
        return;
      }
      
      console.log("Admin doesn't exist or password is incorrect, checking if user exists");
      
      // Check if user exists but with wrong password - using admin client
      const { data, error: getUserError } = await adminClient.auth.admin.listUsers();
      
      if (getUserError) {
        throw new Error(`Failed to list users: ${getUserError.message}`);
      }
      
      const users = data?.users || [];
      const existingUser = users.find(u => u.email === adminEmail);
      
      if (existingUser) {
        console.log("Admin user exists but with wrong password, updating password");
        
        // Update password for existing user - using admin client
        const { error: updateError } = await adminClient.auth.admin.updateUserById(
          existingUser.id,
          { password: adminPassword }
        );
        
        if (updateError) {
          throw new Error(`Failed to update admin password: ${updateError.message}`);
        }
        
        // Ensure profile exists
        await ensureProfileExists(existingUser.id);
        
        // Assign admin role
        await assignAdminRole(existingUser.id);
        
        toast({
          title: "Admin Password Updated",
          description: `Password for ${adminEmail} has been updated to: ${adminPassword}`,
          duration: 10000,
        });
        
        return;
      }
      
      console.log("Admin user doesn't exist, creating new user");
      
      // Create new admin user - using admin client
      const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
        user_metadata: {
          user_type: 'admin'
        }
      });

      if (createError) {
        console.error("Error creating admin via admin API:", createError);
        throw new Error(`Failed to create user: ${createError.message}`);
      }
      
      if (newUser && newUser.user) {
        await ensureProfileExists(newUser.user.id);
        await assignAdminRole(newUser.user.id);
        
        toast({
          title: "Admin User Created",
          description: `Admin user created with email: ${adminEmail} - Please login with password: ${adminPassword}`,
          duration: 10000,
        });
      }
    } catch (error: any) {
      console.error("Error creating admin:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create admin user",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to ensure profile exists using admin client
  const ensureProfileExists = async (userId: string) => {
    // Check if profile exists
    const { data: existingProfile } = await adminClient
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();
      
    if (!existingProfile) {
      // Create profile if it doesn't exist
      const { error: profileError } = await adminClient
        .from('profiles')
        .insert({
          id: userId,
          email: adminEmail,
          user_type: 'admin'
        });
        
      if (profileError) {
        console.error("Error creating profile:", profileError);
        throw new Error(`Failed to create profile: ${profileError.message}`);
      }
    }
  };
  
  // Helper function to assign admin role using admin client
  const assignAdminRole = async (userId: string) => {
    // Check if user already has admin role
    const { data: existingRole } = await adminClient
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    if (existingRole) {
      console.log("Admin role already assigned");
      toast({
        title: "Admin Role Already Assigned",
        description: `User already has admin privileges.`,
      });
      return;
    }

    // Assign admin role
    const { error: roleError } = await adminClient
      .from('user_roles')
      .insert({
        user_id: userId,
        role: 'admin'
      });

    if (roleError) {
      console.error("Error assigning role:", roleError);
      throw new Error(`Failed to assign admin role: ${roleError.message}`);
    }

    console.log("Admin role assigned successfully");
    toast({
      title: "Success",
      description: `Admin privileges granted successfully to user`,
    });
  };

  // Function to assign admin role to a specific user ID using admin client
  const assignAdminToSpecificUser = async () => {
    if (!specificUserId || specificUserId.trim() === "") {
      toast({
        title: "Error",
        description: "Please enter a valid user ID",
        variant: "destructive",
      });
      return;
    }

    setIsAssigningRole(true);
    try {
      // Check if the user exists using admin client
      const { data: userData, error: userError } = await adminClient.auth.admin.getUserById(specificUserId);
      
      if (userError || !userData.user) {
        throw new Error(`User not found: ${userError?.message || "Invalid user ID"}`);
      }
      
      // Ensure profile exists
      const { data: existingProfile } = await adminClient
        .from('profiles')
        .select('id')
        .eq('id', specificUserId)
        .maybeSingle();
        
      if (!existingProfile) {
        // Create profile if it doesn't exist
        const { error: profileError } = await adminClient
          .from('profiles')
          .insert({
            id: specificUserId,
            email: userData.user.email || "unknown@example.com",
            user_type: 'admin'
          });
          
        if (profileError) {
          console.error("Error creating profile:", profileError);
          throw new Error(`Failed to create profile: ${profileError.message}`);
        }
      }
      
      // Assign admin role
      await assignAdminRole(specificUserId);
      
      toast({
        title: "Admin Role Assigned",
        description: `Admin privileges granted to user ID: ${specificUserId}`,
      });
      
    } catch (error: any) {
      console.error("Error assigning admin role:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to assign admin role",
        variant: "destructive",
      });
    } finally {
      setIsAssigningRole(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-10">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You need to be logged in to access this page.
              </AlertDescription>
            </Alert>
            <Button 
              onClick={() => navigate("/auth")}
              className="w-full"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-md mx-auto mb-8">
        <CardHeader>
          <CardTitle>Create Admin User</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            This will create an admin user with the email: <strong>{adminEmail}</strong>
          </p>
          <Button 
            onClick={createAdminUser} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Processing..." : "Create Admin User"}
          </Button>
        </CardContent>
      </Card>
      
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Assign Admin Role to Specific User</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userId">User ID</Label>
              <Input
                id="userId"
                placeholder="Enter user ID to assign admin role"
                value={specificUserId}
                onChange={(e) => setSpecificUserId(e.target.value)}
              />
            </div>
            <Button 
              onClick={assignAdminToSpecificUser} 
              disabled={isAssigningRole}
              className="w-full"
            >
              {isAssigningRole ? "Assigning..." : "Assign Admin Role"}
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start">
          <p className="text-sm text-muted-foreground">
            Use this to assign admin role to an existing user by their ID.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CreateAdmin;
