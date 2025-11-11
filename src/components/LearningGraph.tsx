import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface LearningGraphProps {
  data: Array<{ date: string; score: number; mode: string }>;
}

export const LearningGraph = ({ data }: LearningGraphProps) => {
  // Separate data by mode
  const teacherData = data.filter(d => d.mode === 'teacher');
  const friendData = data.filter(d => d.mode === 'friend');

  // Combine for chart display with mode labels
  const chartData = data.map((item, index) => ({
    index,
    date: item.date,
    teacherScore: item.mode === 'teacher' ? item.score : null,
    friendScore: item.mode === 'friend' ? item.score : null,
  }));

  if (data.length === 0) {
    return (
      <section className="container mx-auto px-4 py-16">
        <Card className="max-w-6xl mx-auto shadow-lg-colored">
          <CardHeader>
            <CardTitle className="text-3xl">Learning Progress</CardTitle>
            <CardDescription className="text-lg">
              Complete sessions to start tracking your progress
            </CardDescription>
          </CardHeader>
        </Card>
      </section>
    );
  }

  return (
    <section className="container mx-auto px-4 py-16">
      <Card className="max-w-6xl mx-auto shadow-lg-colored">
        <CardHeader>
          <CardTitle className="text-3xl">Learning Progress</CardTitle>
          <CardDescription className="text-lg">
            Track your improvement in both modes (0-5 scale)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  domain={[0, 5]}
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.5rem',
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="teacherScore" 
                  stroke="hsl(262, 83%, 58%)" 
                  strokeWidth={3}
                  dot={{ fill: 'hsl(262, 83%, 58%)', r: 5 }}
                  name="Teacher Mode"
                  connectNulls
                />
                <Line 
                  type="monotone" 
                  dataKey="friendScore" 
                  stroke="hsl(142, 71%, 45%)" 
                  strokeWidth={3}
                  dot={{ fill: 'hsl(142, 71%, 45%)', r: 5 }}
                  name="Friend Mode"
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-8 grid grid-cols-2 gap-6 text-center">
            <div className="p-4 rounded-lg bg-primary/10">
              <div className="text-sm text-muted-foreground font-medium mb-1">Teacher Mode Sessions</div>
              <div className="text-3xl font-bold" style={{ color: 'hsl(262, 83%, 58%)' }}>{teacherData.length}</div>
            </div>
            <div className="p-4 rounded-lg bg-secondary/10">
              <div className="text-sm text-muted-foreground font-medium mb-1">Friend Mode Sessions</div>
              <div className="text-3xl font-bold" style={{ color: 'hsl(142, 71%, 45%)' }}>{friendData.length}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};
