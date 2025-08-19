
import { useAuth } from "@/contexts/SimpleAuthContext";

export interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  user_type: string;
}

export const useUser = () => {
  const { profile, isLoading } = useAuth();
  
  return { 
    user: profile, 
    isLoading 
  };
};
