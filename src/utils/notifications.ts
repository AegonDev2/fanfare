
import { supabase } from "@/integrations/supabase/client";

/**
 * Sends a notification to a specific user.
 * @param recipientId - The user id of the recipient
 * @param type - Type of notification, e.g. 'new_gift_request'
 * @param message - Message to display in notification
 * @param referenceId - Optional: id of related object (e.g. gift_request id)
 * @param senderId - Optional: id of the user who triggered the notification
 */
export const sendNotification = async (recipientId: string, type: string, message: string, referenceId?: string, senderId?: string) => {
  // If you are using Supabase Edge Functions you'd invoke here instead; for now, insert directly.
  await supabase.from("notifications").insert({
    recipient_id: recipientId,
    type,
    message,
    reference_id: referenceId,
    sender_id: senderId,
    is_read: false
  });
};

/**
 * Sends a notification to admin users.
 * @param type - Type of notification, e.g. 'new_approved_gift'
 * @param message - Message to display in notification
 * @param referenceId - Optional: id of related object (e.g. order id)
 * @param senderId - Optional: id of the user who triggered the notification
 */
export const sendAdminNotification = async (type: string, message: string, referenceId?: string, senderId?: string) => {
  try {
    // First, find all admin users
    const { data: adminRoles, error: rolesError } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");
    
    if (rolesError) throw rolesError;
    
    if (adminRoles && adminRoles.length > 0) {
      // Create notifications for each admin user
      const notifications = adminRoles.map(admin => ({
        recipient_id: admin.user_id,
        type,
        message,
        reference_id: referenceId,
        sender_id: senderId,
        is_read: false
      }));
      
      await supabase.from("notifications").insert(notifications);
    }
  } catch (error) {
    console.error("Error sending admin notification:", error);
  }
};
