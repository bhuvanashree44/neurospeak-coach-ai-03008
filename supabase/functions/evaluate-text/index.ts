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
    const { text, topic, bertKeywords } = await req.json();
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
            content: `You are an educational evaluation assistant. Evaluate student responses and provide clear, constructive feedback that helps them understand their lacking areas. Be specific and actionable.`
          },
          {
            role: "user",
            content: `Evaluate this student's response on the topic "${topic}":

"${text}"

BERT has identified these keywords in the student's answer: ${bertKeywords && bertKeywords.length > 0 ? bertKeywords.join(', ') : 'none detected'}

Provide a comprehensive evaluation with:
1. A score from 0-5 based on content quality, depth of understanding, and keyword coverage
2. Clear, student-friendly feedback highlighting what they did well and specific areas they need to improve
3. Keywords they successfully covered (include BERT-detected keywords if relevant)
4. Important keywords they missed that should be included

Focus on helping the student understand exactly what they're lacking and how to improve.`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "evaluate_response",
              description: "Evaluate the student response and provide structured feedback",
              parameters: {
                type: "object",
                properties: {
                  score: {
                    type: "number",
                    description: "Score from 0-5 based on quality, understanding, and completeness"
                  },
                  feedback: {
                    type: "string",
                    description: "Clear, student-friendly feedback explaining strengths and specific areas for improvement"
                  },
                  covered_keywords: {
                    type: "array",
                    items: { type: "string" },
                    description: "Keywords and concepts the student successfully addressed"
                  },
                  missing_keywords: {
                    type: "array",
                    items: { type: "string" },
                    description: "Important keywords and concepts the student should have included"
                  }
                },
                required: ["score", "feedback", "covered_keywords", "missing_keywords"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "evaluate_response" } }
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

    const data = await response.json();
    const toolCall = data.choices[0].message.tool_calls[0];
    const result = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify({
        score: result.score,
        feedback: result.feedback,
        keywords: {
          covered: result.covered_keywords,
          missing: result.missing_keywords
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in evaluate-text function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
