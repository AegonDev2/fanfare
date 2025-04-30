
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { sendAdminNotification } from "@/utils/notifications";
import type { GiftRequest } from "./useGiftRequests";

interface InfluencerAddress {
  id: string;
  street_address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_primary: boolean;
  influencer_id: string;
  created_at: string;
  name?: string;
  address_line2?: string;
  phone?: string;
}

interface Address {
  name?: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
}

export const useGiftRequestActions = (
  requests: GiftRequest[], 
  setRequests: React.Dispatch<React.SetStateAction<GiftRequest[]>>
) => {
  const { toast } = useToast();

  const updateRequestStatus = async (id: string, status: 'accepted' | 'rejected') => {
    try {
      // Update gift_request row status, and create order for accepted
      const { error } = await supabase
        .from('gift_requests')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      setRequests(prev =>
        prev.map(request =>
          request.id === id ? { ...request, status } : request
        )
      );

      if (status === 'accepted') {
        // Influencer accepted: create order with status "under_process"
        const request = requests.find(r => r.id === id);
        if (request) {
          console.log("Processing accepted gift request:", request);
          
          const { data: addressData, error: addressError } = await supabase
            .from('influencer_addresses')
            .select('*')
            .eq('influencer_id', request.influencer_id)
            .eq('is_primary', true)
            .single();

          if (addressError) {
            console.error("Address error:", addressError);
            throw new Error('Could not find shipping address');
          }
          const influencerAddress = addressData as InfluencerAddress;

          const shippingAddress = {
            name: influencerAddress.name || "Recipient",
            address_line1: influencerAddress.street_address,
            address_line2: influencerAddress.address_line2 || "",
            city: influencerAddress.city,
            state: influencerAddress.state,
            postal_code: influencerAddress.postal_code,
            country: influencerAddress.country || "India",
            phone: influencerAddress.phone || "Not provided"
          };

          console.log("Creating order with shipping address:", shippingAddress);

          // Create an order entry in orders_under_process table
          const { data: orderData, error: orderError } = await supabase
            .from('orders_under_process')
            .insert({
              influencer_id: request.influencer_id,
              user_id: request.sender.id,
              product_url: request.product_url,
              product_title: request.product_title || "Gift from fan",
              product_price: request.product_price,
              shipping_address: shippingAddress,
              message: request.message
            })
            .select()
            .single();

          if (orderError) {
            console.error("Failed to create order in orders_under_process:", orderError);
            throw new Error('Could not create order for admin processing');
          }

          console.log("Order created successfully:", orderData);

          // Update the gift_request status to under_process
          const { error: updateStatusError } = await supabase
            .from('gift_requests')
            .update({ 
              status: 'under_process',
              platform_fee: orderData.platform_fee,
              total_amount: orderData.total_amount
            })
            .eq('id', id);
            
          if (updateStatusError) {
            console.error("Failed to update gift request status to under_process:", updateStatusError);
          }

          // Send notification to admin about new approved gift
          await sendAdminNotification(
            'new_approved_gift',
            `New gift order approved by influencer and ready for processing`,
            orderData.id,
            request.sender.id
          );

          // Notify the fan that their gift request was approved
          await supabase.from("notifications").insert({
            recipient_id: request.sender.id,
            type: "gift_request_approved",
            message: `Your gift request has been approved by the influencer and is being processed.`,
            reference_id: orderData.id,
            sender_id: request.influencer_id
          });
          
          console.log("Notifications sent successfully");
        }
      } else if (status === 'rejected') {
        // If rejected, notify the fan
        const request = requests.find(r => r.id === id);
        if (request) {
          await supabase.from("notifications").insert({
            recipient_id: request.sender.id,
            type: "gift_request_rejected",
            message: `Your gift request has been rejected by the influencer.`,
            reference_id: id,
            sender_id: request.influencer_id
          });
        }
      }

      toast({
        title: "Success",
        description: `Gift request ${status === 'accepted' ? 'approved' : 'rejected'} successfully!`,
      });
    } catch (error: any) {
      console.error("Error updating gift request status:", error);
      toast({
        title: "Error",
        description: `Failed to ${status === 'accepted' ? 'approve' : 'reject'} gift request: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  return { updateRequestStatus };
};
