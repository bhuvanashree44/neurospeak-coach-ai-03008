import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";

interface LearningGraphProps {
  data: Array<{ date: string; score: number }>;
}

export const LearningGraph = ({ data }: LearningGraphProps) => {
  return (
    <section className="container mx-auto px-4 py-16">
      <Card className="max-w-6xl mx-auto shadow-lg-colored">
        <CardHeader>
          <CardTitle className="text-3xl">Learning Progress</CardTitle>
          <CardDescription className="text-lg">
            Track your improvement over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(262, 83%, 58%)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(262, 83%, 58%)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
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
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="hsl(262, 83%, 58%)"
                  strokeWidth={3}
                  fill="url(#colorScore)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};
