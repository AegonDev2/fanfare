
import { supabase } from "@/integrations/supabase/client";

/**
 * Sends a notification to a specific user.
 * @param recipientId - The user id of the recipient
 * @param type - Type of notification, e.g. 'new_gift_request'
 * @param message - Message to display in notification
 * @param referenceId - Optional: id of related object (e.g. gift_request id)
 * @param senderId - Optional: id of the user who triggered the notification
 * @param imageUrl - Optional: URL or data URL of the image to include
 */
export const sendNotification = async (
  recipientId: string,
  type: string,
  message: string,
  referenceId?: string,
  senderId?: string,
  imageUrl?: string
) => {
  try {
    console.log(`Sending notification to ${recipientId}: ${message}`);
    
    const { data, error } = await supabase.from("notifications").insert({
      recipient_id: recipientId,
      type,
      message,
      reference_id: referenceId,
      sender_id: senderId,
      is_read: false,
      image_url: imageUrl
    });
    
    if (error) {
      console.error("Error sending notification:", error);
      throw error;
    }
    
    console.log("Notification sent successfully:", data);
    return data;
  } catch (error) {
    console.error("Failed to send notification:", error);
    throw error;
  }
};

/**
 * Sends a notification to admin users.
 * @param type - Type of notification, e.g. 'new_approved_gift'
 * @param message - Message to display in notification
 * @param referenceId - Optional: id of related object (e.g. order id)
 * @param senderId - Optional: id of the user who triggered the notification
 * @param imageUrl - Optional: URL or data URL of the image to include
 */
export const sendAdminNotification = async (
  type: string,
  message: string,
  referenceId?: string,
  senderId?: string,
  imageUrl?: string
) => {
  try {
    console.log(`Sending admin notification: ${message}`);
    
    // First, find all admin users
    const { data: adminRoles, error: rolesError } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");
    
    if (rolesError) {
      console.error("Error fetching admin users:", rolesError);
      throw rolesError;
    }
    
    if (!adminRoles || adminRoles.length === 0) {
      console.log("No admin users found to notify");
      return;
    }
    
    console.log(`Found ${adminRoles.length} admin users to notify`);
    
    // Create notifications for each admin user
    const notifications = adminRoles.map(admin => ({
      recipient_id: admin.user_id,
      type,
      message,
      reference_id: referenceId,
      sender_id: senderId,
      is_read: false,
      image_url: imageUrl
    }));
    
    const { data, error } = await supabase.from("notifications").insert(notifications);
    
    if (error) {
      console.error("Error sending admin notifications:", error);
      throw error;
    }
    
    console.log(`Admin notifications sent successfully to ${adminRoles.length} admins`);
    return data;
  } catch (error) {
    console.error("Error sending admin notification:", error);
    throw error;
  }
};
