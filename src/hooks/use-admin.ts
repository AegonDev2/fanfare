
import { useAdminAuth } from "./useAdminAuth";
import { useAdminOrders } from "./useAdminOrders";
import { useOrderActions } from "./useOrderActions";
import { useEffect } from "react";

export const useAdmin = () => {
  const { userRole } = useAdminAuth();
  const { orders, isLoading, fetchAllOrders, setOrders } = useAdminOrders();

  const { handleOrderProcessing, handleOrderComplete } = useOrderActions(
    orders,
    fetchAllOrders,
  );

  // Refresh orders on mount/poll
  useEffect(() => {
    fetchAllOrders();
    const interval = setInterval(() => {
      fetchAllOrders();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchAllOrders]);

  return {
    orders,
    isLoading,
    userRole,
    fetchAllOrders,
    handleOrderProcessing,
    handleOrderComplete,
    setOrders, // expose for future if needed
  };
};
