
export const fallbackToBuildship = async (url: string, platform: string) => {
  console.log("Falling back to Buildship extraction service");
  
  try {
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
