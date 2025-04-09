
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
      // First check if admin already exists in auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: adminPassword,
      });
      
      if (!authError && authData.user) {
        console.log("Admin user already exists in auth system");
        
        // Check profile
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', adminEmail)
          .maybeSingle();
          
        if (!existingProfile) {
          // Create profile if it doesn't exist
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: authData.user.id,
              email: adminEmail,
              user_type: 'admin'
            });
            
          if (profileError) {
            throw new Error(`Failed to create profile: ${profileError.message}`);
          }
        }
        
        // Assign admin role
        await assignAdminRole(authData.user.id);
        return;
      }
      
      // If user doesn't exist or password is wrong, create a new user
      console.log("Creating new admin user");
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
        user_metadata: {
          user_type: 'admin'
        }
      });

      if (createError) {
        // Try alternative method if admin API fails
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
        
        await assignAdminRole(signUpData.user.id);
        
        toast({
          title: "Admin User Created",
          description: `Admin user created with email: ${adminEmail} - Please login with password: ${adminPassword}`,
          duration: 10000,
        });
      } else if (newUser && newUser.user) {
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
      throw new Error(`Failed to assign admin role: ${roleError.message}`);
    }

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
