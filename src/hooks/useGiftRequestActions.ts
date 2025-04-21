
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
        const request = requests.find(r => r.id === id);
        if (request) {
          const { data: addressData, error: addressError } = await supabase
            .from('influencer_addresses')
            .select('*')
            .eq('influencer_id', request.influencer_id)
            .eq('is_primary', true)
            .single();

          if (addressError) {
            throw new Error('Could not find shipping address');
          }
          const influencerAddress = addressData as InfluencerAddress;

          const shippingAddress: Address = {
            name: influencerAddress.name || "Recipient",
            address_line1: influencerAddress.street_address,
            address_line2: influencerAddress.address_line2 || "",
            city: influencerAddress.city,
            state: influencerAddress.state,
            postal_code: influencerAddress.postal_code,
            country: influencerAddress.country || "India",
            phone: influencerAddress.phone || "Not provided"
          };

          // Create an order entry for admin to process
          const { data: orderData, error: orderError } = await supabase
            .from('orders')
            .insert({
              influencer_id: request.influencer_id,
              user_id: request.sender.id,
              product_url: request.product_url,
              product_title: request.product_title || "Gift from fan",
              product_price: request.product_price,
              status: 'accepted',
              shipping_address: shippingAddress,
              message: request.message
            })
            .select()
            .single();

          if (orderError) {
            throw new Error('Could not create order for admin');
          }

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
        }
      } else if (status === 'rejected') {
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
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${status === 'accepted' ? 'approve' : 'reject'} gift request`,
        variant: "destructive",
      });
    }
  };

  return { updateRequestStatus };
};
