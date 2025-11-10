import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.10';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Processing pending extraction jobs...');

    // Get pending jobs
    const { data: jobs, error: fetchError } = await supabaseClient
      .from('extraction_jobs')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(10);

    if (fetchError) {
      console.error('Error fetching jobs:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${jobs?.length || 0} pending jobs`);

    const results = {
      processed: 0,
      failed: 0,
      errors: [] as string[]
    };

    // Process each job
    for (const job of jobs || []) {
      try {
        console.log(`Processing job ${job.id} for URL: ${job.product_url}`);
        
        // Call the extraction function
        const { data: extractionData, error: extractionError } = await supabaseClient.functions.invoke(
          'jigsawstack-extraction',
          {
            body: { url: job.product_url, async: false }
          }
        );

        if (extractionError || !extractionData?.success) {
          throw new Error(extractionError?.message || 'Extraction failed');
        }

        // Update job status
        await supabaseClient
          .from('extraction_jobs')
          .update({
            status: 'completed',
            result: extractionData,
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', job.id);

        results.processed++;
        console.log(`✅ Job ${job.id} processed successfully`);
      } catch (error) {
        console.error(`❌ Error processing job ${job.id}:`, error);
        
        await supabaseClient
          .from('extraction_jobs')
          .update({
            status: 'failed',
            error: error.message,
            updated_at: new Date().toISOString()
          })
          .eq('id', job.id);

        results.failed++;
        results.errors.push(`Job ${job.id}: ${error.message}`);
      }
    }

    console.log(`Processed ${results.processed} jobs, ${results.failed} failed`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        ...results,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error in process-extraction-jobs function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
