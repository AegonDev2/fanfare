
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoginForm from "@/components/auth/LoginForm";
import SignUpForm from "@/components/auth/SignUpForm";
import { useNavigate } from "react-router-dom";
import { ExternalLink } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen p-4 bg-background">
      <div className="max-w-md mx-auto pt-8">
        <Card className="p-6">
          <Button 
            variant="ghost" 
            className="mb-4"
            onClick={() => navigate("/")}
          >
            ← Back to Home
          </Button>
          <h1 className="text-3xl font-bold mb-4 text-center">GiftLoop Connect</h1>
          <p className="text-muted-foreground mb-6 text-center">
            Connect with your favorite influencers and share meaningful gifts.
          </p>
          
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <LoginForm />
            </TabsContent>
            <TabsContent value="signup">
              <SignUpForm />
            </TabsContent>
          </Tabs>
          
          {/* Admin setup link - very discreet */}
          <div className="mt-6 text-xs text-right">
            <Button 
              variant="link" 
              size="sm" 
              className="text-muted-foreground/50 h-auto p-0 text-xs"
              onClick={() => navigate("/create-admin")}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Admin Setup
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
