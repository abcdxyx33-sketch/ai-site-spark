import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { prompt } = body;
    
    // Input validation
    if (!prompt || typeof prompt !== 'string') {
      return new Response(
        JSON.stringify({ error: "Please provide a valid prompt" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const trimmedPrompt = prompt.trim();
    if (trimmedPrompt.length === 0) {
      return new Response(
        JSON.stringify({ error: "Prompt cannot be empty" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (trimmedPrompt.length > 2000) {
      return new Response(
        JSON.stringify({ error: "Prompt must be less than 2000 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("[generate-website] ERR_CONFIG_001");
      return new Response(
        JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `You are an expert web developer. Generate a complete, beautiful, modern HTML webpage based on the user's prompt.

REQUIREMENTS:
- Return ONLY valid HTML code, no explanations or markdown
- Include all CSS inline within a <style> tag
- Include any JavaScript within a <script> tag
- Use modern CSS features: flexbox, grid, gradients, shadows, animations
- Make it responsive and mobile-friendly
- Use a beautiful color palette that matches the theme
- Add smooth transitions and hover effects
- Include proper meta tags for viewport
- Make it visually stunning and professional

The HTML should be complete and ready to render in a browser iframe.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Create a website with the following description: ${trimmedPrompt}` },
        ],
        max_tokens: 8000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      // Log only error code, not full response details
      console.error(`[generate-website] ERR_GATEWAY_${response.status}`);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Service temporarily busy. Please try again in a moment." }),
          { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }),
          { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Unable to generate website. Please try again." }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    let generatedHtml = data.choices?.[0]?.message?.content || "";

    // Clean up the response - remove markdown code blocks if present
    generatedHtml = generatedHtml
      .replace(/^```html\n?/i, "")
      .replace(/^```\n?/i, "")
      .replace(/\n?```$/i, "")
      .trim();

    // Ensure it starts with DOCTYPE or html tag
    if (!generatedHtml.toLowerCase().startsWith("<!doctype") && !generatedHtml.toLowerCase().startsWith("<html")) {
      generatedHtml = `<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<title>Generated Website</title>\n</head>\n<body>\n${generatedHtml}\n</body>\n</html>`;
    }

    return new Response(
      JSON.stringify({ html: generatedHtml }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[generate-website] ERR_UNEXPECTED");
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred. Please try again." }),
      { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
