
/**
 * Utility for generating website screenshots using the Pikwy API via Supabase Edge Function
 */

import { supabase } from "@/integrations/supabase/client";

/**
 * Generates a screenshot of a website URL using Pikwy API via Supabase Edge Function
 * @param url The URL to capture
 * @param fullScreen Whether to capture the full page (true) or viewport (false)
 * @returns Promise with the image URL or null if failed
 */
export const generateWebsitePreview = async (url: string, fullScreen: boolean = false): Promise<string | null> => {
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
      console.warn("Screenshot generation failed, will use fallback");
      return null; // Return null instead of throwing to allow graceful fallback
    }
    
    if (!data) {
      console.error("No data returned from edge function");
      return null;
    }
    
    // Check if the response contains an error or timeout
    if (data.error || data.success === false) {
      if (data.timeout) {
        console.warn("Screenshot generation timed out:", data.error);
      } else {
        console.error("Pikwy API error:", data.error, data.details);
      }
      console.warn("Screenshot generation failed:", data.error);
      return null; // Return null for graceful fallback
    }
    
    if (!data.imageUrl) {
      console.error("No imageUrl in response:", data);
      return null;
    }
    
    console.log("Preview generated successfully, data URL length:", data.imageUrl.length);
    return data.imageUrl;
  } catch (error) {
    console.error("Error generating website preview:", error);
    console.warn("Screenshot generation failed, will use fallback");
    return null; // Return null instead of throwing to allow graceful fallback
  }
};
