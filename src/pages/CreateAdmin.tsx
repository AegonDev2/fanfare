
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const CreateAdmin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const adminEmail = "fanfare11work@gmail.com";
  const adminPassword = "FanFare@Admin12"; // Fixed admin password

  const createAdminUser = async () => {
    setIsLoading(true);

    try {
      console.log("Starting admin creation process");
      
      // First try to sign in to check if admin exists with correct password
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
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
      
      // Check if user exists but with wrong password
      const { data: { users }, error: getUserError } = await supabase.auth.admin.listUsers();
      
      const existingUser = users?.find(u => u.email === adminEmail);
      
      if (existingUser) {
        console.log("Admin user exists but with wrong password, updating password");
        
        // Update password for existing user
        const { error: updateError } = await supabase.auth.admin.updateUserById(
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
      
      // Create new admin user
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
        user_metadata: {
          user_type: 'admin'
        }
      });

      if (createError) {
        console.error("Error creating admin via admin API:", createError);
        
        // Try fallback method with regular signup
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: adminEmail,
          password: adminPassword,
          options: {
            data: {
              user_type: 'admin'
            }
          }
        });
        
        if (signUpError) {
          throw new Error(`Failed to create user: ${signUpError.message}`);
        }
        
        if (!signUpData.user) {
          throw new Error('Failed to create user');
        }
        
        await ensureProfileExists(signUpData.user.id);
        await assignAdminRole(signUpData.user.id);
        
        toast({
          title: "Admin User Created",
          description: `Admin user created with email: ${adminEmail} - Please login with password: ${adminPassword}`,
          duration: 10000,
        });
      } else if (newUser && newUser.user) {
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
  
  // Helper function to ensure profile exists
  const ensureProfileExists = async (userId: string) => {
    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();
      
    if (!existingProfile) {
      // Create profile if it doesn't exist
      const { error: profileError } = await supabase
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
  
  // Helper function to assign admin role
  const assignAdminRole = async (userId: string) => {
    // Check if user already has admin role
    const { data: existingRole } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    if (existingRole) {
      console.log("Admin role already assigned");
      toast({
        title: "Admin Role Already Assigned",
        description: `${adminEmail} already has admin privileges.`,
      });
      return;
    }

    // Assign admin role
    const { error: roleError } = await supabase
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
      description: `Admin privileges granted to ${adminEmail}`,
    });
  };

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-md mx-auto">
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
    </div>
  );
};

export default CreateAdmin;
