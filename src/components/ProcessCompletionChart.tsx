import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

export function ProcessCompletionChart() {
  // Calculate completion based on processes (this would be dynamic in real app)
  const completedProcesses = 7;
  const totalProcesses = 9;
  const completionPercentage = Math.round((completedProcesses / totalProcesses) * 100);

  const data = [
    { name: 'Completed', value: completedProcesses, color: 'hsl(var(--success))' },
    { name: 'Pending', value: totalProcesses - completedProcesses, color: 'hsl(var(--warning))' }
  ];

  return (
    <div className="glass p-6 rounded-lg h-full">
      <h3 className="text-lg font-semibold mb-6 text-center">Process Completion</h3>
      
      <div className="relative h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Legend />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center percentage */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">{completionPercentage}%</div>
            <div className="text-sm text-muted-foreground">Complete</div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span>Completed:</span>
          <span className="font-semibold text-success">{completedProcesses}/{totalProcesses}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Pending:</span>
          <span className="font-semibold text-warning">{totalProcesses - completedProcesses}</span>
        </div>
      </div>
    </div>
  );
}