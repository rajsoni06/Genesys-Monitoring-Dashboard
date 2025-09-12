import { useState, useEffect, useCallback } from "react";
import {
  Clock,
  TrendingUp,
  TrendingDown,
  Database,
  BarChart2,
  CheckCircle2,
  XCircle,
  ListChecks,
  LoaderCircle,
} from "lucide-react";
import { fetchSchedulerData } from "@/lib/fetchSchedulerData";
import { fetchTodaysDialerRecords, DialerRecord } from "@/lib/dialerRecords";
import ServiceNowIncidentsChart from "./ServiceNowIncidentsChart";
import { CampaignStatus } from "./CampaignStatus";
import {
  fetchCampaignData,
  CampaignItem,
  CampaignStats,
} from "@/lib/fetchCampaignData";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

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

const AnalogClock = ({ time }: { time: Date }) => {
  const seconds = time.getSeconds();
  const minutes = time.getMinutes();
  const hours = time.getHours();

  const secondHandAngle = seconds * 6;
  const minuteHandAngle = minutes * 6 + seconds * 0.1;
  const hourHandAngle = (hours % 12) * 30 + minutes * 0.5;

  const numbers = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div className="w-32 h-32 bg-gray-900 bg-opacity-75 backdrop-blur-sm border border-cyan-500/50 rounded-full flex items-center justify-center shadow-lg">
      <div className="relative w-full h-full">
        {/* Numbers */}
        {numbers.map((num) => {
          const angle = (num * 30 * Math.PI) / 180;
          const x = 50 + 40 * Math.cos(angle - Math.PI / 2);
          const y = 50 + 40 * Math.sin(angle - Math.PI / 2);
          return (
            <div
              key={num}
              className="absolute text-sm font-bold text-cyan-200"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              {num}
            </div>
          );
        })}
        {/* Hour Hand */}
        <div
          className="absolute top-1/2 left-1/2 w-1 h-8 bg-cyan-300 rounded-full"
          style={{
            transform: `translate(-50%, -100%) rotate(${hourHandAngle}deg)`,
            transformOrigin: "bottom",
          }}
        ></div>
        {/* Minute Hand */}
        <div
          className="absolute top-1/2 left-1/2 w-0.5 h-12 bg-cyan-400 rounded-full"
          style={{
            transform: `translate(-50%, -100%) rotate(${minuteHandAngle}deg)`,
            transformOrigin: "bottom",
          }}
        ></div>
        {/* Second Hand */}
        <div
          className="absolute top-1/2 left-1/2 w-0.5 h-14 bg-red-500 rounded-full"
          style={{
            transform: `translate(-50%, -100%) rotate(${secondHandAngle}deg)`,
            transformOrigin: "bottom",
          }}
        ></div>
        {/* Center dot */}
        <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
        {/* AM/PM Indicator */}
        <div className="absolute bottom-7 left-1/2 transform -translate-x-1/2 text-xs font-bold text-cyan-300">
          {time.getHours() >= 12 ? "PM" : "AM"}
        </div>
        {/* AM/PM Indicator */}
        <div className="absolute bottom-7 left-1/2 transform -translate-x-1/2 text-xs font-bold text-cyan-300">
          {time.getHours() >= 12 ? "PM" : "AM"}
        </div>
      </div>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload; // Get the data object for the hovered point
    return (
      <div className="p-2 bg-gray-800 bg-opacity-90 border border-gray-700 rounded-md shadow-lg text-white text-xs">
        <p className="font-bold mb-1">{`Date: ${label}`}</p>
        <p>{`Total Outbound Records: ${data.totalSalesRecords}`}</p>
        <p>{`Reminder Outbound: ${data.reminderOutbound}`}</p>
        <p>{`Reminder Inbound: ${data.reminderInbound}`}</p>
        <p>{`PP/Web: ${data.reminderPPWeb}`}</p>
        <p>{`Sales Past Due: ${data.salesPastDue}`}</p>
        <p>{`CRT Dialer Past Due: ${data.crtDialerPastDue}`}</p>
        <p>{`COT Dialer Past Due: ${data.cotDialerPastDue}`}</p>
      </div>
    );
  }
  return null;
};

