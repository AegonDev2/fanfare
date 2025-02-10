
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gptengineerpublic.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwdGVuZ2luZWVycHVibGljIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTkyNzk5NDQsImV4cCI6MjAxNDg1NTk0NH0.HfDY4LVK1CN83qvH4oByJJHKKvqFR4YdBbGRJXJEGHo';

export const supabase = createClient(supabaseUrl, supabaseKey);
