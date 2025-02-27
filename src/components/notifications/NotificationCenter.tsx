import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
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

  useEffect(() => {
    fetchNotifications();
    
    const channel = supabase
      .channel('public:notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          
          supabase.auth.getUser().then(({ data }) => {
            if (data.user && newNotification.recipient_id === data.user.id) {
              setNotifications((prev) => [newNotification, ...prev]);
              setUnreadCount((prev) => prev + 1);
              
              toast({
                title: `${getNotificationIcon(newNotification.type)} New Notification`,
                description: newNotification.message,
              });
            }
          });
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) return;

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', user.user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.is_read).length || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive",
      });
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
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) return;

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('recipient_id', user.user.id)
        .eq('is_read', false);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(notification => ({ ...notification, is_read: true }))
      );
      setUnreadCount(0);
      
      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 24 * 60 * 60 * 1000) {
      const hours = Math.floor(diff / (60 * 60 * 1000));
      if (hours < 1) {
        const minutes = Math.floor(diff / (60 * 1000));
        return minutes < 1 ? 'Just now' : `${minutes}m ago`;
      }
      return `${hours}h ago`;
    }
    
    if (diff < 7 * 24 * 60 * 60 * 1000) {
      return date.toLocaleDateString(undefined, { weekday: 'short' }) + 
             ' at ' + 
             date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_gift_request':
        return "🎁";
      case 'gift_accepted':
        return "✅";
      case 'gift_rejected':
        return "❌";
      case 'gift_shipped':
        return "📦";
      case 'gift_delivered':
        return "🚚";
      default:
        return "📣";
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    
    if (notification.type === 'new_gift_request' && notification.reference_id) {
      window.location.href = `/gift-requests?id=${notification.reference_id}`;
      setIsOpen(false);
    }
  };

  const getEmptyStateMessage = () => {
    return (
      <div className="py-8 flex flex-col items-center justify-center text-gray-500">
        <Bell className="h-12 w-12 text-gray-300 mb-3" />
        <p className="text-sm font-medium">No notifications yet</p>
        <p className="text-xs mt-1">We'll notify you when something happens</p>
      </div>
    );
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-[var(--navbar-light-primary)] hover:bg-[var(--navbar-dark-secondary)] transition-colors duration-200"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 animate-pulse"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 shadow-xl border-gray-200" align="end">
        <Card className="border-0">
          <CardHeader className="py-3 px-4 flex flex-row justify-between items-center border-b border-gray-100">
            <div>
              <CardTitle className="text-lg">Notifications</CardTitle>
              <CardDescription>Your recent updates</CardDescription>
            </div>
            {unreadCount > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={markAllAsRead}
                className="text-xs"
              >
                Mark all read
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-0 max-h-[400px] overflow-y-auto">
            {isLoading ? (
              <div className="py-8 text-center text-gray-500">
                <div className="flex justify-center mb-2">
                  <div className="animate-spin h-6 w-6 border-2 border-gray-300 rounded-full border-t-gray-600"></div>
                </div>
                <p>Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              getEmptyStateMessage()
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`p-4 flex items-start hover:bg-gray-50 cursor-pointer transition-colors duration-150 ${!notification.is_read ? 'bg-blue-50' : ''}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="mr-3 text-xl">{getNotificationIcon(notification.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm mb-1 ${!notification.is_read ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500">{formatDate(notification.created_at)}</p>
                    </div>
                    {!notification.is_read && (
                      <div className="ml-2 h-2 w-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="py-2 px-4 bg-gray-50 border-t border-gray-100">
            <Button variant="link" size="sm" className="mx-auto text-xs" onClick={() => {
              window.location.href = '/notifications';
              setIsOpen(false);
            }}>
              View all notifications
            </Button>
          </CardFooter>
        </Card>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationCenter;
