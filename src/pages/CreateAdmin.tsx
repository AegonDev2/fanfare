
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
      // Check if the user exists
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', adminEmail)
        .maybeSingle();

      let userId;

      if (existingUser) {
        // User exists, use their ID
        userId = existingUser.id;
        console.log("User exists, using their ID:", userId);
      } else {
        // User doesn't exist, we need to create them
        // Use the specified password
        const { data: newUser, error: createError } = await supabase.auth.signUp({
          email: adminEmail,
          password: adminPassword,
          options: {
            data: {
              user_type: 'admin'
            }
          }
        });

        if (createError) {
          throw new Error(`Failed to create user: ${createError.message}`);
        }
        
        if (!newUser.user) {
          throw new Error('Failed to create user');
        }

        userId = newUser.user.id;
        console.log("Created new user with ID:", userId);
        
        // Tell the user about the fixed password
        toast({
          title: "Admin User Created",
          description: `Admin user created with email: ${adminEmail} - Please login with the specified password!`,
          duration: 10000,
        });
      }

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
