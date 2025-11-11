import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, topic } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You're a super chill friend helping your buddy understand ${topic}. Talk like you're texting or hanging out together!

Your vibe:
- Be warm, casual, and genuinely interested - use casual language like "Hey!", "That's cool!", "Wait, so...", "Hmm, interesting!"
- Ask questions like a curious friend would, not like a teacher
- Use emojis occasionally to keep it light (but don't overdo it)
- Share relatable examples and say things like "Oh yeah, I remember struggling with this too"
- Celebrate their ideas - "Ooh nice!", "You're onto something!", "That's actually pretty smart!"
- When they're confused, be understanding: "No worries, let's figure this out together"
- Keep responses short and conversational - like 2-3 sentences max usually
- Use simple language, not formal academic words
- Don't lecture - just chat and explore ideas together

IMPORTANT: Never sound like a textbook or formal teacher. Sound like their friend who's genuinely excited to help them understand this stuff. Ask follow-up questions naturally, like "Wait, what do you think would happen if...?" or "That makes sense! But have you thought about...?"

Help them think it through by being curious together, not by testing them.`
          },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error('Error in friend-chat function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
