import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface UseOptimisticUpdateOptions<T, TVariables> {
  queryKey: (string | number)[];
  mutationFn: (variables: TVariables) => Promise<T>;
  onOptimisticUpdate?: (variables: TVariables, currentData: T[] | undefined) => T[] | undefined;
  onSuccess?: (data: T, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables, previousData: T[] | undefined) => void;
  successMessage?: string;
  errorMessage?: string;
}

export function useOptimisticUpdate<T, TVariables>({
  queryKey,
  mutationFn,
  onOptimisticUpdate,
  onSuccess,
  onError,
  successMessage,
  errorMessage = "Action failed"
}: UseOptimisticUpdateOptions<T, TVariables>) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const mutate = useCallback(async (variables: TVariables) => {
    setIsLoading(true);
    
    // Get the current data
    const previousData = queryClient.getQueryData<T[]>(queryKey);
    
    try {
      // Apply optimistic update if provided
      if (onOptimisticUpdate && previousData) {
        const optimisticData = onOptimisticUpdate(variables, previousData);
        queryClient.setQueryData(queryKey, optimisticData);
      }

      // Perform the actual mutation
      const result = await mutationFn(variables);

      // Call success callback
      if (onSuccess) {
        onSuccess(result, variables);
      }

      // Show success message
      if (successMessage) {
        toast({
          title: "Success",
          description: successMessage,
        });
      }

      // Invalidate and refetch to get the latest data
      await queryClient.invalidateQueries({ queryKey });

      return result;
    } catch (error) {
      // Revert optimistic update on error
      if (onOptimisticUpdate && previousData) {
        queryClient.setQueryData(queryKey, previousData);
      }

      // Call error callback
      if (onError) {
        onError(error as Error, variables, previousData);
      }

      // Show error message
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });

      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [queryKey, mutationFn, onOptimisticUpdate, onSuccess, onError, successMessage, errorMessage, queryClient, toast]);

  return {
    mutate,
    isLoading,
  };
}