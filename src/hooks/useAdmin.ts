
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useOrderActions } from "@/hooks/useOrderActions";
import { useAdminOrders } from "@/hooks/useAdminOrders";
import type { OrderDetails } from '@/types/admin';

export const useAdmin = () => {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isCheckingRole, setIsCheckingRole] = useState(true);
  const { toast } = useToast();
  
  const { 
    orders, 
    isLoading, 
    fetchAllOrders, 
    setOrders 
  } = useAdminOrders();
  
  const { handleOrderComplete } = useOrderActions(orders, fetchAllOrders);

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setUserRole(null);
          return;
        }
        
        const { data: roles, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);
        
        if (error) throw error;
        
        if (roles && roles.length > 0) {
          const isAdmin = roles.some(r => r.role === 'admin');
          setUserRole(isAdmin ? 'admin' : 'user');
        } else {
          setUserRole('user');
        }
      } catch (error) {
        console.error('Error checking user role:', error);
        toast({
          title: 'Error',
          description: 'Failed to verify your permissions',
          variant: 'destructive',
        });
      } finally {
        setIsCheckingRole(false);
      }
    };

    checkUserRole();
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkUserRole();
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);

  return {
    userRole,
    isCheckingRole,
    orders,
    isLoading,
    fetchAllOrders,
    handleOrderComplete
  };
};
