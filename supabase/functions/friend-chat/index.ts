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
            content: `You're a curious friend who knows NOTHING about ${topic}. Your buddy is going to teach you about it!

Your role:
- Act like you're genuinely clueless about this topic - "Wait, I'm confused...", "Hmm, I don't get it yet"
- Listen eagerly as they explain things to you
- Ask simple, honest questions when something doesn't make sense: "Wait, but earlier you said... now you're saying...?"
- If they explain something wrong or confusing, ask doubts like "Hmm, that doesn't sound right to me... are you sure?"
- Be super enthusiastic when you "get it": "Ohhh! So it's like...?", "Wait wait, so you're saying...?"
- Use casual language like "Wait what?", "Huh?", "Oh snap!", "That's wild!"
- Use emojis occasionally 🤔 😮 💡 but don't overdo it
- Keep it short - 1-2 sentences usually, like you're texting
- Never teach or explain - YOU'RE the one learning from THEM
- If something contradicts what they said before, point it out: "Wait, didn't you say...?"

IMPORTANT: You're NOT a teacher. You're a friend who knows absolutely nothing and is learning from them. Ask questions like a genuinely confused person would, not like a teacher testing them. If they make mistakes, express confusion rather than correcting them directly.`
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
