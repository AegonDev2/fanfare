
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

type UserType = 'fan' | 'influencer';

const SignUpForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState<UserType | "">("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userType) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a user type",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Password must be at least 6 characters long",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log("Starting signup process for:", email, "as", userType);
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            user_type: userType
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      console.log("Signup response:", { authData, authError });

      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        throw new Error("No user data returned");
      }

      // The profile creation and role assignment now happen automatically via database triggers

      toast({
        title: "Success",
        description: "Account created successfully! Please check your email to verify your account.",
      });
      
      // Navigate based on user type
      if (userType === "influencer") {
        navigate("/create-profile");
      } else {
        navigate("/");
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      
      // Handle specific error cases
      if (error.message?.toLowerCase().includes('already registered')) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "This email is already registered. Please try logging in instead.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "An error occurred during sign up",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="signup-email">Email</Label>
        <Input
          id="signup-email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-password">Password</Label>
        <Input
          id="signup-password"
          type="password"
          placeholder="Create a password (min. 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="user-type">I am a...</Label>
        <Select 
          onValueChange={(value) => setUserType(value as UserType)} 
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select user type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fan">Fan</SelectItem>
            <SelectItem value="influencer">Influencer</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Creating account..." : "Create Account"}
      </Button>
    </form>
  );
};

export default SignUpForm;