const MountainGraph = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 5); // Fetch last 6 days (current day + 5 previous days)

      const formatDate = (d: Date) => d.toISOString().slice(0, 15);

      try {
        const res = await fetch(
          `/proxy/past-records-range?startDate=${formatDate(
            startDate
          )}&endDate=${formatDate(endDate)}`
        );
        const text = await res.text();
        let apiResponse;
        try {
          apiResponse = JSON.parse(text);
        } catch (e) {
          console.error("Error parsing JSON for mountain graph", e);
          setData([]);
          setLoading(false);
          return;
        }

        let recordsArray = [];
        if (Array.isArray(apiResponse)) {
          recordsArray = apiResponse;
        } else if (apiResponse && Array.isArray((apiResponse as any).data)) {
          recordsArray = (apiResponse as any).data;
        }

        const processedRecords = recordsArray
          .filter(
            (record) =>
              record.statusCode === 200 && typeof record.body === "object"
          )
          .map((record) => {
            const body = record.body;
            return {
              originalDate: record.date, // Keep original date for sorting
              date: new Date(record.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              }),
              totalSalesRecords: body.sales_record_count || 0,
              reminderOutbound: body.outbound_records || 0,
              reminderInbound: body.inbound_records || 0,
              reminderPPWeb: body.PP_records || 0,
              salesPastDue: body.past_due_count || 0,
              crtDialerPastDue: body.CRT_past_due_count || 0,
              cotDialerPastDue: body.COT_past_due_count || 0,
            };
          })
          .sort(
            (a, b) =>
              new Date(a.originalDate).getTime() -
              new Date(b.originalDate).getTime()
          ); // Sort by original date

        setData(processedRecords);
      } catch (error) {
        console.error("Error fetching data for mountain graph", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoaderCircle className="animate-spin text-cyan-400" size={48} />
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart
        data={data}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorReminder" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#34d399" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="date"
          stroke="#e2e8f0"
          tick={{ fontSize: 10 }}
          tickCount={15}
        />
        <YAxis stroke="#e2e8f0" tick={{ fontSize: 10 }} tickCount={10} />
        <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: "12px" }} />
        <Area
          type="monotone"
          dataKey="totalSalesRecords"
          stroke="#8884d8"
          fillOpacity={1}
          fill="url(#colorTotal)"
          name="Total Outbound Records"
          className="pulsating-line-purple"
        />
        <Area
          type="monotone"
          dataKey="reminderOutbound"
          stroke="#34d399"
          fillOpacity={1}
          fill="url(#colorReminder)"
          name="Reminder Outbound"
          className="pulsating-line-green"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export function HomePage() {
  const [schedulerStats, setSchedulerStats] = useState<SchedulerStats>({
    total: 0,
    enabled: 0,
    disabled: 0,
    percentEnabled: 0,
  });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [schedulerData, setSchedulerData] = useState<AWSSchedulerItem[]>([]);
  const [todaysRecord, setTodaysRecord] = useState<DialerRecord | null>(null);
  const [prevRecord, setPrevRecord] = useState<DialerRecord | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialerLoading, setIsDialerLoading] = useState<boolean>(true);
  const [showAnalogClock, setShowAnalogClock] = useState(false);
  const [clockPosition, setClockPosition] = useState({ x: 0, y: 0 });
  const [hoveredTimezone, setHoveredTimezone] = useState<number | null>(null);

  const [campaignData, setCampaignData] = useState<CampaignItem[]>([]);
  const [campaignStats, setCampaignStats] = useState<CampaignStats>({
    total: 0,
    on: 0,
    off: 0,
    percentOn: 0,
  });
  const [isCampaignLoading, setIsCampaignLoading] = useState<boolean>(true);
  const [campaignError, setCampaignError] = useState<string | null>(null);

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

  const getCampaignData = useCallback(async () => {
    setIsCampaignLoading(true);
    setCampaignError(null);
    try {
      const { campaignData, campaignStats } = await fetchCampaignData();
      setCampaignData(campaignData);
      setCampaignStats(campaignStats);
    } catch (err: unknown) {
      setCampaignError(
        (err as Error)?.message || "Error fetching campaign data"
      );
      setCampaignData([]);
      setCampaignStats({
        total: 0,
        on: 0,
        off: 0,
        percentOn: 0,
      });
    } finally {
      setIsCampaignLoading(false);
    }
  }, []);

  useEffect(() => {
    getCampaignData();
  }, [getCampaignData]);

  const getGlowingArrow = (current: number, prev: number) => {
    if (prev === undefined || prev === 0)
      return (
        <span className="text-xs text-gray-500 flex justify-end">0.0%</span>
      );
    const change = ((current - prev) / prev) * 100;
    if (change > 0) {
      return (
        <span
          className="text-xs flex items-center justify-end font-semibold"
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
          className="text-xs flex items-center justify-end font-semibold"
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
    return <span className="text-xs text-gray-400 flex justify-end">0.0%</span>;
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

  const handleMouseMove = (e: React.MouseEvent, offset: number) => {
    setShowAnalogClock(true);
    setClockPosition({ x: e.clientX + 20, y: e.clientY + 20 });
    setHoveredTimezone(offset);
  };

  const handleMouseLeave = () => {
    setShowAnalogClock(false);
    setHoveredTimezone(null);
  };

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
        border-radius: 14px;
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
    <div className="h-full w-full gradient-bg transition-all duration-700 mt-[-1.2rem]">
      <style>
        {`
          @keyframes arrow-zoom {
            0% { transform: scale(1);}
            100% { transform: scale(1.25);}
          }
        `}
      </style>
      <div className="h-full w-full p-2 space-y-2 overflow-y-auto">
        {/* Welcome Section */}
        <div className="glass-card p-2 rounded-2xl shadow flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-[1.5rem] md:text-[1.3rem] font-bold text-white mb-1">
              Welcome to Genesys Monitoring Dashboard
            </h1>
            <p className="text-[0.82rem] text-blue-100 mb-2">
              Monitor and manage your Genesys Cloud infrastructure with
              real-time insights
            </p>
            <div className="flex gap-2 flex-wrap justify-center md:justify-start">
              {/* Modern Clocks */}
              <div
                className="clock-card flex items-center gap-2 px-2 py-2 mb-1"
                onMouseMove={(e) => handleMouseMove(e, 0)}
                onMouseLeave={handleMouseLeave}
              >
                <Clock className="w-4 h-4 text-yellow-300" />
                <span className="font-mono text-xs">
                  IST: {formatTime12Hour(currentTime, 0)}
                </span>
              </div>

              <div
                className="clock-card flex items-center gap-2 px-2 py-2 mb-1"
                onMouseMove={(e) => handleMouseMove(e, 2.5)}
                onMouseLeave={handleMouseLeave}
              >
                <Clock className="w-4 h-4 text-green-300" />
                <span className="font-mono text-xs">
                  PHST: {formatTime12Hour(currentTime, 2.5)}
                </span>
              </div>

              <div
                className="clock-card flex items-center gap-2 px-2 py-2 mb-1"
                onMouseMove={(e) => handleMouseMove(e, -9.5)}
                onMouseLeave={handleMouseLeave}
              >
                <Clock className="w-4 h-4 text-cyan-300" />
                <span className="font-mono text-xs">
                  EST: {formatTime12Hour(currentTime, -9.5)}
                </span>
              </div>
            </div>
          </div>
          {/* ServiceNow Incidents Chart */}
          <ServiceNowIncidentsChart />
          {/* AWS Scheduler Summary Cards */}
          <div className="grid grid-cols-2 gap-2">
            <SummaryCard
              icon={<BarChart2 className="w-5 h-5 text-cyan-500 neon-cyan" />}
              label="Total"
              value={schedulerStats.total}
              color="bg-gray-700"
            />
            <SummaryCard
              icon={
                <CheckCircle2 className="w-5 h-5 text-emerald-500 neon-emerald" />
              }
              label="Enabled"
              value={schedulerStats.enabled}
              color="bg-gray-700"
            />
            <SummaryCard
              icon={<XCircle className="w-5 h-5 text-red-500 neon-red" />}
              label="Disabled"
              value={schedulerStats.disabled}
              color="bg-gray-700"
            />
            <SummaryCard
              icon={
                <ListChecks className="w-5 h-5 text-yellow-500 neon-yellow" />
              }
              label="Enabled %"
              value={`${schedulerStats.percentEnabled}%`}
              color="bg-gray-700"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {/* Today's Dialer Records */}
          <div className="glass-card p-2 rounded-lg shadow-md border border-cyan-400/30 max-h-[400px] overflow-y-auto">
            <div className="w-full md:w-5/6 mx-auto">
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-sm font-semibold text-white">
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
                      <th className="text-left py-2 px-1 font-semibold text-blue-100 text-xs">
                        Category
                      </th>
                      <th className="text-right py-2 px-1 font-semibold text-blue-100 text-xs">
                        Count
                      </th>
                      <th className="text-right py-2 px-1 font-semibold text-blue-100 text-xs">
                        Change (%)
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
                          label: "Total Outbound Records",
                          value: todaysRecord.totalSalesRecords,
                          prev: prevRecord?.totalSalesRecords,
                        },
                        {
                          label: "Reminder Outbound",
                          value: todaysRecord.reminderOutbound,
                          prev: prevRecord?.reminderOutbound,
                        },
                        {
                          label: "Reminder Inbound",
                          value: todaysRecord.reminderInbound,
                          prev: prevRecord?.reminderInbound,
                        },
                        {
                          label: "PP/Web",
                          value: todaysRecord.reminderPPWeb,
                          prev: prevRecord?.reminderPPWeb,
                        },
                        {
                          label: "Sales Past Due Records",
                          value: todaysRecord.salesPastDue,
                          prev: prevRecord?.salesPastDue,
                        },
                        {
                          label: "CRT Dialer Past Due",
                          value: todaysRecord.crtDialerPastDue,
                          prev: prevRecord?.crtDialerPastDue,
                        },
                        {
                          label: "COT Dialer Past Due",
                          value: todaysRecord.cotDialerPastDue,
                          prev: prevRecord?.cotDialerPastDue,
                        },
                      ].map((row, idx) => (
                        <tr
                          key={row.label}
                          className="border-b border-blue-200 hover:bg-blue-900/10 transition-colors"
                        >
                          <td className="py-2 px-1 text-xs text-blue-50 whitespace-nowrap">
                            {row.label}
                          </td>
                          <td className="py-2 px-1 text-right font-mono font-semibold text-sm text-blue-50">
                            {row.label === "Total Outbound Records" &&
                            typeof row.value === "number"
                              ? row.value.toLocaleString()
                              : row.value?.toLocaleString?.() ?? "0"}
                          </td>
                          <td className="py-2 px-1 text-right">
                            {prevRecord && row.prev !== undefined ? (
                              getGlowingArrow(row.value, row.prev)
                            ) : (
                              <span className="text-xs text-gray-400">
                                0.0%
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={3}
                          className="py-8 text-center text-red-300"
                        >
                          No dialer records found for today.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Mountain Graph */}
          <div className="glass-card p-2 rounded-lg shadow-md border border-cyan-400/30">
            <h2 className="text-sm font-semibold text-white mb-1">
              Last 6 Days Dialer Records Trend
            </h2>
            <MountainGraph />
          </div>
        </div>
      </div>
      {showAnalogClock && hoveredTimezone !== null && (
        <div
          className="fixed z-50"
          style={{
            left: clockPosition.x,
            top: clockPosition.y,
          }}
        >
          <AnalogClock
            time={
              new Date(currentTime.getTime() + hoveredTimezone * 60 * 60 * 1000)
            }
          />
        </div>
      )}
    </div>
  );
}

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
      className={`flex flex-col items-center justify-center p-1 rounded-xl shadow border border-white/10 ${color}`}
      style={{
        minHeight: "60px",
        minWidth: "80px",
        margin: "1px", // reduce spacing between boxes
      }}
    >
      <div className="mb-0.5">{icon}</div>
      <div className="text-base font-bold text-white leading-tight">
        {value}
      </div>
      <div className="text-xs text-white leading-tight">{label}</div>
    </div>
  );
}
