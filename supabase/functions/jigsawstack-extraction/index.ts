
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const JIGSAWSTACK_URL = "https://api.jigsawstack.com/v1";
const apiKey = Deno.env.get("JIGSAWSTACK_API_KEY");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to interact with JigsawStack APIs
const fetchJigsawStack = async (path: string, body: any) => {
  const headers = {
    "Content-Type": "application/json",
    "x-api-key": apiKey!,
  };

  const res = await fetch(`${JIGSAWSTACK_URL}${path}`, {
    headers,
    method: "POST",
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorObj = await res.json();
    throw new Error(errorObj?.message || "Something went wrong with JigsawStack API");
  }

  return res.json();
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!apiKey) {
      throw new Error("JigsawStack API key not configured");
    }

    const { url } = await req.json();
    
    if (!url) {
      throw new Error("URL is required");
    }

    console.log(`Starting extraction for URL: ${url}`);

    const platform = detectPlatform(url);
    console.log(`Detected platform: ${platform}`);

    // Define prompts based on platform
    const elementPrompts = ["product title", "product price"];

    const requestBody = {
      url: url,
      element_prompts: elementPrompts
    };

    console.log("Making request to JigsawStack API...");
    const scrapeResponse = await fetchJigsawStack("/ai/scrape", requestBody);
    console.log("Raw JigsawStack response:", scrapeResponse);

    if (!scrapeResponse.data) {
      throw new Error("No data returned from JigsawStack");
    }

    const extractedData = {
      name: "",
      price: "0",
      platform: platform
    };

    // Process the scraped data
    scrapeResponse.data.forEach((item: any) => {
      if (item.results && item.results.length > 0) {
        if (item.element_prompt === "product title") {
          extractedData.name = item.results[0].text || "";
        } else if (item.element_prompt === "product price") {
          extractedData.price = item.results[0].text || "0";
        }
      }
    });

    console.log("Transformed product data:", extractedData);

    return new Response(
      JSON.stringify({
        success: true,
        productData: extractedData,
        source: "jigsawstack",
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

function detectPlatform(url: string): 'amazon' | 'flipkart' | 'other' {
  if (url.includes('amazon') || url.includes('amzn.')) {
    return 'amazon';
  }
  if (url.includes('flipkart')) {
    return 'flipkart';
  }
  return 'other';
}
