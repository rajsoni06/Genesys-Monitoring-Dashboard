import { useState } from "react";
import {
  Calendar,
  CheckCircle2,
  BarChart2,
  ListChecks,
  XCircle,
} from "lucide-react";

// Interface definitions
interface AWSSchedulerItem {
  id: string;
  name: string;
  status: "ENABLED" | "DISABLED" | "UNKNOWN" | string; // Allow for unexpected status values
}

interface SchedulerStats {
  total: number;
  enabled: number;
  disabled: number;
  percentEnabled: number;
}

interface AWSSchedulerProps {
  schedulerData: AWSSchedulerItem[];
  schedulerStats: SchedulerStats;
  isLoading: boolean;
  error: string | null;
  onRetry?: () => void; // Optional retry callback
}

type FilterType = "ALL" | "ENABLED" | "DISABLED";

export function AWSScheduler({
  schedulerData,
  schedulerStats,
  isLoading,
  error,
  onRetry,
}: AWSSchedulerProps) {
  const [filter, setFilter] = useState<FilterType>("ALL");

  // Safeguard against undefined or null schedulerData
  const safeSchedulerData = Array.isArray(schedulerData) ? schedulerData : [];

  // Stats
  const { total, enabled, disabled, percentEnabled } = schedulerStats;

  // Filtering logic
  let filteredData = safeSchedulerData;
  if (filter === "ENABLED")
    filteredData = safeSchedulerData.filter((s) => s.status === "ENABLED");
  if (filter === "DISABLED")
    filteredData = safeSchedulerData.filter((s) => s.status === "DISABLED");

  // Split data for two columns
  const mid = Math.ceil(filteredData.length / 2);
  const leftData = filteredData.slice(0, mid);
  const rightData = filteredData.slice(mid);

  return (
    <div className="min-h-screen p-2 font-sans bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#2563eb] mt-[-1rem]">
      <div className="max-w-6xl mx-auto space-y-3">
        {/* Header */}
        <div className="glassmorphism p-5 rounded-xl shadow-xl border border-cyan-500/20 flex items-center gap-4 mb-2">
          <Calendar className="w-9 h-7 text-cyan-400 animate-pulse-slow" />
          <div>
            <h1 className="text-lg font-bold font-sans tracking-tight">
              AWS Scheduler Dashboard
            </h1>
            <p className="text-gray-300 text-base">
              Monitor the real-time status of your AWS scheduler configurations.
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <SummaryCard
            icon={<BarChart2 className="w-6 h-6 text-cyan-500" />}
            label="Total"
            value={total}
            color="bg-white/10"
            active={filter === "ALL"}
            onClick={() => setFilter("ALL")}
          />
          <SummaryCard
            icon={<CheckCircle2 className="w-6 h-6 text-emerald-500" />}
            label="Enabled"
            value={enabled}
            color="bg-white/10"
            active={filter === "ENABLED"}
            onClick={() => setFilter("ENABLED")}
          />
          <SummaryCard
            icon={<XCircle className="w-6 h-6 text-red-500" />}
            label="Disabled"
            value={disabled}
            color="bg-white/10"
            active={filter === "DISABLED"}
            onClick={() => setFilter("DISABLED")}
          />
          <SummaryCard
            icon={<ListChecks className="w-6 h-6 text-yellow-500" />}
            label="Enabled %"
            value={`${percentEnabled}%`}
            color="bg-white/10"
            active={false}
            onClick={() => {}}
          />
        </div>

        {/* Scheduler Table */}
        <div className="glassmorphism p-4 rounded-xl shadow-lg border border-cyan-400/30 mt-4 max-h-[70vh] overflow-y-auto">
          {error ? (
            <div className="text-sm text-red-500 p-2 bg-red-100 dark:bg-red-900/30 rounded-md flex items-center justify-between">
              <span>{error}</span>
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="text-sm text-cyan-400 hover:text-cyan-300"
                >
                  Retry
                </button>
              )}
            </div>
          ) : isLoading ? (
            <div className="flex items-center gap-2 text-sm text-gray-400 p-2">
              <span>Loading scheduler data...</span>
              <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin" />
            </div>
          ) : filteredData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SchedulerTable data={leftData} />
              <SchedulerTable data={rightData} />
            </div>
          ) : (
            <div className="text-sm text-gray-400 text-center py-2">
              No scheduler data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Table component for schedulers
function SchedulerTable({ data }: { data: AWSSchedulerItem[] }) {
  return (
    <table className="w-full text-xs sm:text-sm table-auto border-separate border-spacing-y-2">
      <thead>
        <tr className="text-cyan-300 font-semibold">
          <th className="text-left pl-2">Scheduler Name</th>
          <th className="text-left pl-2">Status</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <tr
            key={item.id}
            className="bg-gray-900/70 rounded-xl hover:bg-gray-800 transition-all"
            style={{ borderRadius: "10px" }}
          >
            <td className="pl-2 py-2 font-medium truncate max-w-[180px] text-white">
              {item.name}
            </td>
            <td className="pl-2 py-2 font-semibold uppercase">
              <span
                className={
                  item.status === "ENABLED"
                    ? "text-emerald-400 drop-shadow-glow-green"
                    : item.status === "DISABLED"
                    ? "text-red-400 drop-shadow-glow-red"
                    : "text-gray-400"
                }
              >
                {item.status}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// Summary Card Component
function SummaryCard({
  icon,
  label,
  value,
  color,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={`glassmorphism flex flex-col items-center justify-center p-2 rounded-lg shadow border border-white/10 ${color} transition-all duration-200 ${
        active ? "ring-2 ring-cyan-400" : "hover:ring-2 hover:ring-cyan-300"
      }`}
      style={{ minHeight: "70px" }}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      tabIndex={0}
      aria-pressed={active}
      aria-label={`${label}: ${value}`}
    >
      <div className="mb-1">{icon}</div>
      <div className="text-lg font-bold text-white">{value}</div>
      <div className="text-xs text-white">{label}</div>
    </button>
  );
}
