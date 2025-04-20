
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

console.log("Jigsawstack product extraction service started");

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204, 
      headers: corsHeaders 
    });
  }

  try {
    const { url } = await req.json();
    
    if (!url) {
      throw new Error("URL is required");
    }

    console.log(`Starting Jigsawstack extraction for URL: ${url}`);
    
    const apiKey = Deno.env.get("JIGSAWSTACK_API_KEY");
    if (!apiKey) {
      throw new Error("Jigsawstack API key not configured");
    }

    const platform = detectPlatform(url);
    console.log(`Detected platform: ${platform}`);

    const scrapeResponse = await fetch("https://api.jigsawstack.com/v1/scrape", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        url,
        selectors: getPlatformSelectors(platform)
      })
    });

    if (!scrapeResponse.ok) {
      const errorText = await scrapeResponse.text();
      console.error(`Jigsawstack API error: ${scrapeResponse.status}`);
      console.error(`Error details: ${errorText}`);
      throw new Error(`Extraction failed: ${scrapeResponse.status} ${scrapeResponse.statusText}`);
    }

    const data = await scrapeResponse.json();
    console.log("Raw scraped data:", data);

    const extractedProduct = transformProductData(data, platform);
    console.log("Transformed product data:", extractedProduct);

    return new Response(
      JSON.stringify({
        success: true,
        productData: extractedProduct,
        source: "jigsawstack",
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200
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

function getPlatformSelectors(platform: string) {
  // Focus only on title and price selectors
  const commonSelectors = {
    title: [
      'h1',
      'meta[property="og:title"]',
      'meta[name="title"]'
    ]
  };

  const platformSpecificSelectors = {
    amazon: {
      ...commonSelectors,
      price: [
        '#priceblock_ourprice',
        '.a-price .a-offscreen',
        '#price_inside_buybox',
        '#newPitchPriceWrapper_feature_div .a-price .a-offscreen',
        'span[data-a-color="price"] span.a-offscreen',
        '#corePrice_feature_div .a-offscreen'
      ]
    },
    flipkart: {
      ...commonSelectors,
      price: [
        '._30jeq3',
        '.CEmiEU',
        '.dyC4hf',
        '.CEmiEU ._30jeq3',
        '[class*="price"]'
      ]
    },
    other: commonSelectors
  };

  return platformSpecificSelectors[platform as keyof typeof platformSpecificSelectors] || commonSelectors;
}

function transformProductData(data: any, platform: string) {
  if (!data || !data.data) {
    console.error("Invalid data structure returned from Jigsawstack");
    return {
      name: "Product information not available",
      price: "0",
      platform: platform
    };
  }

  const scrapeData = data.data;
  console.log("Full scrape data structure:", JSON.stringify(scrapeData));

  const productName = Array.isArray(scrapeData.title) && scrapeData.title.length > 0 
    ? scrapeData.title[0] 
    : "Product Title Not Found";

  const priceValue = Array.isArray(scrapeData.price) && scrapeData.price.length > 0 
    ? scrapeData.price[0] 
    : "0";

  return {
    name: productName,
    price: priceValue,
    platform: platform
  };
}
