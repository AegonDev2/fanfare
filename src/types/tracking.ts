export type OrderStatus = 
  | 'order_placed'
  | 'waiting_admin_approval'
  | 'waiting_acceptance'
  | 'accepted'
  | 'rejected'
  | 'completed'
  | 'cancelled';

export interface TrackingOrder {
  id: string;
  status: OrderStatus;
  created_at: string;
  product_url: string;
  product_title: string | null;
  product_price: number | null;
  total_amount: number | null;
  message: string | null;
  delivery_estimate?: string | null;
  completed_at?: string | null;
  rejected_at?: string | null;
  rejection_reason?: string | null;
  user_id: string;
  influencer_id: string;
  influencer?: { 
    id: string;
    name: string; 
  } | null;
  profiles?: { 
    email: string;
    name: string | null;
  } | null;
  can_cancel?: boolean;
}

export const ORDER_STATUS_CONFIG = {
  order_placed: { 
    label: "Order Placed", 
    description: "Your order has been placed and is waiting for admin review",
    color: "bg-blue-100 text-blue-800"
  },
  waiting_admin_approval: { 
    label: "Waiting Admin Approval", 
    description: "Order is being reviewed by our admin team",
    color: "bg-yellow-100 text-yellow-800"
  },
  waiting_acceptance: { 
    label: "Waiting for Acceptance", 
    description: "Order approved by admin, waiting for influencer's response",
    color: "bg-purple-100 text-purple-800"
  },
  accepted: { 
    label: "Accepted", 
    description: "Influencer has accepted the gift request",
    color: "bg-green-100 text-green-800"
  },
  completed: { 
    label: "Delivered", 
    description: "Your gift has been delivered successfully",
    color: "bg-green-100 text-green-800"
  },
  rejected: { 
    label: "Rejected", 
    description: "Order was rejected",
    color: "bg-red-100 text-red-800"
  },
  cancelled: { 
    label: "Cancelled", 
    description: "Order was cancelled",
    color: "bg-gray-100 text-gray-800"
  }
};