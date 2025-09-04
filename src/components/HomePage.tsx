import { useState, useEffect } from "react";
import {
  Clock,
  TrendingUp,
  TrendingDown,
  Database,
  BarChart2,
  CheckCircle2,
  XCircle,
  ListChecks,
} from "lucide-react";
import { fetchSchedulerData } from "@/lib/fetchSchedulerData";

interface SchedulerStats {
  total: number;
  enabled: number;
  disabled: number;
  percentEnabled: number;
}

interface AWSSchedulerItem {
  id: string;
  name: string;
  status: "ENABLED" | "DISABLED";
}

export function HomePage() {
  const [schedulerStats, setSchedulerStats] = useState<SchedulerStats>({
    total: 0,
    enabled: 0,
    disabled: 0,
    percentEnabled: 0,
  });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [schedulerData, setSchedulerData] = useState<AWSSchedulerItem[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        const { schedulerData, schedulerStats } = await fetchSchedulerData();
        setSchedulerData(schedulerData);
        setSchedulerStats(schedulerStats);
      } catch (err: unknown) {
        setError(
          (err as Error)?.message || "Error fetching AWS Scheduler data"
        );
        setSchedulerData([]);
        setSchedulerStats({
          total: 0,
          enabled: 0,
          disabled: 0,
          percentEnabled: 0,
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const dialerRecords = [
    {
      category: "Total Outbound Campaign Records",
      count: 5847,
      change: 8.2,
      trend: "up",
    },
    {
      category: "Reminder Outbound Records",
      count: 4960,
      change: 5.1,
      trend: "up",
    },
    {
      category: "Reminder Inbound Records",
      count: 4,
      change: 0,
      trend: "stable",
    },
    {
      category: "Reminder PP/Web Records",
      count: 91,
      change: 17.5,
      trend: "up",
    },
    {
      category: "Sales Past Due Records",
      count: 0,
      change: 0,
      trend: "stable",
    },
    {
      category: "CRT Dialer Past Due Records",
      count: 357,
      change: 8.7,
      trend: "up",
    },
  ];

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTime12Hour = (date: Date, offsetHours: number) => {
    const utcDate = new Date(date.getTime() + offsetHours * 60 * 60 * 1000);
    return utcDate.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  // Gradient animation CSS
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      .gradient-bg {
        background: linear-gradient(120deg, #1e293b 0%, #0f172a 60%, #2563eb 100%);
        background-size: 200% 200%;
        transition: background-position 1.2s cubic-bezier(.4,0,.2,1);
      }
      .glass-card {
        background: rgba(255,255,255,0.07);
        backdrop-filter: blur(10px);
        border-radius: 16px;
        box-shadow: 0 2px 16px 0 rgba(37,99,235,0.08);
      }
      .clock-card {
        background: #1e293b;
        color: #fff;
        border-radius: 12px;
        box-shadow: 0 2px 8px 0 rgba(37,99,235,0.10);
        transition: box-shadow 0.3s;
      }
      .clock-card:hover {
        box-shadow: 0 4px 16px 0 rgba(37,99,235,0.18);
      }
      .neon-cyan {
        filter: drop-shadow(0 0 2px #22d3ee);
      }
      .neon-emerald {
        filter: drop-shadow(0 0 2px #39ff14);
      }
      .neon-red {
        filter: drop-shadow(0 0 2px #ff1744);
      }
      .neon-yellow {
        filter: drop-shadow(0 0 2px #fde047);
      }
      .pulse-arrow {
        animation: pulse-arrow 1.2s infinite alternate;
      }
      @keyframes pulse-arrow {
        0% { filter: drop-shadow(0 0 2px #39ff14) brightness(1.2); }
        50% { filter: drop-shadow(0 0 12px #39ff14) brightness(2); }
        100% { filter: drop-shadow(0 0 2px #39ff14) brightness(1.2); }
      }
      .pulse-arrow-red {
        animation: pulse-arrow-red 1.2s infinite alternate;
      }
      @keyframes pulse-arrow-red {
        0% { filter: drop-shadow(0 0 2px #ff1744) brightness(1.2); }
        50% { filter: drop-shadow(0 0 12px #ff1744) brightness(2); }
        100% { filter: drop-shadow(0 0 2px #ff1744) brightness(1.2); }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="h-full w-full gradient-bg transition-all duration-700">
      <div className="h-full w-full p-4 space-y-4">
        {/* Welcome Section */}
        <div className="glass-card p-4 rounded-2xl shadow flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-[2.5rem] md:text-2xl font-bold text-white mb-1">
              Welcome to Genesys Cloud Health Check Dashboard
            </h1>
            <p className="text-base text-blue-100 mb-2">
              Monitor and manage your Genesys Cloud infrastructure with
              real-time insights
            </p>
            <div className="flex gap-2 flex-wrap justify-center md:justify-start">
              {/* Modern Clocks */}
              <div className="clock-card flex items-center gap-2 px-3 py-2 mb-1">
                <Clock className="w-5 h-5 text-yellow-300" />
                <span className="font-mono text-sm">
                  🇮🇳 IST: {formatTime12Hour(currentTime, 0)}
                </span>
              </div>

              <div className="clock-card flex items-center gap-2 px-3 py-2 mb-1">
                <Clock className="w-5 h-5 text-green-300" />
                <span className="font-mono text-sm">
                  🇵🇭 PHST: {formatTime12Hour(currentTime, 2.5)}
                </span>
              </div>

              <div className="clock-card flex items-center gap-2 px-3 py-2 mb-1">
                <Clock className="w-5 h-5 text-cyan-300" />
                <span className="font-mono text-sm">
                  🇺🇸 EST: {formatTime12Hour(currentTime, -9.5)}
                </span>
              </div>
            </div>
          </div>
          {/* AWS Scheduler Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <SummaryCard
              icon={<BarChart2 className="w-6 h-6 text-cyan-500 neon-cyan" />}
              label="Total"
              value={schedulerStats.total}
              color="bg-white/10"
            />
            <SummaryCard
              icon={
                <CheckCircle2 className="w-6 h-6 text-emerald-500 neon-emerald" />
              }
              label="Enabled"
              value={schedulerStats.enabled}
              color="bg-white/10"
            />
            <SummaryCard
              icon={<XCircle className="w-6 h-6 text-red-500 neon-red" />}
              label="Disabled"
              value={schedulerStats.disabled}
              color="bg-white/10"
            />
            <SummaryCard
              icon={
                <ListChecks className="w-6 h-6 text-yellow-500 neon-yellow" />
              }
              label="Enabled %"
              value={`${schedulerStats.percentEnabled}%`}
              color="bg-white/10"
            />
          </div>
        </div>

        {/* Today's Dialer Records */}
        <div className="glass-card p-3 rounded-lg shadow-md border border-cyan-400/30 mt-4 max-h-[400px] overflow-y-auto">
          <div className="w-full md:w-5/6 mx-auto">
            <div className="flex items-center gap-2 mb-2">
              <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-lg font-semibold text-white">
                Today's Dialer Records ({formatDate(currentTime)})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-blue-200">
                    <th className="text-left py-2 px-1 font-semibold text-blue-100 text-sm">
                      Category
                    </th>
                    <th className="text-right py-2 px-1 font-semibold text-blue-100 text-sm">
                      Count
                    </th>
                    <th className="text-right py-2 px-1 font-semibold text-blue-100 text-sm">
                      Change
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {dialerRecords.map((record, index) => (
                    <tr
                      key={index}
                      className="border-b border-blue-200 hover:bg-blue-900/10 transition-colors"
                    >
                      <td className="py-2 px-1 text-sm text-blue-50 whitespace-nowrap">
                        {record.category}
                      </td>
                      <td className="py-2 px-1 text-right font-mono font-semibold text-base text-blue-50">
                        {record.count.toLocaleString()}
                      </td>
                      <td className="py-2 px-1 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {record.trend === "up" && (
                            <>
                              <TrendingUp className="w-4 h-4 neon-green pulse-arrow" />
                              <span className="text-green-400 text-sm font-medium font-mono">
                                +{record.change}%
                              </span>
                            </>
                          )}
                          {record.trend === "down" && (
                            <>
                              <TrendingDown className="w-4 h-4 neon-red pulse-arrow-red" />
                              <span className="text-red-400 text-base font-medium font-mono">
                                {record.change}%
                              </span>
                            </>
                          )}
                          {record.trend === "stable" && (
                            <span className="text-blue-200 text-sm">
                              No change
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Summary Card Component
function SummaryCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div
      className={`glass-card flex flex-col items-center justify-center p-3 rounded-xl shadow border border-white/10 ${color}`}
      style={{ minHeight: "70px", minWidth: "90px" }}
    >
      <div className="mb-1">{icon}</div>
      <div className="text-base font-bold text-white">{value}</div>
      <div className="text-xs text-white">{label}</div>
    </div>
  );
}
