
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

/**
 * Deletes a user account and all associated data
 * @param userId The ID of the user to delete
 * @returns An object containing success status and any error message
 */
export const deleteUserAccount = async (userId: string) => {
  try {
    // First get current session for authorization
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      return { success: false, error: "You must be logged in to perform this action" };
    }
    
    // Call the admin-actions function to delete the user
    const response = await fetch('https://utuguowpwezberrmqabw.supabase.co/functions/v1/admin-actions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionData.session.access_token}`
      },
      body: JSON.stringify({
        action: 'delete_user',
        userId
      })
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || "Failed to delete user");
    }
    
    // Sign out the user if they deleted their own account
    const { data: userData } = await supabase.auth.getUser();
    if (userData.user && userData.user.id === userId) {
      await supabase.auth.signOut();
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting user account:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    };
  }
};

/**
 * React hook for user account management
 */
export const useUserManager = () => {
  const { toast } = useToast();
  
  const handleDeleteUser = async (userId: string) => {
    try {
      const result = await deleteUserAccount(userId);
      
      if (result.success) {
        toast({
          title: "Account Deleted",
          description: "The user account has been successfully deleted.",
        });
        return true;
      } else {
        toast({
          title: "Deletion Failed",
          description: result.error || "Failed to delete user account",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("Error in handleDeleteUser:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    }
  };
  
  return {
    deleteUser: handleDeleteUser
  };
};
