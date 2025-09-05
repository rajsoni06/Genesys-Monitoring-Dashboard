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
  LoaderCircle, // <-- Add LoaderCircle icon for spinner
} from "lucide-react";
import { fetchSchedulerData } from "@/lib/fetchSchedulerData";
import { fetchTodaysDialerRecords, DialerRecord } from "./PastRecords"; // Import from PastRecords.tsx

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

interface HomePageDialerRecord {
  category: string;
  count: number;
  change: number;
  trend: "up" | "down" | "stable";
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
  // State for today's and previous day's records
  const [todaysRecord, setTodaysRecord] = useState<DialerRecord | null>(null);
  const [prevRecord, setPrevRecord] = useState<DialerRecord | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialerLoading, setIsDialerLoading] = useState<boolean>(true); // <-- Add loading state for dialer records

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

  // Fetch today's and previous day's dialer records
  useEffect(() => {
    setIsDialerLoading(true);
    fetchTodaysDialerRecords()
      .then(({ today, previous }) => {
        setTodaysRecord(today);
        setPrevRecord(previous);
      })
      .catch(() => {
        setTodaysRecord(null);
        setPrevRecord(null);
      })
      .finally(() => setIsDialerLoading(false));
  }, []);

  // Helper for glowing arrow and percent (reuse but with less glow and animation)
  const getGlowingArrow = (current: number, prev: number) => {
    if (prev === undefined || prev === 0)
      return <span className="ml-2 text-xs text-gray-400">0.0%</span>;
    const change = ((current - prev) / prev) * 100;
    if (change > 0) {
      return (
        <span
          className="ml-2 text-xs flex items-center font-semibold"
          style={{
            color: "#34d399",
            textShadow: "0 0 1px #34d399",
          }}
        >
          <TrendingUp
            className="inline w-4 h-4 mr-1"
            style={{
              animation: "arrow-zoom 1.2s infinite alternate",
              verticalAlign: "middle",
              filter: "drop-shadow(0 0 1px #34d399)",
            }}
          />
          {Math.abs(change).toFixed(1)}%
        </span>
      );
    }
    if (change < 0) {
      return (
        <span
          className="ml-2 text-xs flex items-center font-semibold"
          style={{
            color: "#f87171",
            textShadow: "0 0 1px #f87171",
          }}
        >
          <TrendingDown
            className="inline w-4 h-4 mr-1"
            style={{
              animation: "arrow-zoom 1.2s infinite alternate",
              verticalAlign: "middle",
              filter: "drop-shadow(0 0 1px #f87171)",
            }}
          />
          {Math.abs(change).toFixed(1)}%
        </span>
      );
    }
    return <span className="ml-2 text-xs text-gray-400">0.0%</span>;
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("en-GB", {
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
      <style>
        {`
          @keyframes arrow-zoom {
            0% { transform: scale(1);}
            100% { transform: scale(1.25);}
          }
        `}
      </style>
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
              {isDialerLoading && (
                <LoaderCircle className="animate-spin ml-2 text-blue-400" />
              )}
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
                  {isDialerLoading ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="py-8 text-center text-blue-200"
                      >
                        <LoaderCircle className="animate-spin inline w-6 h-6 mr-2 text-blue-400" />
                        Loading today's dialer records...
                      </td>
                    </tr>
                  ) : todaysRecord && Object.keys(todaysRecord).length > 0 ? (
                    [
                      {
                        label: "Total Outbound Campaign Records",
                        value: todaysRecord.totalOutbound,
                        prev: prevRecord?.totalOutbound,
                      },
                      {
                        label: "Reminder Outbound Records",
                        value: todaysRecord.reminderOutbound,
                        prev: prevRecord?.reminderOutbound,
                      },
                      {
                        label: "Reminder Inbound Records",
                        value: todaysRecord.reminderInbound,
                        prev: prevRecord?.reminderInbound,
                      },
                      {
                        label: "Reminder PP/Web Records",
                        value: todaysRecord.reminderPPWeb,
                        prev: prevRecord?.reminderPPWeb,
                      },
                      {
                        label: "Sales Past Due Records",
                        value: todaysRecord.salesPastDue,
                        prev: prevRecord?.salesPastDue,
                      },
                      {
                        label: "CRT Dialer Past Due Records",
                        value: todaysRecord.crtDialerPastDue,
                        prev: prevRecord?.crtDialerPastDue,
                      },
                    ].map((row, idx) => (
                      <tr
                        key={row.label}
                        className="border-b border-blue-200 hover:bg-blue-900/10 transition-colors"
                      >
                        <td className="py-2 px-1 text-sm text-blue-50 whitespace-nowrap">
                          {row.label}
                        </td>
                        <td className="py-2 px-1 text-right font-mono font-semibold text-base text-blue-50">
                          {row.value?.toLocaleString?.() ?? "0"}
                        </td>
                        <td className="py-2 px-1 text-right">
                          {prevRecord && row.prev !== undefined ? (
                            getGlowingArrow(row.value, row.prev)
                          ) : (
                            <span className="text-xs text-gray-400">0.0%</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-red-300">
                        No dialer records found for today.
                      </td>
                    </tr>
                  )}
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
