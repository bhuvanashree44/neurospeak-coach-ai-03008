import { Button } from "@/components/ui/button";
import { GraduationCap, Users } from "lucide-react";

interface ModeSwitcherProps {
  mode: "teacher" | "friend";
  onModeChange: (mode: "teacher" | "friend") => void;
}

export const ModeSwitcher = ({ mode, onModeChange }: ModeSwitcherProps) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-6">Choose Your Learning Mode</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            variant={mode === "teacher" ? "default" : "outline"}
            size="lg"
            className="h-auto py-6 flex flex-col gap-3"
            onClick={() => onModeChange("teacher")}
          >
            <GraduationCap className="w-10 h-10" />
            <div>
              <div className="font-bold text-lg">Teacher Mode</div>
              <div className="text-sm opacity-90">Get evaluated and scored</div>
            </div>
          </Button>
          
          <Button
            variant={mode === "friend" ? "default" : "outline"}
            size="lg"
            className="h-auto py-6 flex flex-col gap-3"
            onClick={() => onModeChange("friend")}
          >
            <Users className="w-10 h-10" />
            <div>
              <div className="font-bold text-lg">Friend Mode</div>
              <div className="text-sm opacity-90">Learn through conversation</div>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
};
