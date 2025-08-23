import React from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { SocialLogin } from '@capgo/capacitor-social-login';

interface GoogleLoginButtonProps {
  isLoading?: boolean;
  onLoadingChange?: (loading: boolean) => void;
}

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({ 
  isLoading = false, 
  onLoadingChange 
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleGoogleAuth = async () => {
    try {
      const isNative = Capacitor.isNativePlatform();
      const platform = Capacitor.getPlatform();
      const isMobileDevice = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      console.log("Starting Google authentication...");
      console.log("Platform detection:", {
        isNativePlatform: isNative,
        platform: platform,
        isMobileDevice: isMobileDevice,
        userAgent: navigator.userAgent.substring(0, 100) + "..."
      });
      
      onLoadingChange?.(true);

      // Enhanced platform detection logic
      const shouldUseNativeAuth = isNative && (platform === 'android' || platform === 'ios');
      const shouldUseMobileWebAuth = !isNative && isMobileDevice;
      
      if (shouldUseNativeAuth) {
        console.log(`Using native Google Auth for ${platform}...`);
        await handleNativeGoogleAuth();
      } else if (shouldUseMobileWebAuth) {
        console.log("Using mobile web OAuth...");
        await handleWebGoogleAuth();
      } else {
        console.log("Using desktop web OAuth...");
        await handleWebGoogleAuth();
      }
    } catch (err: any) {
      console.error('Google auth error:', err);
      toast({
        variant: "destructive",
        title: "Authentication failed",
        description: err.message || "Failed to sign in with Google. Please try again.",
      });
    } finally {
      onLoadingChange?.(false);
    }
  };

  const handleNativeGoogleAuth = async () => {
    // Initialize first
    await SocialLogin.initialize({
      google: {
        webClientId: '551635583332-rjnaq9j7ssv0mst8b3t9ph7pt56ua6m6.apps.googleusercontent.com',
        mode: 'online'
      }
    });

    const result = await SocialLogin.login({
      provider: 'google',
      options: {
        scopes: ['email', 'profile']
      }
    });
    console.log("Native Google Auth result:", result);

    if (result?.result && 'idToken' in result.result) {
      // Sign in to Supabase with the Google ID token
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: result.result.idToken,
      });

      if (error) {
        console.error('Supabase signInWithIdToken error:', error);
        throw error;
      }

      console.log("Successfully authenticated with Supabase:", data);
      
      toast({
        title: "Success!",
        description: "Successfully authenticated with Google!"
      });
      
      // Navigate to home page
      navigate("/");
    } else {
      throw new Error("No ID token received from Google Auth");
    }
  };

  const handleWebGoogleAuth = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'https://a407041e-65d3-402d-a548-4a08462e8022.lovableproject.com/'
      }
    });
    
    console.log("OAuth response:", { data, error });
    
    if (error) {
      console.error('Google OAuth error:', error);
      throw error;
    }
    
    console.log("OAuth initiated successfully, redirecting...");
  };

  return (
    <Button 
      type="button"
      variant="outline" 
      className="w-full flex items-center gap-2"
      onClick={handleGoogleAuth}
      disabled={isLoading}
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="currentColor"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="currentColor"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="currentColor"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      {isLoading ? "Signing in..." : "Continue with Google"}
    </Button>
  );
};

export default GoogleLoginButton; 