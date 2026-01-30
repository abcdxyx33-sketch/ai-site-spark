import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Simple in-memory rate limiting (per IP, 10 requests per minute)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  
  if (record.count >= RATE_LIMIT) {
    return false;
  }
  
  record.count++;
  return true;
}

// HTML sanitization function - removes dangerous elements and attributes
function sanitizeHtml(html: string): string {
  let sanitized = html;
  
  // Remove script tags and their content (including multiline)
  sanitized = sanitized.replace(/<script\b[^]*?<\/script>/gi, "");
  sanitized = sanitized.replace(/<script\b[^>]*\/?>/gi, "");
  
  // Remove iframe tags
  sanitized = sanitized.replace(/<iframe\b[^]*?<\/iframe>/gi, "");
  sanitized = sanitized.replace(/<iframe\b[^>]*\/?>/gi, "");
  
  // Remove object tags
  sanitized = sanitized.replace(/<object\b[^]*?<\/object>/gi, "");
  sanitized = sanitized.replace(/<object\b[^>]*\/?>/gi, "");
  
  // Remove embed tags
  sanitized = sanitized.replace(/<embed\b[^>]*\/?>/gi, "");
  
  // Remove base tags (can redirect all URLs)
  sanitized = sanitized.replace(/<base\b[^>]*\/?>/gi, "");
  
  // Remove applet tags
  sanitized = sanitized.replace(/<applet\b[^]*?<\/applet>/gi, "");
  sanitized = sanitized.replace(/<applet\b[^>]*\/?>/gi, "");
  
  // Remove all event handler attributes (onclick, onerror, onload, onmouseover, etc.)
  sanitized = sanitized.replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, "");
  sanitized = sanitized.replace(/\s+on\w+\s*=\s*[^\s>"']+/gi, "");
  
  // Remove javascript: URLs in href attributes
  sanitized = sanitized.replace(/href\s*=\s*["']?\s*javascript:[^"'\s>]*/gi, 'href="#"');
  
  // Remove javascript: URLs in src attributes  
  sanitized = sanitized.replace(/src\s*=\s*["']?\s*javascript:[^"'\s>]*/gi, 'src=""');
  
  // Remove data: URLs that could contain scripts (but allow data: images)
  sanitized = sanitized.replace(/href\s*=\s*["']?\s*data:(?!image)[^"'\s>]*/gi, 'href="#"');
  
  // Remove vbscript: URLs
  sanitized = sanitized.replace(/href\s*=\s*["']?\s*vbscript:[^"'\s>]*/gi, 'href="#"');
  sanitized = sanitized.replace(/src\s*=\s*["']?\s*vbscript:[^"'\s>]*/gi, 'src=""');
  
  // Remove expression() in style attributes (IE XSS vector)
  sanitized = sanitized.replace(/expression\s*\([^)]*\)/gi, "");
  
  // Remove url() with javascript: in CSS
  sanitized = sanitized.replace(/url\s*\(\s*["']?\s*javascript:[^)]*\)/gi, "url()");
  
  return sanitized;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting check
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                     req.headers.get("cf-connecting-ip") || 
                     "unknown";
    
    if (!checkRateLimit(clientIp)) {
      console.log(`[generate-website] Rate limit exceeded`);
      return new Response(
        JSON.stringify({ error: "Too many requests. Please wait a moment before trying again." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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
- DO NOT include any <script> tags - create static/CSS-only designs
- Use modern CSS features: flexbox, grid, gradients, shadows, animations
- Make it responsive and mobile-friendly
- Use a beautiful color palette that matches the theme
- Add smooth CSS transitions and hover effects (no JavaScript)
- Include proper meta tags for viewport
- Make it visually stunning and professional
- For interactivity, use CSS-only techniques like :hover, :focus, :checked, etc.

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

    // Sanitize HTML to remove dangerous elements (scripts, iframes, event handlers, etc.)
    const sanitizedHtml = sanitizeHtml(generatedHtml);

    // Ensure it starts with DOCTYPE or html tag
    let finalHtml = sanitizedHtml;
    if (!finalHtml.toLowerCase().startsWith("<!doctype") && !finalHtml.toLowerCase().startsWith("<html")) {
      finalHtml = `<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<title>Generated Website</title>\n</head>\n<body>\n${finalHtml}\n</body>\n</html>`;
    }

    return new Response(
      JSON.stringify({ html: finalHtml }),
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
