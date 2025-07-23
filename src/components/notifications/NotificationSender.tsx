import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Send, Users, Megaphone, Gift } from 'lucide-react';

interface NotificationSenderProps {
  onClose?: () => void;
}

export const NotificationSender = ({ onClose }: NotificationSenderProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    type: 'promotional',
    targetAudience: 'all'
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.body) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);

    try {
      let userIds: string[] | undefined;

      // Get target user IDs based on audience selection
      if (formData.targetAudience !== 'all') {
        const { data: roles, error: rolesError } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('role', formData.targetAudience as any);

        if (rolesError) {
          throw rolesError;
        }

        userIds = roles?.map(r => r.user_id) || [];
      }

      // Send push notification
      const { error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          userIds,
          title: formData.title,
          body: formData.body,
          notificationType: formData.type,
          data: {
            type: formData.type,
            timestamp: new Date().toISOString()
          }
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: 'Success! 🎉',
        description: 'Push notification sent successfully',
      });

      // Reset form
      setFormData({
        title: '',
        body: '',
        type: 'promotional',
        targetAudience: 'all'
      });

      onClose?.();
    } catch (error) {
      console.error('Error sending notification:', error);
      toast({
        title: 'Error',
        description: 'Failed to send notification. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Megaphone className="h-5 w-5" />
          Send Push Notification
        </CardTitle>
        <CardDescription>
          Send notifications to app users on their mobile devices
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Enter notification title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Message *</Label>
            <Textarea
              id="body"
              placeholder="Enter notification message"
              value={formData.body}
              onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Notification Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="promotional">
                  <div className="flex items-center gap-2">
                    <Megaphone className="h-4 w-4" />
                    Promotional
                  </div>
                </SelectItem>
                <SelectItem value="gift_request_update">
                  <div className="flex items-center gap-2">
                    <Gift className="h-4 w-4" />
                    Gift Update
                  </div>
                </SelectItem>
                <SelectItem value="general">
                  <div className="flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    General
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="audience">Target Audience</Label>
            <Select
              value={formData.targetAudience}
              onValueChange={(value) => setFormData(prev => ({ ...prev, targetAudience: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    All Users
                  </div>
                </SelectItem>
                <SelectItem value="fan">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Fans Only
                  </div>
                </SelectItem>
                <SelectItem value="influencer">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Influencers Only
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Sending...' : 'Send Notification'}
            </Button>
            {onClose && (
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};