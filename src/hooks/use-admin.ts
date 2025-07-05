
import { useEffect, useState } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useAdminOrders } from '@/hooks/useAdminOrders';
import { useOrderActions } from '@/hooks/useOrderActions';

export const useAdmin = () => {
  const { userRole, isLoading: authLoading } = useAdminAuth();
  const { orders, isLoading: ordersLoading, fetchAllOrders, setOrders } = useAdminOrders();
  const { handleOrderComplete } = useOrderActions(orders, fetchAllOrders);
  
  useEffect(() => {
    // Only fetch orders if user is confirmed admin
    if (userRole === 'admin' && !authLoading) {
      console.log("Fetching orders for admin user");
      fetchAllOrders();
    }
  }, [userRole, authLoading, fetchAllOrders]);

  return {
    orders,
    isLoading: authLoading || ordersLoading,
    userRole,
    fetchAllOrders,
    handleOrderComplete
  };
};
