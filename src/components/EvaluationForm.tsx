import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Send } from "lucide-react";
import { useBertKeywords } from "@/hooks/useBertKeywords";

interface EvaluationFormProps {
  onSubmit: (topic: string, answer: string, bertKeywords: string[]) => void;
  isLoading: boolean;
}

export const EvaluationForm = ({ onSubmit, isLoading }: EvaluationFormProps) => {
  const [topic, setTopic] = useState("");
  const [answer, setAnswer] = useState("");
  const { extractKeywords, isExtracting } = useBertKeywords();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim() && answer.trim()) {
      // Extract keywords using BERT before sending to GenAI
      const bertKeywords = await extractKeywords(answer, topic);
      onSubmit(topic, answer, bertKeywords);
    }
  };

  return (
    <section id="evaluate-section" className="container mx-auto px-4 py-16">
      <Card className="max-w-4xl mx-auto shadow-lg-colored">
        <CardHeader className="space-y-2">
          <CardTitle className="text-3xl">Submit Your Answer</CardTitle>
          <CardDescription className="text-lg">
            Enter the topic and your answer to receive AI-powered evaluation and feedback
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="topic" className="text-base">Topic</Label>
              <Input
                id="topic"
                placeholder="e.g., Photosynthesis, World War II, Calculus..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={isLoading}
                className="text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="answer" className="text-base">Your Answer</Label>
              <Textarea
                id="answer"
                placeholder="Write your detailed answer here..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                disabled={isLoading}
                className="min-h-[200px] text-base"
              />
            </div>

            <Button 
              type="submit" 
              variant="hero"
              size="lg"
              disabled={isLoading || isExtracting || !topic.trim() || !answer.trim()}
              className="w-full"
            >
              {isLoading || isExtracting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {isExtracting ? 'Extracting Keywords...' : 'Evaluating...'}
                </>
              ) : (
                <>
                  <Send className="mr-2 h-5 w-5" />
                  Submit for Evaluation
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
};
