
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../integrations/supabase/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url, platform } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'Missing required URL parameter' });
    }

    // Call our Supabase Edge Function to extract the product
    const { data, error } = await supabase.functions.invoke("axiom-product-extraction", {
      body: { url, platform },
    });

    if (error) {
      console.error("Edge function error:", error);
      throw new Error(error.message || "Failed to extract product details");
    }

    return res.status(200).json({ 
      success: true, 
      data: { productData: data.productData } 
    });
  } catch (error) {
    console.error("Product extraction error:", error);
    return res.status(500).json({ 
      success: false, 
      error: {
        message: error.message || "An unknown error occurred"
      } 
    });
  }
}
