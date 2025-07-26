import { useEffect } from 'react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface NotificationManagerProps {
  children: React.ReactNode;
}

export const NotificationManager = ({ children }: NotificationManagerProps) => {
  const { registerForPushNotifications } = usePushNotifications();
  const { toast } = useToast();

  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        // Check if user is authenticated
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Register for push notifications
          await registerForPushNotifications();
          
          // Set up real-time listeners for notification triggers
          setupNotificationListeners(user.id);
        }
      } catch (error) {
        console.error('Error initializing notifications:', error);
      }
    };

    initializeNotifications();
  }, [registerForPushNotifications]);

  const setupNotificationListeners = (userId: string) => {
    // Listen for new gift requests in orders table (for influencers)
    const giftRequestsChannel = supabase
      .channel('gift-requests-notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'orders',
        filter: `influencer_id=eq.${userId}`
      }, (payload) => {
        // Only send notification for gift requests
        if (payload.new.gift_type === true) {
          sendPushNotification({
            userIds: [userId],
            title: 'New Gift Request! 🎁',
            body: 'You have received a new gift request from a fan!',
            data: {
              type: 'new_gift_request',
              orderId: payload.new.id,
              productUrl: payload.new.product_url
            }
          });
        }
      })
      .subscribe();

    // Listen for gift request status updates (for fans)
    const giftUpdatesChannel = supabase
      .channel('gift-updates-notifications')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'gift_requests',
        filter: `sender_id=eq.${userId}`
      }, (payload) => {
        const oldStatus = payload.old.status;
        const newStatus = payload.new.status;
        
        if (oldStatus !== newStatus) {
          let title = 'Gift Request Update';
          let body = `Your gift request status has been updated to ${newStatus}`;
          
          switch (newStatus) {
            case 'accepted':
              title = 'Gift Request Accepted! ✅';
              body = 'Great news! Your gift request has been accepted by the influencer!';
              break;
            case 'completed':
              title = 'Gift Delivered! 🎉';
              body = 'Your gift has been successfully delivered!';
              break;
            case 'rejected':
              title = 'Gift Request Update';
              body = 'Your gift request was not accepted this time. Keep trying!';
              break;
          }
          
          sendPushNotification({
            userIds: [userId],
            title,
            body,
            data: {
              type: 'gift_request_update',
              giftRequestId: payload.new.id,
              status: newStatus
            }
          });
        }
      })
      .subscribe();

    // Listen for order updates
    const ordersChannel = supabase
      .channel('orders-notifications')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        const newStatus = payload.new.status;
        const oldStatus = payload.old.status;
        
        if (oldStatus !== newStatus && newStatus === 'completed') {
          sendPushNotification({
            userIds: [userId],
            title: 'Order Completed! 🎊',
            body: 'Your order has been successfully completed!',
            data: {
              type: 'order_update',
              orderId: payload.new.id,
              status: newStatus
            }
          });
        }
      })
      .subscribe();

    // Cleanup function
    return () => {
      supabase.removeChannel(giftRequestsChannel);
      supabase.removeChannel(giftUpdatesChannel);
      supabase.removeChannel(ordersChannel);
    };
  };

  const sendPushNotification = async (notificationData: {
    userIds: string[];
    title: string;
    body: string;
    data?: any;
  }) => {
    try {
      const { error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          ...notificationData,
          notificationType: notificationData.data?.type || 'general'
        }
      });

      if (error) {
        console.error('Error sending push notification:', error);
      }
    } catch (error) {
      console.error('Error invoking push notification function:', error);
    }
  };

  return <>{children}</>;
};