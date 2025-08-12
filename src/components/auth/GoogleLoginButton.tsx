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
      console.log("Starting Google authentication...");
      console.log("Platform info:", {
        isNativePlatform: Capacitor.isNativePlatform(),
        platform: Capacitor.getPlatform(),
        userAgent: navigator.userAgent
      });
      
      onLoadingChange?.(true);

      // More robust platform detection
      const isNative = Capacitor.isNativePlatform();
      const platform = Capacitor.getPlatform();
      
      if (isNative && (platform === 'android' || platform === 'ios')) {
        // Use native Google Auth for mobile
        console.log(`Using native Google Auth for ${platform}...`);
        
        // Early return after native auth to prevent web flow
        await handleNativeGoogleAuth();
        return;
      } else {
        // Use web OAuth for browser
        console.log("Using web OAuth for browser...");
        await handleWebGoogleAuth();
        return;
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
    console.log('Using Capgo SocialLogin (Google)');
    // If needed, you can call SocialLogin.initialize({ google: { webClientId: 'YOUR_WEB_CLIENT_ID' } }) earlier in app startup.
    const { result } = await SocialLogin.login({ provider: 'google', options: { scopes: ['profile', 'email'] } });
    console.log('SocialLogin result:', result);

    // Online flow returns idToken
    const idToken = (result as any)?.idToken ?? (result as any)?.jwt ?? null;

    if (!idToken) {
      throw new Error('No ID token returned from Google login. Ensure Google Web Client ID is configured in the app.');
    }

    const { data, error } = await supabase.auth.signInWithIdToken({ provider: 'google', token: idToken });
    if (error) {
      console.error('Supabase signInWithIdToken error:', error);
      throw error;
    }

    console.log('Successfully authenticated with Supabase:', data);
    toast({ title: 'Success!', description: 'Successfully authenticated with Google!' });
    navigate('/');
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