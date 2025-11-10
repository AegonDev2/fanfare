
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.10';
import { corsHeaders } from "./utils/corsHeaders.ts";
import { detectPlatform, getElementPrompts, getSelectors } from "./utils/platformDetection.ts";
import { isErrorPage } from "./utils/errorDetection.ts";
import { extractProductData } from "./utils/dataExtraction.ts";
import { fetchJigsawStack } from "./services/jigsawstack.ts";
import { fallbackToBuildship } from "./services/buildship.ts";

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, async: asyncMode = false } = await req.json();
    
    if (!url) {
      console.error("No URL provided");
      throw new Error("URL is required");
    }

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    // Check cache first
    console.log(`Checking cache for URL: ${url}`);
    const { data: cachedData, error: cacheError } = await supabaseClient
      .from('product_extractions')
      .select('*')
      .eq('product_url', url)
      .gte('expires_at', new Date().toISOString())
      .single();

    if (cachedData && !cacheError) {
      console.log('✅ Cache hit - returning cached data');
      return new Response(
        JSON.stringify({
          success: true,
          cached: true,
          productData: cachedData.product_data,
          screenshot_url: cachedData.screenshot_url,
          timestamp: new Date().toISOString()
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('❌ Cache miss - performing extraction');

    // If async mode, create job and return immediately
    if (asyncMode) {
      const { data: job, error: jobError } = await supabaseClient
        .from('extraction_jobs')
        .insert({
          product_url: url,
          status: 'pending'
        })
        .select()
        .single();

      if (jobError) throw jobError;

      // Start background extraction
      // @ts-ignore
      EdgeRuntime.waitUntil(performBackgroundExtraction(url, job.id, supabaseClient));

      return new Response(
        JSON.stringify({
          success: true,
          async: true,
          job_id: job.id,
          message: 'Extraction started in background',
          timestamp: new Date().toISOString()
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Starting synchronous extraction for URL: ${url}`);

    const platform = detectPlatform(url);
    console.log(`Detected platform: ${platform}`);

    let extractionResult = null;
    let extractionSource = "";

    try {
      // For souledstore, try non-AI scraping first
      if (platform === 'souledstore') {
        console.log("Trying CSS selectors first for SouledStore...");
        
        const elements = getSelectors(platform);
        
        const requestBody = {
          url: url,
          elements: elements
        };

        console.log("Making request to JigsawStack scrape API with selectors for SouledStore...");
        const scrapeResponse = await fetchJigsawStack("/scrape", requestBody);
        console.log("Raw JigsawStack response for SouledStore:", scrapeResponse);

        if (isErrorPage(scrapeResponse)) {
          throw new Error("Error page detected or no data found, trying AI fallback for SouledStore");
        }

        const productData = extractProductData(scrapeResponse, platform);
        
        if (!productData.name || productData.name === "") {
          throw new Error("Empty product name, trying AI fallback for SouledStore");
        }
        
        console.log("Successfully extracted SouledStore data using CSS selectors:", productData);
        
        extractionResult = {
          name: productData.name,
          price: productData.price,
          platform: platform
        };
        
        extractionSource = "jigsawstack-css";
      } else {
        // For other platforms, start with AI-based scraping
        console.log("Attempting AI-based scraping first...");
        const elementPrompts = getElementPrompts(platform);
        
        if (elementPrompts.length === 0) {
          throw new Error("Unsupported platform for AI scraping");
        }

        const aiRequestBody = {
          url: url,
          element_prompts: elementPrompts
        };

        console.log("Making request to JigsawStack AI scrape API...");
        const aiScrapeResponse = await fetchJigsawStack("/ai/scrape", aiRequestBody);
        console.log("AI Scrape response:", aiScrapeResponse);

        if (isErrorPage(aiScrapeResponse)) {
          console.log("Detected error page response, trying fallback");
          
          if (platform === 'amazon') {
            const buildshipResult = await fallbackToBuildship(url, platform);
            return new Response(
              JSON.stringify(buildshipResult),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          
          throw new Error("Error page detected, trying selector fallback");
        }

        const productData = extractProductData(aiScrapeResponse, platform);
        console.log("Extracted with AI scraping - Title:", productData.name, "Price:", productData.price);

        if ((!productData.name || productData.name === "") && platform === 'amazon') {
          console.log("Empty title detected for Amazon product, trying Buildship fallback");
          const buildshipResult = await fallbackToBuildship(url, platform);
          return new Response(
            JSON.stringify(buildshipResult),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        extractionResult = {
          name: productData.name,
          price: productData.price,
          platform: platform
        };
        extractionSource = "jigsawstack-ai";
      }
    } catch (aiError) {
      console.error("Initial scraping failed:", aiError);
      
      if (platform === 'amazon') {
        try {
          console.log("Trying Buildship for Amazon products");
          const buildshipResult = await fallbackToBuildship(url, platform);
          return new Response(
            JSON.stringify(buildshipResult),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } catch (buildshipError) {
          console.error("Buildship fallback failed:", buildshipError);
        }
      }
      
      if (platform === 'souledstore' && extractionSource !== "jigsawstack-ai") {
        // If we're here for souledstore and we haven't tried AI yet, try AI scraping
        console.log("Falling back to AI scraping for SouledStore");
        
        const elementPrompts = getElementPrompts(platform);
        
        const aiRequestBody = {
          url: url,
          element_prompts: elementPrompts
        };

        console.log("Making request to JigsawStack AI scrape API for SouledStore fallback...");
        const aiScrapeResponse = await fetchJigsawStack("/ai/scrape", aiRequestBody);
        console.log("AI Scrape response for SouledStore fallback:", aiScrapeResponse);

        const productData = extractProductData(aiScrapeResponse, platform);
        
        extractionResult = {
          name: productData.name || "Product Title Not Found",
          price: productData.price || "0",
          platform: platform
        };
        
        extractionSource = "jigsawstack-ai-fallback";
      } else {
        console.log("Falling back to CSS selectors for non-souledstore");
        
        const elements = getSelectors(platform);
        
        if (elements.length === 0) {
          console.error("Unsupported platform");
          throw new Error("Unsupported platform");
        }

        const requestBody = {
          url: url,
          elements: elements
        };

        console.log("Making request to JigsawStack scrape API with selectors...");
        const scrapeResponse = await fetchJigsawStack("/scrape", requestBody);
        console.log("Raw JigsawStack response:", scrapeResponse);

        const productData = extractProductData(scrapeResponse, platform);
        
        extractionResult = {
          name: productData.name || "Product Title Not Found",
          price: productData.price || "0",
          platform: platform
        };
        
        extractionSource = "jigsawstack-css";
      }
    }

    console.log("Final extracted product data:", extractionResult);

    // Cache the successful extraction
    await supabaseClient
      .from('product_extractions')
      .upsert({
        product_url: url,
        product_data: extractionResult,
        updated_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }, {
        onConflict: 'product_url'
      });

    console.log('✅ Extraction cached successfully');

    return new Response(
      JSON.stringify({
        success: true,
        cached: false,
        productData: extractionResult,
        source: extractionSource,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Extraction error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 400
      }
    );
  }
});

// Background extraction function
async function performBackgroundExtraction(url: string, jobId: string, supabaseClient: any) {
  try {
    console.log(`Background extraction started for job ${jobId}`);
    
    const platform = detectPlatform(url);
    console.log(`Detected platform: ${platform}`);

    let extractionResult = null;
    let extractionSource = "";

    try {
      if (platform === 'souledstore') {
        const elements = getSelectors(platform);
        const requestBody = { url, elements };
        const scrapeResponse = await fetchJigsawStack("/scrape", requestBody);
        
        if (!isErrorPage(scrapeResponse)) {
          const productData = extractProductData(scrapeResponse, platform);
          if (productData.name && productData.name !== "") {
            extractionResult = {
              name: productData.name,
              price: productData.price,
              platform: platform
            };
            extractionSource = "jigsawstack-css";
          }
        }
      }
      
      if (!extractionResult) {
        const elementPrompts = getElementPrompts(platform);
        const aiRequestBody = { url, element_prompts: elementPrompts };
        const aiScrapeResponse = await fetchJigsawStack("/ai/scrape", aiRequestBody);
        
        if (!isErrorPage(aiScrapeResponse)) {
          const productData = extractProductData(aiScrapeResponse, platform);
          extractionResult = {
            name: productData.name,
            price: productData.price,
            platform: platform
          };
          extractionSource = "jigsawstack-ai";
        }
      }
    } catch (error) {
      console.error("Background extraction error:", error);
      throw error;
    }

    if (!extractionResult) {
      throw new Error("Failed to extract product data");
    }

    // Update job status
    await supabaseClient
      .from('extraction_jobs')
      .update({
        status: 'completed',
        result: extractionResult,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId);

    // Cache the result
    await supabaseClient
      .from('product_extractions')
      .upsert({
        product_url: url,
        product_data: extractionResult,
        updated_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }, {
        onConflict: 'product_url'
      });

    console.log(`✅ Background extraction completed for job ${jobId}`);
  } catch (error) {
    console.error(`❌ Background extraction failed for job ${jobId}:`, error);
    
    await supabaseClient
      .from('extraction_jobs')
      .update({
        status: 'failed',
        error: error.message,
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId);
  }
}
