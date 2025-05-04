
import { useState, useEffect } from "react";
import { Bell, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Notification {
  id: string;
  type: string;
  message: string;
  created_at: string;
  is_read: boolean;
  recipient_id: string;
  sender_id?: string;
  reference_id?: string;
}

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  // Fetch notifications on component mount
  useEffect(() => {
    fetchNotifications();
    
    // Set up realtime subscription for new notifications
    const channel = supabase
      .channel('notification-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          
          // Check if the notification is for the current user
          supabase.auth.getUser().then(({ data }) => {
            if (data.user && newNotification.recipient_id === data.user.id) {
              // Add the new notification to the state
              setNotifications((prev) => [newNotification, ...prev]);
              setUnreadCount((prev) => prev + 1);
              
              // Show a toast notification
              toast({
                title: "New Notification",
                description: newNotification.message,
              });
            }
          });
        }
      )
      .subscribe();
    
    // Clean up subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) return;

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', userData.user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.is_read).length || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, is_read: true } 
            : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) return;

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('recipient_id', userData.user.id)
        .eq('is_read', false);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(notification => ({ ...notification, is_read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_gift_request':
        return "🎁";
      case 'gift_accepted':
      case 'gift_request_approved':
        return "✅";
      case 'gift_rejected':
      case 'gift_request_rejected':
        return "❌";
      case 'gift_shipped':
        return "📦";
      case 'gift_delivered':
      case 'order_completed':
        return "🚚";
      default:
        return "📣";
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-[var(--navbar-light-primary)] hover:bg-[var(--navbar-dark-secondary)] group"
        >
          <Bell className="h-5 w-5 group-hover:animate-bounce-subtle" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-funky-pink text-white animate-pulse-glow"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <Card className="border-0 bg-white/90 backdrop-blur-md">
          <CardHeader className="py-3 px-4 flex flex-row justify-between items-center bg-gradient-to-r from-funky-purple/20 to-funky-pink/20">
            <div>
              <CardTitle className="text-lg font-display">Notifications</CardTitle>
              <CardDescription>Your recent notifications</CardDescription>
            </div>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={markAllAsRead}
                className="text-xs hover:bg-funky-purple/20"
              >
                Mark all as read
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-0 max-h-[400px] overflow-y-auto">
            {isLoading ? (
              <div className="py-8 text-center text-gray-500">Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="py-12 text-center text-gray-500 flex flex-col items-center">
                <Bell className="h-8 w-8 text-gray-400 mb-2" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`p-4 flex items-start hover:bg-gray-50 cursor-pointer transition-colors ${!notification.is_read ? 'bg-funky-purple/5' : ''}`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className={`mr-3 text-xl ${!notification.is_read ? 'animate-pulse-glow' : ''}`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 mb-1">{notification.message}</p>
                      <p className="text-xs text-gray-500">{formatDate(notification.created_at)}</p>
                    </div>
                    {!notification.is_read && (
                      <div className="ml-2 mt-1">
                        <Badge className="h-2 w-2 rounded-full bg-funky-pink p-0" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="py-2 px-4 bg-gray-50">
            <Button variant="link" size="sm" className="mx-auto text-xs text-funky-purple">
              View all notifications
            </Button>
          </CardFooter>
        </Card>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationCenter;
