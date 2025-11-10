import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import GoogleLoginButton from './GoogleLoginButton';
import { getAuthRedirectUrl } from '@/utils/deepLinkHandler';

const SignUpForm = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const {
    toast
  } = useToast();
  const navigate = useNavigate();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Password must be at least 6 characters long"
      });
      return;
    }
    if (!name.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter your name"
      });
      return;
    }
    setIsLoading(true);
    try {
      console.log("Starting signup process for:", email);
      const redirectUrl = getAuthRedirectUrl();
      console.log("Using redirect URL:", redirectUrl);
      
      const {
        data: authData,
        error: authError
      } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            user_type: 'fan', // All signups are now fans
            name: name
          },
          emailRedirectTo: redirectUrl
        }
      });
      console.log("Signup response:", {
        authData,
        authError
      });
      if (authError) {
        throw authError;
      }
      if (!authData.user) {
        throw new Error("No user data returned");
      }

      // The profile creation and role assignment now happen automatically via database triggers

      toast({
        title: "Account created!",
        description: "Please check your email to verify your account before logging in."
      });

      // Navigate to email verification page
      navigate("/email-verification");
    } catch (error: any) {
      console.error("Signup error:", error);

      // Handle specific error cases
      if (error.message?.toLowerCase().includes('already registered')) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "This email is already registered. Please try logging in instead."
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "An error occurred during sign up"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };
  return <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="signup-name">Name</Label>
        <Input id="signup-name" type="text" placeholder="Enter your full name" value={name} onChange={e => setName(e.target.value)} required className="bg-slate-50" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-email">Email</Label>
        <Input id="signup-email" type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} required className="bg-slate-50" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-password">Password</Label>
        <Input id="signup-password" type="password" placeholder="Create a password (min. 6 characters)" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className="bg-slate-50" />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Creating account..." : "Create Account"}
      </Button>

      <div className="flex items-center my-4">
        <div className="flex-1 border-t border-border"></div>
        <span className="px-3 text-sm text-muted-foreground">or</span>
        <div className="flex-1 border-t border-border"></div>
      </div>

      <GoogleLoginButton 
        isLoading={isLoading} 
        onLoadingChange={setIsLoading} 
      />
    </form>;
};
export default SignUpForm;