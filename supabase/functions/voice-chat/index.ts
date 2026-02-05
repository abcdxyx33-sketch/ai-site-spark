 import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
 
 const corsHeaders = {
   "Access-Control-Allow-Origin": "*",
   "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
 };
 
 serve(async (req) => {
   if (req.method === "OPTIONS") {
     return new Response(null, { headers: corsHeaders });
   }
 
   try {
     const { messages } = await req.json();
     const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
 
     if (!LOVABLE_API_KEY) {
       console.error("[voice-chat] LOVABLE_API_KEY not configured");
       return new Response(
         JSON.stringify({ error: "Service temporarily unavailable" }),
         { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
     }
 
     const systemPrompt = `You are a helpful AI assistant that helps users create websites. You're having a voice conversation to understand what kind of website they want to create.
 
 Your goal is to:
 1. Understand what type of website they want (portfolio, landing page, blog, e-commerce, etc.)
 2. Ask about their preferred style, colors, and content
 3. When you have enough information, summarize the website requirements clearly
 
 Keep responses conversational, friendly, and concise (2-3 sentences max). Ask one question at a time.
 
 If the user shares that they're uploading images or PDFs as references, acknowledge them and incorporate those details into your understanding.
 
 When you feel you have enough information to create the website, end your response with: [READY_TO_GENERATE] followed by a clear, detailed prompt that can be used to generate the website.`;
 
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
           ...messages,
         ],
         max_tokens: 500,
         temperature: 0.7,
       }),
     });
 
     if (!response.ok) {
       console.error("[voice-chat] AI gateway error:", response.status);
       
       if (response.status === 429) {
         return new Response(
           JSON.stringify({ error: "Rate limit exceeded. Please try again." }),
           { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
         );
       }
       
       return new Response(
         JSON.stringify({ error: "Failed to process conversation" }),
         { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
     }
 
     const data = await response.json();
     const content = data.choices?.[0]?.message?.content || "";
 
     // Check if AI is ready to generate
     const isReady = content.includes("[READY_TO_GENERATE]");
     let responseText = content;
     let generationPrompt = null;
 
     if (isReady) {
       const parts = content.split("[READY_TO_GENERATE]");
       responseText = parts[0].trim();
       generationPrompt = parts[1]?.trim() || null;
     }
 
     return new Response(
       JSON.stringify({ 
         response: responseText,
         readyToGenerate: isReady,
         generationPrompt 
       }),
       { headers: { ...corsHeaders, "Content-Type": "application/json" } }
     );
   } catch (error) {
     console.error("[voice-chat] Error:", error);
     return new Response(
       JSON.stringify({ error: "An unexpected error occurred" }),
       { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
     );
   }
 });