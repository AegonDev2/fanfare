import { Capacitor } from '@capacitor/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';

export const initializeFirebaseForCapacitor = async () => {
  if (Capacitor.isNativePlatform()) {
    try {
      await GoogleAuth.initialize({
        clientId: '551635583332-rjnaq9j7ssv0mst8b3t9ph7pt56ua6m6.apps.googleusercontent.com',
        scopes: ['profile', 'email'],
        grantOfflineAccess: true
      });
      console.log('Google Auth initialized for native platform');
    } catch (error) {
      console.error('Failed to initialize Google Auth:', error);
    }
  }
};

export const handleNativeGoogleSignIn = async () => {
  if (!Capacitor.isNativePlatform()) {
    throw new Error('This method should only be called on native platforms');
  }

  try {
    const result = await GoogleAuth.signIn();
    console.log('Native Google Auth result:', result);
    
    if (result?.authentication?.idToken) {
      return {
        idToken: result.authentication.idToken,
        accessToken: result.authentication.accessToken,
        user: result
      };
    } else {
      throw new Error('No authentication tokens received');
    }
  } catch (error) {
    console.error('Native Google Sign-In failed:', error);
    throw error;
  }
};