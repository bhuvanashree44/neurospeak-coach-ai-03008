import { Button } from "@/components/ui/button";
import { Brain } from "lucide-react";
import heroImage from "@/assets/hero-neural.jpg";

export const Hero = () => {
  const scrollToEvaluate = () => {
    document.getElementById("evaluate-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative overflow-hidden gradient-hero">
      <div className="absolute inset-0 opacity-30">
        <img 
          src={heroImage} 
          alt="Neural network visualization" 
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="container mx-auto px-4 py-24 md:py-32 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-primary/10 animate-float">
              <Brain className="w-16 h-16 text-primary" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent gradient-primary">
            NeuroSpeak
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            AI-Powered Learning Evaluation Platform
          </p>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Submit your answers, receive instant AI feedback, and track your learning progress with intelligent insights.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button 
              variant="hero" 
              size="lg"
              onClick={scrollToEvaluate}
              className="text-lg"
            >
              Start Evaluation
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="text-lg bg-card/50 backdrop-blur-sm"
            >
              View Progress
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
