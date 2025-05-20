
/**
 * Utility for generating website screenshots using the Pikwy API via Supabase Edge Function
 */

import { supabase } from "@/integrations/supabase/client";

/**
 * Generates a screenshot of a website URL using Pikwy API via Supabase Edge Function
 * @param url The URL to capture
 * @param fullScreen Whether to capture the full page (true) or viewport (false)
 * @returns Promise with the image URL
 */
export const generateWebsitePreview = async (url: string, fullScreen: boolean = false): Promise<string> => {
  if (!url) {
    throw new Error("URL is required");
  }
  
  try {
    console.log(`Generating preview for URL: ${url}`);
    
    // Call our Supabase Edge Function
    const { data, error } = await supabase.functions.invoke("pikwy-screenshot", {
      body: { url, fullScreen }
    });
    
    if (error) {
      console.error("Edge function error:", error);
      throw new Error(`Failed to generate preview: ${error.message}`);
    }
    
    if (!data || !data.imageUrl) {
      console.error("Invalid response from edge function:", data);
      throw new Error("Failed to generate preview: Invalid response");
    }
    
    console.log("Preview generated successfully:", data.imageUrl);
    return data.imageUrl;
  } catch (error) {
    console.error("Error generating website preview:", error);
    throw error;
  }
};
