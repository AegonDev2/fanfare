
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://giftloop-connect.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpZnRsb29wLWNvbm5lY3QiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTcwNzU1Mjc4MCwiZXhwIjoyMDIzMTI4NzgwfQ.Wf_GhmGD8lnz_kX6NU_0HRlqJ6Ycg_lNshcqQ3CMdlQ';

export const supabase = createClient(supabaseUrl, supabaseKey);
