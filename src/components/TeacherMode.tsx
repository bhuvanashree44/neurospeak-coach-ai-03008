import { EvaluationForm } from "@/components/EvaluationForm";
import { EvaluationResult } from "@/components/EvaluationResult";

interface TeacherModeProps {
  isLoading: boolean;
  evaluation: {
    score: number;
    feedback: string;
    topic: string;
    keywords: {
      covered: string[];
      missing: string[];
    };
  } | null;
  onSubmit: (topic: string, answer: string, bertKeywords: string[]) => Promise<void>;
}

export const TeacherMode = ({ isLoading, evaluation, onSubmit }: TeacherModeProps) => {
  return (
    <>
      <EvaluationForm onSubmit={onSubmit} isLoading={isLoading} />
      
      {evaluation && (
        <div id="evaluation-results">
          <EvaluationResult 
            score={evaluation.score}
            feedback={evaluation.feedback}
            topic={evaluation.topic}
            keywords={evaluation.keywords}
          />
        </div>
      )}
    </>
  );
};
