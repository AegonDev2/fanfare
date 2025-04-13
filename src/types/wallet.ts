
export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  wallet_id: string;
  amount: number;
  type: "deposit" | "payment" | "refund";
  status: "pending" | "completed" | "failed";
  description: string;
  reference_id?: string;
  created_at: string;
}

export interface TopUpFormData {
  amount: number;
  paymentMethod: "credit_card" | "upi" | "netbanking";
}
