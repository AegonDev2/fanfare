-- Clear rate limiting entries for admin verification to fix the loop issue
DELETE FROM audit_logs 
WHERE action = 'RATE_LIMIT_ADMIN_VERIFICATION' 
AND user_id = '724ce941-97c5-4b7d-b0ba-7ee9bd1df237';

-- Optional: Clear all rate limiting entries older than 1 hour to prevent future accumulation
DELETE FROM audit_logs 
WHERE action LIKE 'RATE_LIMIT_%' 
AND created_at < now() - interval '1 hour';