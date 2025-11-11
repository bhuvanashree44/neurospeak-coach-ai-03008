import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface FriendModeProps {
  onSessionComplete: (score: number, topic: string) => void;
}

export const FriendMode = ({ onSessionComplete }: FriendModeProps) => {
  const [topic, setTopic] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startSession = async () => {
    if (!topic.trim()) {
      toast({
        title: "Topic Required",
        description: "Please enter a topic to learn about",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('learning_sessions')
        .insert({
          mode: 'friend',
          topic: topic.trim(),
        })
        .select()
        .single();

      if (error) throw error;

      setSessionId(data.id);
      setSessionStarted(true);
      
      const welcomeMsg: Message = {
        role: "assistant",
        content: `Hey! 👋 So you wanna learn about ${topic}? That's awesome! Tell me what you already know about it, or just ask me anything - no wrong answers here!`
      };
      setMessages([welcomeMsg]);

      await supabase.from('chat_messages').insert({
        session_id: data.id,
        role: 'assistant',
        content: welcomeMsg.content
      });
    } catch (error) {
      console.error('Error starting session:', error);
      toast({
        title: "Session Start Failed",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  const streamChat = async (newMessages: Message[]) => {
    const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/friend-chat`;
    
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages: newMessages, topic }),
    });

    if (!resp.ok) {
      if (resp.status === 429) {
        throw new Error("Rate limit exceeded. Please try again in a moment.");
      }
      if (resp.status === 402) {
        throw new Error("AI usage limit reached. Please contact support.");
      }
      throw new Error("Failed to get response");
    }

    if (!resp.body) throw new Error("No response body");

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let assistantContent = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") break;

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) {
            assistantContent += content;
            setMessages(prev => {
              const last = prev[prev.length - 1];
              if (last?.role === "assistant") {
                return prev.map((m, i) => 
                  i === prev.length - 1 ? { ...m, content: assistantContent } : m
                );
              }
              return [...prev, { role: "assistant", content: assistantContent }];
            });
          }
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }

    return assistantContent;
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading || !sessionId) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      await supabase.from('chat_messages').insert({
        session_id: sessionId,
        role: 'user',
        content: userMessage.content
      });

      const allMessages = [...messages, userMessage];
      const assistantResponse = await streamChat(allMessages);

      await supabase.from('chat_messages').insert({
        session_id: sessionId,
        role: 'assistant',
        content: assistantResponse
      });

    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: "Message Failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const endSession = async () => {
    if (!sessionId) return;

    const conversationQuality = Math.min(5, Math.max(3, 3 + (messages.length / 10)));
    const score = Number(conversationQuality.toFixed(1));

    await supabase
      .from('learning_sessions')
      .update({ score })
      .eq('id', sessionId);

    onSessionComplete(score, topic);
    
    toast({
      title: "Session Complete!",
      description: `Great conversation! Understanding score: ${score}/5`,
    });
  };

  if (!sessionStarted) {
    return (
      <section className="py-16 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card className="p-8">
              <h2 className="text-3xl font-bold mb-4 text-center">Friend Mode 🤝</h2>
              <p className="text-muted-foreground mb-6 text-center">
                Let's chat and figure this out together! I'm here to help you understand anything - just like a study buddy would.
              </p>
              <div className="space-y-4">
                <Input
                  placeholder="What do you want to learn about? 😊"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && startSession()}
                />
                <Button onClick={startSession} className="w-full" size="lg">
                  Let's Chat! 💬
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="p-6">
            <div className="mb-4 flex justify-between items-center">
              <h3 className="text-xl font-semibold">Learning: {topic}</h3>
              <Button onClick={endSession} variant="outline">
                End Session
              </Button>
            </div>
            
            <div className="h-[500px] overflow-y-auto mb-4 space-y-4 p-4 bg-muted/20 rounded-lg">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-card border"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                disabled={isLoading}
              />
              <Button onClick={sendMessage} disabled={isLoading || !input.trim()}>
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};
