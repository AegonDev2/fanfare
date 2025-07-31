import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCallback } from "react";

/**
 * Enhanced security manager for handling sensitive operations
 */
export class SecurityManager {
  private static instance: SecurityManager;
  
  private constructor() {}
  
  static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager();
    }
    return SecurityManager.instance;
  }

  /**
   * Verify if current user has admin privileges with enhanced security
   */
  async verifyAdminAccess(): Promise<boolean> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        await this.logSecurityEvent('ADMIN_ACCESS_DENIED', 'No authenticated user');
        return false;
      }

      // Use the secure database function to verify admin access
      const { data, error } = await supabase.rpc('verify_admin_access');
      
      if (error) {
        await this.logSecurityEvent('ADMIN_VERIFICATION_ERROR', `Database error: ${error.message}`);
        return false;
      }
      
      return data === true;
    } catch (error) {
      await this.logSecurityEvent('ADMIN_ACCESS_EXCEPTION', `Unexpected error: ${error}`);
      return false;
    }
  }

  /**
   * Create a secure admin session token
   */
  async createSecureAdminSession(): Promise<string | null> {
    try {
      const { data, error } = await supabase.rpc('create_admin_session_token');
      
      if (error) {
        await this.logSecurityEvent('ADMIN_SESSION_ERROR', `Failed to create session: ${error.message}`);
        return null;
      }
      
      return data;
    } catch (error) {
      await this.logSecurityEvent('ADMIN_SESSION_EXCEPTION', `Unexpected error: ${error}`);
      return null;
    }
  }

  /**
   * Log security events for monitoring
   */
  async logSecurityEvent(action: string, details: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Insert security log entry
      await supabase.from('audit_logs').insert({
        user_id: user?.id || null,
        action: `SECURITY_${action}`,
        table_name: 'security_events',
        new_values: {
          details,
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent,
          ip_address: 'client_side' // Note: Real IP would come from server
        }
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  /**
   * Check for suspicious activity patterns
   */
  async detectSuspiciousActivity(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return false;
      
      // Check for multiple failed admin access attempts in the last hour
      const { data: recentEvents, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('action', 'SECURITY_ADMIN_ACCESS_DENIED')
        .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())
        .limit(5);
      
      if (error) {
        console.error('Error checking suspicious activity:', error);
        return false;
      }
      
      const suspiciousThreshold = 3;
      const isSuspicious = (recentEvents?.length || 0) >= suspiciousThreshold;
      
      if (isSuspicious) {
        await this.logSecurityEvent('SUSPICIOUS_ACTIVITY_DETECTED', 
          `Multiple failed admin attempts: ${recentEvents?.length}`);
      }
      
      return isSuspicious;
    } catch (error) {
      console.error('Error in suspicious activity detection:', error);
      return false;
    }
  }

  /**
   * Rate limiting for sensitive operations
   */
  async checkRateLimit(operation: string, maxAttempts: number = 5, windowMinutes: number = 15): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return false;
      
      const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString();
      
      const { data: attempts, error } = await supabase
        .from('audit_logs')
        .select('id')
        .eq('user_id', user.id)
        .eq('action', `RATE_LIMIT_${operation}`)
        .gte('created_at', windowStart);
      
      if (error) {
        console.error('Error checking rate limit:', error);
        return false; // Fail safe: allow operation if we can't check
      }
      
      const currentAttempts = attempts?.length || 0;
      
      // Log the attempt
      await supabase.from('audit_logs').insert({
        user_id: user.id,
        action: `RATE_LIMIT_${operation}`,
        table_name: 'rate_limiting',
        new_values: { 
          attempt: currentAttempts + 1,
          max_attempts: maxAttempts,
          window_minutes: windowMinutes
        }
      });
      
      return currentAttempts < maxAttempts;
    } catch (error) {
      console.error('Error in rate limiting:', error);
      return true; // Fail safe: allow operation if error occurs
    }
  }
}

/**
 * React hook for enhanced security operations
 */
export const useSecurityManager = () => {
  const { toast } = useToast();
  const securityManager = SecurityManager.getInstance();
  
  const verifyAdminWithFeedback = useCallback(async (): Promise<boolean> => {
    try {
      // Check for suspicious activity first
      const isSuspicious = await securityManager.detectSuspiciousActivity();
      
      if (isSuspicious) {
        toast({
          title: "Security Alert",
          description: "Suspicious activity detected. Please contact support if this is a legitimate request.",
          variant: "destructive",
        });
        return false;
      }
      
      // Check rate limiting
      const isWithinLimit = await securityManager.checkRateLimit('ADMIN_VERIFICATION', 50, 60);
      
      if (!isWithinLimit) {
        toast({
          title: "Rate Limit Exceeded",
          description: "Too many admin verification attempts. Please wait before trying again.",
          variant: "destructive",
        });
        return false;
      }
      
      // Verify admin access
      const isAdmin = await securityManager.verifyAdminAccess();
      
      if (!isAdmin) {
        toast({
          title: "Access Denied",
          description: "You do not have administrator privileges.",
          variant: "destructive",
        });
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Security verification error:", error);
      toast({
        title: "Security Error",
        description: "An error occurred during security verification.",
        variant: "destructive",
      });
      return false;
    }
  }, [toast, securityManager]);
  
  return {
    verifyAdminWithFeedback,
    securityManager
  };
};