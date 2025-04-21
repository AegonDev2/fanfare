
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
