import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useOrderUpdates = (onOrderUpdate: (orderId: string, updatedFields: any) => void) => {
  useEffect(() => {
    // Listen for real-time updates to orders table
    const channel = supabase
      .channel('order-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          console.log('Order updated:', payload);
          const { id } = payload.new as any;
          onOrderUpdate(id, payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onOrderUpdate]);
};