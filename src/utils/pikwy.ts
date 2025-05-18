
/**
 * Utility for generating website screenshots using the Pikwy API
 */

// Use the provided API token for Pikwy
const PIKWY_API_TOKEN = "c39990741cf427d7baa5750d20bfaefc66c45915a84af5d8";

/**
 * Generates a screenshot of a website URL using Pikwy API
 * @param url The URL to capture
 * @param fullScreen Whether to capture the full page (1) or viewport (0)
 * @returns Promise with the image URL
 */
export const generateWebsitePreview = async (url: string, fullScreen: boolean = false): Promise<string> => {
  if (!url) {
    throw new Error("URL is required");
  }
  
  try {
    // Encode the URL
    const encodedUrl = encodeURIComponent(url);
    const fullScreenParam = fullScreen ? "1" : "0";
    
    const response = await fetch(
      `https://api.pikwy.com?u=${encodedUrl}&tkn=${PIKWY_API_TOKEN}&fs=${fullScreenParam}`, 
      { method: "GET" }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to generate preview: ${response.status}`);
    }
    
    // The API returns the image URL directly
    const imageUrl = await response.text();
    return imageUrl;
  } catch (error) {
    console.error("Error generating website preview:", error);
    throw error;
  }
};
