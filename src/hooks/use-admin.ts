
import { useEffect, useState } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useAdminOrders } from '@/hooks/useAdminOrders';
import { useOrderActions } from '@/hooks/useOrderActions';

export const useAdmin = () => {
  const { userRole } = useAdminAuth();
  const { orders, isLoading, fetchAllOrders, setOrders } = useAdminOrders();
  const { handleOrderComplete } = useOrderActions(orders, fetchAllOrders);
  
  useEffect(() => {
    if (userRole === 'admin') {
      fetchAllOrders();
    }
  }, [userRole, fetchAllOrders]);

  return {
    orders,
    isLoading,
    userRole,
    fetchAllOrders,
    handleOrderComplete
  };
};
