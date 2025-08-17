import { useEffect, useState } from 'react';
import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PushNotificationState {
  isRegistered: boolean;
  token: string | null;
  error: string | null;
}

export const usePushNotifications = () => {
  const [state, setState] = useState<PushNotificationState>({
    isRegistered: false,
    token: null,
    error: null,
  });
  const { toast } = useToast();

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      initializePushNotifications();
    }
  }, []);

  const initializePushNotifications = async () => {
    try {
      // Request permission to use push notifications
      const result = await PushNotifications.requestPermissions();
      
      if (result.receive === 'granted') {
        try {
          // Register with Apple / Google to receive push via APNS/FCM
          await PushNotifications.register();
          setState(prev => ({ ...prev, isRegistered: true }));
        } catch (registerError: any) {
          console.warn('Push notification registration failed:', registerError);
          
          // Check if it's a Firebase initialization error
          if (registerError?.message?.includes('FirebaseApp is not initialized')) {
            setState(prev => ({ 
              ...prev, 
              error: 'Firebase not configured for push notifications',
              isRegistered: false 
            }));
            // Don't show toast for Firebase config issues in development
            return;
          }
          
          setState(prev => ({ 
            ...prev, 
            error: 'Push notification registration failed',
            isRegistered: false 
          }));
        }
      } else {
        setState(prev => ({ 
          ...prev, 
          error: 'Push notification permission denied',
          isRegistered: false 
        }));
      }
    } catch (error) {
      console.error('Error initializing push notifications:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to initialize push notifications' 
      }));
    }
  };

  const saveDeviceToken = async (token: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Use proper Supabase upsert to safely save device token
        const { error } = await supabase
          .from('device_tokens')
          .upsert({
            user_id: user.id,
            token: token,
            platform: Capacitor.getPlatform(),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,token'
          });

        if (error) {
          console.error('Error saving device token:', error);
        } else {
          console.log('Device token saved successfully');
        }
      }
    } catch (error) {
      console.error('Error saving device token:', error);
    }
  };

  useEffect(() => {
    const addListeners = async () => {
      // On success, we should be able to receive notifications
      await PushNotifications.addListener('registration', (token: Token) => {
        console.log('Push registration success, token: ' + token.value);
        setState(prev => ({ ...prev, token: token.value }));
        saveDeviceToken(token.value);
      });

      // Some issue with our setup and push will not work
      await PushNotifications.addListener('registrationError', (error: any) => {
        console.error('Error on registration: ' + JSON.stringify(error));
        setState(prev => ({ ...prev, error: 'Registration failed' }));
      });

      // Show us the notification payload if the app is open on our device
      await PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
        console.log('Push notification received: ', notification);
        
        // Show toast notification when app is in foreground
        toast({
          title: notification.title || 'New Notification',
          description: notification.body || 'You have a new notification',
        });
      });

      // Method called when tapping on a notification
      await PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
        console.log('Push notification action performed: ', notification);
        
        // Handle notification tap - could navigate to specific screens
        const data = notification.notification.data;
        if (data?.type) {
          handleNotificationAction(data);
        }
      });
    };

    if (Capacitor.isNativePlatform()) {
      addListeners();
    }

    return () => {
      if (Capacitor.isNativePlatform()) {
        PushNotifications.removeAllListeners();
      }
    };
  }, [toast]);

  const handleNotificationAction = (data: any) => {
    // Handle different notification types
    switch (data.type) {
      case 'new_gift_request':
        // Navigate to gift requests page
        window.location.href = '/gift-requests';
        break;
      case 'gift_request_update':
        // Navigate to gifts sent page
        window.location.href = '/gifts-sent';
        break;
      case 'promotional':
        // Navigate to specific promotional content
        if (data.url) {
          window.location.href = data.url;
        }
        break;
      default:
        // Default navigation
        window.location.href = '/';
        break;
    }
  };

  const registerForPushNotifications = async () => {
    if (Capacitor.isNativePlatform()) {
      await initializePushNotifications();
    }
  };

  return {
    ...state,
    registerForPushNotifications,
  };
};