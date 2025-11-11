import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, TrendingUp } from "lucide-react";

interface EvaluationResultProps {
  score: number;
  feedback: string;
  topic: string;
  keywords: {
    covered: string[];
    missing: string[];
  };
}

export const EvaluationResult = ({ score, feedback, topic, keywords }: EvaluationResultProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 4) return "text-green-500";
    if (score >= 3) return "text-yellow-500";
    if (score >= 2) return "text-orange-500";
    return "text-red-500";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 4) return <CheckCircle2 className="w-8 h-8 text-green-500" />;
    if (score >= 3) return <TrendingUp className="w-8 h-8 text-yellow-500" />;
    if (score >= 2) return <AlertCircle className="w-8 h-8 text-orange-500" />;
    return <AlertCircle className="w-8 h-8 text-red-500" />;
  };

  return (
    <section className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto shadow-lg-colored animate-fade-in">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="text-2xl">Evaluation Results</CardTitle>
            <Badge variant="secondary" className="text-base px-4 py-2">
              Topic: {topic}
            </Badge>
          </div>
          
          <div className="flex items-center gap-6 p-6 rounded-lg bg-secondary/50">
            {getScoreIcon(score)}
            <div>
              <p className="text-sm text-muted-foreground mb-1">Your Score</p>
              <p className={`text-5xl font-bold ${getScoreColor(score)}`}>
                {score}/5
              </p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle2 className="w-5 h-5" />
                Keywords Covered
              </h3>
              <div className="flex flex-wrap gap-2">
                {keywords.covered.map((keyword, index) => (
                  <Badge key={index} className="bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-orange-600 dark:text-orange-400">
                <AlertCircle className="w-5 h-5" />
                Missing Keywords
              </h3>
              <div className="flex flex-wrap gap-2">
                {keywords.missing.map((keyword, index) => (
                  <Badge key={index} className="bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-500/30">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Detailed Feedback
            </h3>
            <div className="prose prose-sm max-w-none">
              <p className="text-base leading-relaxed whitespace-pre-wrap">
                {feedback}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};
