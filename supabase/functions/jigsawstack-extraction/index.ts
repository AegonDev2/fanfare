
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "./utils/corsHeaders.ts";
import { detectPlatform, getElementPrompts, getSelectors } from "./utils/platformDetection.ts";
import { isErrorPage } from "./utils/errorDetection.ts";
import { extractProductData } from "./utils/dataExtraction.ts";
import { fetchJigsawStack } from "./services/jigsawstack.ts";
import { fallbackToBuildship } from "./services/buildship.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    } catch (aiError) {
      console.error("AI scraping failed:", aiError);
      
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
