
import { useState, useEffect } from "react";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";

export interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  user_type: string;
}

export const useUser = () => {
  const { user: firebaseUser, loading } = useFirebaseAuth();
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (firebaseUser) {
      setUser({
        id: firebaseUser.uid,
        name: firebaseUser.displayName,
        email: firebaseUser.email || '',
        user_type: 'fan' // Default to fan for Firebase users
      });
    } else {
      setUser(null);
    }
  }, [firebaseUser]);

  return { user, isLoading: loading };
};
