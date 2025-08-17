import { TrendingUp, TrendingDown, Minus, LucideIcon } from "lucide-react";

interface AnalyticsCardProps {
  title: string;
  value: string;
  change: number;
  trend: "up" | "down" | "stable";
  icon: LucideIcon;
}

export function AnalyticsCard({
  title,
  value,
  change,
  trend,
  icon: Icon,
}: AnalyticsCardProps) {
  const getTrendColor = () => {
    switch (trend) {
      case "up":
        return "text-success";
      case "down":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="glass p-2 rounded-lg hover-glow">
      <div className="flex items-center justify-between mb-1">
        <div className="p-1 rounded bg-primary/10">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <div className="flex items-center gap-1">
          {trend === "up" && <TrendingUp className="w-3 h-3 text-success" />}
          {trend === "down" && (
            <TrendingDown className="w-3 h-3 text-destructive" />
          )}
          {trend === "stable" && (
            <Minus className="w-3 h-3 text-muted-foreground" />
          )}
          <span className={`text-xs font-medium ${getTrendColor()}`}>
            {Math.abs(change).toFixed(1)}%
          </span>
        </div>
      </div>

      <div className="space-y-0.5">
        <p className="text-sm font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{title}</p>
      </div>
    </div>
  );
}
