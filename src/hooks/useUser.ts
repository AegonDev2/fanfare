
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  user_type: string;
}

export const useUser = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change:", event, session?.user?.id);
      
      if (session === null) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      // Defer fetching profile with setTimeout to avoid deadlocks
      setTimeout(async () => {
        try {
          const { data: profile, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .maybeSingle();

          if (error) {
            console.error("Error fetching profile:", error);
            setUser(null);
          } else {
            console.log("Profile fetched:", profile);
            setUser(profile);
          }
        } catch (error) {
          console.error("Error in profile fetch:", error);
          setUser(null);
        } finally {
          setIsLoading(false);
        }
      }, 0);
    });

    // THEN check for existing session
    const fetchUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          console.log("Existing session found:", session.user.id);
          const { data: profile, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .maybeSingle();

          if (error) {
            console.error("Error fetching profile:", error);
            setUser(null);
          } else {
            console.log("Profile loaded:", profile);
            setUser(profile);
          }
        } else {
          console.log("No existing session found");
          setUser(null);
        }
      } catch (error) {
        console.error("Error checking session:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { user, isLoading };
};
