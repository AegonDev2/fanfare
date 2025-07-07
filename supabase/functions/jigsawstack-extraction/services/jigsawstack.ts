
const JIGSAWSTACK_URL = "https://api.jigsawstack.com/v1";

export const fetchJigsawStack = async (path: string, body: any) => {
  const apiKey = Deno.env.get("JIGSAWSTACK_API_KEY");
  
  if (!apiKey) {
    console.error("JIGSAWSTACK_API_KEY not found in environment");
    throw new Error("API key not configured");
  }
  
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
