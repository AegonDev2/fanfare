
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const JIGSAWSTACK_URL = "https://api.jigsawstack.com/v1";
const apiKey = Deno.env.get("JIGSAWSTACK_API_KEY");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to interact with JigsawStack APIs
const fetchJigsawStack = async (path, body) => {
  try {
    const headers = {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    };

    console.log(`Making request to ${JIGSAWSTACK_URL}${path} with body:`, JSON.stringify(body));
    
    const res = await fetch(`${JIGSAWSTACK_URL}${path}`, {
      headers,
      method: "POST",
      body: JSON.stringify(body),
    });

    console.log(`JigsawStack API response status: ${res.status}`);
    
    const responseJson = await res.json();
    
    if (!res.ok) {
      console.error("JigsawStack API error:", responseJson);
      throw new Error(responseJson?.message || `Error from JigsawStack API: ${res.status}`);
    }

    return responseJson;
  } catch (error) {
    console.error("Error in fetchJigsawStack:", error);
    throw error;
  }
};

// Check if response is an error page
const isErrorPage = (response) => {
  // Check for Amazon error page indicators
  if (response.link && response.link.some(link => 
      link.href && (
        link.href.includes('ref=cs_503') || 
        link.href.includes('ref=cs_500') ||
        link.href.includes('ref=cs_404')
      )
    )) {
    console.log("Detected Amazon error page (503/500/404)");
    return true;
  }
  
  // Check for empty data and selectors
  if (
    (!response.data || response.data.length === 0) && 
    response.selectors && 
    (!response.selectors.product_title || response.selectors.product_title.length === 0) &&
    (!response.selectors.product_price || response.selectors.product_price.length === 0)
  ) {
    console.log("Detected empty response with no product data");
    return true;
  }
  
  return false;
};

// Get element prompts based on platform
const getElementPrompts = (platform) => {
  if (platform === 'amazon' || platform === 'flipkart') {
    return ["product_title", "product_price"];
  }
  return [];
};

// Get CSS selectors for fallback
const getSelectors = (platform) => {
  if (platform === 'amazon') {
    return [
      { selector: "#productTitle" }, // title
      { selector: ".a-price-whole" } // price
    ];
  } else if (platform === 'flipkart') {
    return [
      { selector: "h1 span" }, // title
      { selector: "div._30jeq3._16Jk6d" } // price
    ];
  }
  return [];
};

// Detect the platform from URL
const detectPlatform = (url) => {
  if (url.includes('amazon') || url.includes('amzn.')) {
    return 'amazon';
  }
  if (url.includes('flipkart')) {
    return 'flipkart';
  }
  return 'other';
};

// Extract product data from different response formats
const extractProductData = (response, platform) => {
  console.log("Extracting product data from response format:", response);
  
  // If the response has data in the traditional format
  if (response.data && Array.isArray(response.data)) {
    const productTitle = response.data.find(d => 
      d.element_prompt === "product_title" && d.results?.length > 0
    )?.results[0]?.text?.trim() || "";

    const productPrice = response.data.find(d => 
      d.element_prompt === "product_price" && d.results?.length > 0
    )?.results[0]?.text?.trim() || "0";
    
    return { name: productTitle, price: productPrice };
  }
  
  // If the response has data in the context format (Flipkart)
  if (response.context) {
    const title = response.context.product_title && 
                  response.context.product_title.length > 0 ? 
                  response.context.product_title[0] : "";
                  
    // For price, take the first value which is usually the current price
    const price = response.context.product_price && 
                  response.context.product_price.length > 0 ? 
                  response.context.product_price[0] : "0";
    
    return { name: title, price: price };
  }
  
  // Fallback for selector-based extraction
  if (response.selectors) {
    let title = "";
    let price = "0";
    
    // Try to extract from selectors results
    try {
      if (platform === 'flipkart' && response.selectors.product_title) {
        // For Flipkart: use the first selector result
        title = response.selectors.product_title[0] || "";
        price = response.selectors.product_price ? 
                response.selectors.product_price[0] || "0" : "0";
      }
    } catch (error) {
      console.error("Error extracting from selectors:", error);
    }
    
    return { name: title, price: price };
  }
  
  // If nothing works, return empty data
  return { name: "", price: "0" };
};

// Fallback to Buildship extraction for Amazon products
const fallbackToBuildship = async (url, platform) => {
  console.log("Falling back to Buildship extraction service");
  
  try {
    // Call the buildship-extraction function
    const buildshipUrl = Deno.env.get("SUPABASE_URL") + "/functions/v1/buildship-extraction";
    
    console.log(`Calling Buildship extraction at ${buildshipUrl}`);
    
    const response = await fetch(buildshipUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
      },
      body: JSON.stringify({ 
        url: url,
        platform: platform,
        retryCount: 0
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Buildship request failed with status: ${response.status}`);
      console.error(`Error details: ${errorText}`);
      throw new Error("Buildship extraction failed");
    }

    const buildshipData = await response.json();
    console.log("Buildship extraction result:", buildshipData);
    
    return buildshipData;
  } catch (error) {
    console.error("Error in Buildship fallback:", error);
    throw error;
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!apiKey) {
      console.error("Missing JigsawStack API key");
      throw new Error("JigsawStack API key not configured");
    }

    const { url } = await req.json();
    
    if (!url) {
      console.error("No URL provided");
      throw new Error("URL is required");
    }

    console.log(`Starting extraction for URL: ${url}`);

    const platform = detectPlatform(url);
    console.log(`Detected platform: ${platform}`);

    let extractionResult = null;
    let extractionSource = "";

    // First try the AI-based scraping
    try {
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

      // Check if we got an error page
      if (isErrorPage(aiScrapeResponse)) {
        console.log("Detected error page response, trying fallback");
        
        // For Amazon, try Buildship directly
        if (platform === 'amazon') {
          const buildshipResult = await fallbackToBuildship(url, platform);
          return new Response(
            JSON.stringify(buildshipResult),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // For others, try CSS selector approach
        throw new Error("Error page detected, trying selector fallback");
      }

      // Extract product data using our helper function
      const productData = extractProductData(aiScrapeResponse, platform);
      console.log("Extracted with AI scraping - Title:", productData.name, "Price:", productData.price);

      // If title is empty and it's an Amazon link, try Buildship
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

    } catch (aiError) {
      console.error("AI scraping failed:", aiError);
      
      // For Amazon, try Buildship as second fallback
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
      
      // If not Amazon or Buildship failed, fall back to CSS selectors
      console.log("Falling back to CSS selectors");
      
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

      // Extract product data using our helper function
      const productData = extractProductData(scrapeResponse, platform);
      
      extractionResult = {
        name: productData.name || "Product Title Not Found",
        price: productData.price || "0",
        platform: platform
      };
      
      extractionSource = "jigsawstack-css";
    }

    console.log("Final extracted product data:", extractionResult);

    return new Response(
      JSON.stringify({
        success: true,
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
