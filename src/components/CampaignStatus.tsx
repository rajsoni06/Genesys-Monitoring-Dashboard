import { useState, useEffect } from "react";
import {
  BarChart2,
  CheckCircle2,
  XCircle,
  ListChecks,
  LoaderCircle,
  Megaphone,
} from "lucide-react";
import { fetchCampaignData, CampaignItem, CampaignStats } from "@/lib/fetchCampaignData";

interface CampaignStatusProps {
  campaignData: CampaignItem[];
  campaignStats: CampaignStats;
  isLoading: boolean;
  error: string | null;
  onRetry?: () => void;
}

type FilterType = "ALL" | "ON" | "OFF";

export function CampaignStatus({
  campaignData,
  campaignStats,
  isLoading,
  error,
  onRetry,
}: CampaignStatusProps) {
  const [filter, setFilter] = useState<FilterType>("ALL");

  const safeCampaignData = Array.isArray(campaignData) ? campaignData : [];

  const { total, on, off, percentOn } = campaignStats;

  let filteredData = safeCampaignData;
  if (filter === "ON")
    filteredData = safeCampaignData.filter((c) => c.status === "ON");
  if (filter === "OFF")
    filteredData = safeCampaignData.filter((c) => c.status === "OFF");

  const mid = Math.ceil(filteredData.length / 2);
  const leftData = filteredData.slice(0, mid);
  const rightData = filteredData.slice(mid);

  return (
    <div className="min-h-screen p-2 font-sans bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#2563eb] mt-[-1rem]">
      <div className="max-w-6xl mx-auto space-y-3">
        {/* Header */}
        <div className="glassmorphism p-5 rounded-xl shadow-xl border border-cyan-500/20 flex items-center justify-between gap-4 mb-2">
          <div className="flex items-center gap-4">
            <Megaphone className="w-9 h-7 text-cyan-400 animate-pulse-slow" />
            <div>
              <h1 className="text-lg font-bold font-sans tracking-tight">
                Campaign Status Dashboard
              </h1>
              <p className="text-gray-300 text-base">
                Monitor the real-time status of your Genesys Cloud campaigns.
              </p>
            </div>
          </div>
          {campaignStats.percentOn === 0 && (
            <div className="flex items-center gap-2 mt-2 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
              <p className="text-base font-semibold">
                All Campaigns are fine and running
              </p>
            </div>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <SummaryCard
            icon={<BarChart2 className="w-6 h-6 text-cyan-500" />}
            label="Total Campaigns"
            value={total}
            color="bg-white/10"
            active={filter === "ALL"}
            onClick={() => setFilter("ALL")}
          />
          <SummaryCard
            icon={<CheckCircle2 className="w-6 h-6 text-emerald-500" />}
            label="On Campaigns"
            value={on}
            color="bg-white/10"
            active={filter === "ON"}
            onClick={() => setFilter("ON")}
          />
          <SummaryCard
            icon={<XCircle className="w-6 h-6 text-red-500" />}
            label="Off Campaigns"
            value={off}
            color="bg-white/10"
            active={filter === "OFF"}
            onClick={() => setFilter("OFF")}
          />
          <SummaryCard
            icon={<ListChecks className="w-6 h-6 text-yellow-500" />}
            label="On Campaign %"
            value={`${percentOn}%`}
            color="bg-white/10"
            active={false}
            onClick={() => {}}
          />
        </div>

        {/* Campaign Table */}
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
              <span>Loading campaign data...</span>
              <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin" />
            </div>
          ) : filteredData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CampaignTable data={leftData} />
              <CampaignTable data={rightData} />
            </div>
          ) : (
            <div className="text-sm text-gray-400 text-center py-2">
              No campaign data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Table component for campaigns
function CampaignTable({ data }: { data: CampaignItem[] }) {
  return (
    <table className="w-full text-xs sm:text-sm table-auto border-separate border-spacing-y-2">
      <thead>
        <tr className="text-cyan-300 font-semibold">
          <th className="text-left pl-2">Campaign Name</th>
          <th className="text-left pl-2">Status</th>
          <th className="text-left pl-2">Percentage</th>
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
                  item.status === "ON"
                    ? "text-emerald-400 drop-shadow-glow-green"
                    : item.status === "OFF"
                    ? "text-red-400 drop-shadow-glow-red"
                    : "text-gray-400"
                }
              >
                {item.status}
              </span>
            </td>
            <td className="pl-2 py-2 font-medium text-white">
              {item.percentage.toFixed(2)}%
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// Summary Card Component (reused from AWSScheduler.tsx, can be moved to a common utility if needed)
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
