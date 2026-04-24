import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const MASTERY_LEVELS = [
  { name: "New", min: 0, max: 20, color: "hsl(var(--destructive))" },
  { name: "Learning", min: 20, max: 50, color: "hsl(var(--chart-4))" },
  { name: "Familiar", min: 50, max: 80, color: "hsl(var(--chart-3))" },
  { name: "Mastered", min: 80, max: 101, color: "hsl(var(--accent))" },
];

export default function MasteryChart({ words }) {
  const data = MASTERY_LEVELS.map(level => ({
    name: level.name,
    value: words.filter(w => (w.mastery || 0) >= level.min && (w.mastery || 0) < level.max).length,
    color: level.color,
  })).filter(d => d.value > 0);

  if (data.length === 0) {
    return (
      <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
        <h3 className="text-sm font-semibold text-foreground mb-4">Mastery Breakdown</h3>
        <p className="text-sm text-muted-foreground text-center py-8">Add words to see your progress</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
      <h3 className="text-sm font-semibold text-foreground mb-4">Mastery Breakdown</h3>
      <div className="flex items-center gap-6">
        <div className="w-32 h-32">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={55}
                paddingAngle={3}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-col gap-2">
          {MASTERY_LEVELS.map(level => {
            const count = words.filter(w => (w.mastery || 0) >= level.min && (w.mastery || 0) < level.max).length;
            return (
              <div key={level.name} className="flex items-center gap-2 text-xs">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: level.color }} />
                <span className="text-muted-foreground">{level.name}</span>
                <span className="font-semibold text-foreground">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}