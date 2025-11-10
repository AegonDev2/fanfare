import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';

/**
 * Get the appropriate redirect URL for email authentication
 * based on the current platform
 */
export const getAuthRedirectUrl = (): string => {
  const isNative = Capacitor.isNativePlatform();
  
  if (isNative) {
    // Use custom scheme for native app
    return 'fanfare://auth/callback';
  }
  
  // Use web URL for browser
  return `${window.location.origin}/auth/callback`;
};

/**
 * Initialize deep link listener for handling auth callbacks in native app
 */
export const initializeDeepLinkListener = (
  onDeepLink: (url: string) => void
) => {
  if (!Capacitor.isNativePlatform()) {
    return () => {}; // No-op cleanup for web
  }

  let listenerHandle: any = null;

  // Set up the listener
  App.addListener('appUrlOpen', (event) => {
    console.log('Deep link received:', event.url);
    
    // Check if this is an auth callback
    if (event.url.includes('auth/callback')) {
      console.log('Auth callback deep link detected');
      onDeepLink(event.url);
    }
  }).then(handle => {
    listenerHandle = handle;
  });

  return () => {
    if (listenerHandle) {
      listenerHandle.remove();
    }
  };
};

/**
 * Check if current environment is native mobile app
 */
export const isNativeApp = (): boolean => {
  return Capacitor.isNativePlatform();
};
