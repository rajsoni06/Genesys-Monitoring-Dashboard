import { useState, useEffect } from "react";
import {
  Calendar,
  Database,
  TrendingUp,
  TrendingDown,
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  X,
} from "lucide-react";

export interface DialerRecord {
  date: string;
  totalOutbound: number;
  reminderOutbound: number;
  reminderInbound: number;
  reminderPPWeb: number;
  salesPastDue: number;
  crtDialerPastDue: number;
}

// Update: fetch both today's and previous day's records
export async function fetchTodaysDialerRecords(): Promise<{
  today: DialerRecord | null;
  previous: DialerRecord | null;
}> {
  const today = new Date();
  const prev = new Date(today);
  prev.setDate(today.getDate() - 1);

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const todayIso = `${year}-${month}-${day}`;

  const prevYear = prev.getFullYear();
  const prevMonth = String(prev.getMonth() + 1).padStart(2, "0");
  const prevDay = String(prev.getDate()).padStart(2, "0");
  const prevIso = `${prevYear}-${prevMonth}-${prevDay}`;

  try {
    // Fetch both days in one call (if supported)
    const url = `/proxy/past-records-range?startDate=${prevIso}&endDate=${todayIso}`;
    const res = await fetch(url);

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`HTTP Error fetching records: ${res.status}`, errorText);
      return { today: null, previous: null };
    }

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      console.error(`Expected JSON data, got: '${contentType}' for records`);
      return { today: null, previous: null };
    }

    const text = await res.text();
    let apiResponse: APIRecord[];
    try {
      apiResponse = JSON.parse(text);
    } catch (e) {
      console.error(
        `Invalid JSON received for records: ${text.substring(0, 200)}...`,
        e
      );
      return { today: null, previous: null };
    }

    let recordsArray: APIRecord[] = [];
    if (Array.isArray(apiResponse)) {
      recordsArray = apiResponse;
    } else if (apiResponse && Array.isArray((apiResponse as any).data)) {
      recordsArray = (apiResponse as any).data;
    }

    const validRecords = recordsArray
      .filter(
        (record) => record.statusCode === 200 && typeof record.body === "object"
      )
      .map((record) => {
        const body = record.body as {
          sales_record_count: number;
          outbound_records: number;
          inbound_records: number;
          PP_records: number;
          past_due_count: number;
          CRT_record_count: number;
          CRT_past_due_count: number;
          COT_record_count: number;
          COT_past_due_count: number;
        };
        return {
          date: record.date,
          totalOutbound: body.outbound_records || 0,
          reminderOutbound: body.outbound_records || 0,
          reminderInbound: body.inbound_records || 0,
          reminderPPWeb: body.PP_records || 0,
          salesPastDue: body.past_due_count || 0,
          crtDialerPastDue: body.CRT_past_due_count || 0,
        } as DialerRecord;
      });

    // Find today's and previous day's records by date
    const todayRecord =
      validRecords.find((r) => r.date.startsWith(todayIso)) || null;
    const prevRecord =
      validRecords.find((r) => r.date.startsWith(prevIso)) || null;

    return { today: todayRecord, previous: prevRecord };
  } catch (err) {
    console.error("Error in fetchTodaysDialerRecords:", err);
    return { today: null, previous: null };
  }
}

// Add interface for the actual API response
export interface APIRecord {
  statusCode: number;
  body: {
    sales_record_count: number;
    outbound_records: number;
    inbound_records: number;
    PP_records: number;
    past_due_count: number;
    CRT_record_count: number;
    CRT_past_due_count: number;
    COT_record_count: number;
    COT_past_due_count: number;
  };
  date: string;
}

// Frontend memory cache for API responses
const cache = new Map<string, { data: DialerRecord[]; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

export function PastRecords() {
  const [records, setRecords] = useState<DialerRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<DialerRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cacheReady, setCacheReady] = useState(false); // <-- Add state

  // For calendar logic
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  // Date normalization function
  const toISO = (d: string | Date) => new Date(d).toISOString().slice(0, 10);

  // Clear cache function
  const clearCache = () => {
    cache.clear();
    console.log("Cache cleared");
  };

  // Helper to get change and direction label
  const getChangeLabel = (current: number, prev: number) => {
    if (prev === undefined || prev === 0) return null;
    const change = ((current - prev) / prev) * 100;
    const direction = change > 0 ? "Upward" : change < 0 ? "Downward" : "";
    return (
      <span
        className={`ml-2 text-xs ${
          change > 0
            ? "text-green-400"
            : change < 0
            ? "text-red-400"
            : "text-gray-400"
        }`}
      >
        {direction && (
          <>
            {direction} {Math.abs(change).toFixed(1)}%
          </>
        )}
      </span>
    );
  };

  // Helper to get only the arrow and percentage (no "Upward"/"Downward" text)
  // Further reduced glow and use zoom in/out animation instead of bounce
  const getChangeArrow = (current: number, prev: number) => {
    if (prev === undefined || prev === 0) return null;
    const change = ((current - prev) / prev) * 100;
    const arrowAnimation = {
      animation: "arrow-zoom 1.2s infinite alternate",
      verticalAlign: "middle",
    };
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
              ...arrowAnimation,
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
              ...arrowAnimation,
              filter: "drop-shadow(0 0 1px #f87171)",
            }}
          />
          {Math.abs(change).toFixed(1)}%
        </span>
      );
    }
    return <span className="ml-2 text-xs text-gray-400">0.0%</span>;
  };

  // Optimized fetch records with caching
  async function fetchRecords(startDate?: string, endDate?: string) {
    const cacheKey = `records-${startDate || "default"}-${
      endDate || "default"
    }`;
    const now = Date.now();

    // Check cache first
    if (cache.has(cacheKey)) {
      const cached = cache.get(cacheKey)!;
      if (now - cached.timestamp < CACHE_DURATION) {
        setRecords(cached.data);
        setCacheReady(true); // <-- Set cacheReady immediately if using cache
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      let url = "/proxy/past-records-range?";
      if (startDate && endDate) {
        url += `startDate=${startDate}&endDate=${endDate}`;
        console.log(`Fetching records from ${startDate} to ${endDate}...`);
      } else if (startDate) {
        url += `startDate=${startDate}&endDate=${startDate}`; // Fetch for a single day
        console.log(`Fetching records for ${startDate}...`);
      } else {
        url += `days=19`; // Default to 15 days if no specific range
        console.log(`Fetching records for last 19 days...`);
      }
      console.log(`Making request to: ${url}`);

      const res = await fetch(url);
      console.log(`Response status: ${res.status}, ok: ${res.ok}`);

      if (!res.ok) {
        const errorText = await res.text();
        console.error(`HTTP Error: ${res.status}`, errorText);
        throw new Error(
          `Network response was not ok (${res.status}): ${errorText}`
        );
      }

      const contentType = res.headers.get("content-type") || "";
      console.log(`Content-Type: ${contentType}`);

      const text = await res.text();
      console.log("Raw response:", text);

      let apiResponse: APIRecord[];
      try {
        apiResponse = JSON.parse(text);
      } catch {
        throw new Error(`Invalid JSON received: ${text.substring(0, 200)}...`);
      }

      if (!contentType.includes("application/json")) {
        throw new Error(`Expected JSON data, got: '${contentType}'`);
      }
      console.log("Fetched raw data:", apiResponse);

      // Safeguard against undefined data and filter out 404 responses
      // Ensure apiResponse is always an array
      let recordsArray: APIRecord[] = [];
      if (Array.isArray(apiResponse)) {
        recordsArray = apiResponse;
      } else if (apiResponse && Array.isArray((apiResponse as any).data)) {
        recordsArray = (apiResponse as any).data;
      }

      const validRecords = recordsArray
        .filter(
          (record) =>
            record.statusCode === 200 && typeof record.body === "object"
        )
        .map((record) => {
          const body = record.body as {
            sales_record_count: number;
            outbound_records: number;
            inbound_records: number;
            PP_records: number;
            past_due_count: number;
            CRT_record_count: number;
            CRT_past_due_count: number;
            COT_record_count: number;
            COT_past_due_count: number;
          };
          return {
            date: record.date,
            totalOutbound: body.outbound_records || 0,
            reminderOutbound: body.outbound_records || 0,
            reminderInbound: body.inbound_records || 0,
            reminderPPWeb: body.PP_records || 0,
            salesPastDue: body.past_due_count || 0,
            crtDialerPastDue: body.CRT_past_due_count || 0,
          } as DialerRecord;
        });

      setRecords(validRecords);
      cache.set(cacheKey, { data: validRecords, timestamp: Date.now() });
      setCacheReady(true); // <-- Set cacheReady after fetch

      // Auto-select the latest date if only one record is returned
      if (validRecords.length === 1) {
        setSelectedDate(validRecords[0].date);
      } else {
        setSelectedDate("");
      }
    } catch (err) {
      console.error("Error in fetchRecords:", err);
      setError(err.message);
      setCacheReady(false); // <-- Reset on error
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setCacheReady(cache.size > 0); // <-- Set cacheReady on mount if cache exists
    fetchRecords();

    // Daily refetch at midnight (server time)
    const now = new Date();
    const msTillMidnight =
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() -
      now.getTime();
    const timeoutId = setTimeout(() => {
      console.log("Midnight reached, refetching records...");
      fetchRecords();
      // Schedule next midnight fetch
      setInterval(() => {
        console.log("Midnight interval, refetching records...");
        fetchRecords();
      }, 24 * 60 * 60 * 1000); // 24 hours
    }, msTillMidnight);

    return () => {
      clearTimeout(timeoutId);
      console.log("Component unmounted, timeout cleared");
    };
  }, []);

  // Filter records based on searchTerm and selectedDate
  useEffect(() => {
    let filtered = records;
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      filtered = records.filter((record) =>
        record.date.toLowerCase().includes(lowerCaseSearchTerm)
      );
    } else if (selectedDate) {
      filtered = records.filter((record) =>
        record.date.startsWith(selectedDate)
      );
    }
    setFilteredRecords(filtered);
  }, [records, searchTerm, selectedDate]);

  // Calendar helpers
  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();
  const firstDayIndex = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const goToPreviousMonth = () =>
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  const goToNextMonth = () =>
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  const getChange = (current: number, prev: number) =>
    prev ? ((current - prev) / prev) * 100 : 0;
  const getTrendIcon = (change: number) =>
    change > 0 ? (
      <TrendingUp className="w-4 h-4 text-green-400 animate-pulse" />
    ) : change < 0 ? (
      <TrendingDown className="w-4 h-4 text-red-400 animate-pulse" />
    ) : (
      <span className="w-4 h-4 text-gray-400">-</span>
    );

  return (
    <div className="p-6 h-full bg-gray-900 overflow-auto">
      <style>
        {`
          @keyframes arrow-zoom {
            0% { transform: scale(1);}
            100% { transform: scale(1.25);}
          }
        `}
      </style>
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="glassmorphism p-6 rounded-xl shadow-lg">
          <div className="flex items-center gap-4 mb-3">
            <Database className="w-7 h-7 text-cyan-400" />
            <h1 className="text-2xl font-bold text-white font-mono tracking-wide">
              Historical Dialer Records
            </h1>
          </div>
          <p className="text-gray-400 text-sm">
            Analyze past dialer records with real-time trend insights
          </p>
        </div>

        {/* Filters */}
        <div className="glassmorphism p-5 rounded-xl shadow-lg relative z-20">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex items-center gap-3 flex-1 border border-cyan-500/20 rounded-lg p-2 bg-gray-800/50">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by date (e.g., 2025-01-07)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-transparent text-white placeholder-gray-500 border-none outline-none text-sm"
              />
            </div>
            {/* Calendar */}
            <div className="relative flex items-center gap-3 border border-cyan-500/20 rounded-lg p-2 bg-gray-800/50">
              <Calendar
                className="w-5 h-5 text-gray-400 cursor-pointer"
                onClick={() => setIsCalendarOpen(!isCalendarOpen)}
              />
              <input
                type="text"
                value={selectedDate ? formatDate(selectedDate) : ""}
                readOnly
                placeholder="Select date..."
                className="bg-transparent text-white placeholder-gray-500 border-none outline-none text-sm w-full"
                onClick={() => setIsCalendarOpen(!isCalendarOpen)}
              />
              {isCalendarOpen && (
                <div className="absolute top-full mt-2 left-0 z-50 p-4 rounded-xl shadow-lg bg-gray-800 w-64">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white font-mono text-sm">
                      {currentMonth.toLocaleString("en-US", {
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                    <div className="flex gap-2">
                      <button
                        className="text-cyan-400 hover:text-cyan-300 p-1 rounded-full hover:bg-cyan-500/20"
                        onClick={goToPreviousMonth}
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        className="text-cyan-400 hover:text-cyan-300 p-1 rounded-full hover:bg-cyan-500/20"
                        onClick={goToNextMonth}
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                      <button
                        className="text-cyan-400 hover:text-cyan-300"
                        onClick={() => setIsCalendarOpen(false)}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center text-white">
                    {/* Weekday labels */}
                    {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                      <div key={day} className="font-semibold text-xs">
                        {day}
                      </div>
                    ))}
                    {/* Filler (blank) days to align first day */}
                    {Array.from({ length: firstDayIndex }, (_, i) => (
                      <div
                        key={`empty-${i}`}
                        className="text-transparent select-none"
                      >
                        -
                      </div>
                    ))}
                    {/* Render month days */}
                    {calendarDays.map((day) => {
                      const dateStr = `${currentMonth.getFullYear()}-${String(
                        currentMonth.getMonth() + 1
                      ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                      const isSelected = selectedDate === dateStr;
                      return (
                        <div
                          key={day}
                          className={`cursor-pointer rounded-full p-1 hover:bg-cyan-500/30 ${
                            isSelected ? "bg-cyan-500 text-black" : ""
                          }`}
                          onClick={() => {
                            setSelectedDate(dateStr);
                            setSearchTerm(""); // Clear search input to avoid filtering conflict
                            setIsCalendarOpen(false);
                          }}
                        >
                          <span className="text-sm">{day}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            {/* Clear/Refresh Buttons */}
            <button
              onClick={() => {
                setSelectedDate("");
                setSearchTerm("");
              }}
              className="flex items-center justify-center gap-2 px-3 py-1 bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:from-red-600 hover:to-orange-600 transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              <X className="w-4 h-4" />
              Clear Filters
            </button>
            <button
              onClick={() => {
                clearCache();
                fetchRecords();
              }}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-3 py-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
          {error && <div className="text-red-400 mt-2">{error}</div>}
          <style>
            {`
              @keyframes superhero-entry {
                0% {
                  opacity: 0;
                  transform: scale(0.5) translateY(-20px);
                }
                50% {
                  opacity: 1;
                  transform: scale(1.2);
                  color: #ffdd00;
                  text-shadow: 0 0 10px #ff8c00;
                }
                100% {
                  opacity: 1;
                  transform: scale(1) translateY(0);
                }
              }
              .animate-superhero-entry {
                animation: superhero-entry 0.5s ease-out;
              }
            `}
          </style>
          <div className="text-xs text-white mt-2 flex items-center">
            {cacheReady && cache.size > 0 ? (
              <span className="animate-superhero-entry">
                ⚡ Cached data available
              </span>
            ) : (
              <>
                <RefreshCw className="w-3 h-3 mr-2 animate-spin" />
                Fetching fresh data
              </>
            )}
          </div>
        </div>

        {/* Records Table */}
        <div className="glassmorphism p-6 rounded-xl shadow-lg">
          {loading ? (
            <div className="text-cyan-400 py-6 px-3 text-center">
              Loading...
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-gray-400 py-6 px-3 text-center">
              No records found.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-white min-w-[700px]">
                  <thead>
                    <tr className="border-b border-cyan-500/20 text-xs md:text-sm">
                      <th className="text-left py-2 px-3 font-semibold text-gray-300 whitespace-nowrap">
                        Date
                      </th>
                      <th className="text-right py-2 px-3 font-semibold text-gray-300 whitespace-nowrap">
                        Total Outbound
                      </th>
                      <th className="text-right py-2 px-3 font-semibold text-gray-300 whitespace-nowrap">
                        Reminder Outbound
                      </th>
                      <th className="text-right py-2 px-3 font-semibold text-gray-300 whitespace-nowrap">
                        Reminder Inbound
                      </th>
                      <th className="text-right py-2 px-3 font-semibold text-gray-300 whitespace-nowrap">
                        PP/Web
                      </th>
                      <th className="text-right py-2 px-3 font-semibold text-gray-300 whitespace-nowrap">
                        Sales Past Due
                      </th>
                      <th className="text-right py-2 px-3 font-semibold text-gray-300 whitespace-nowrap">
                        CRT Past Due
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.map((record, index) => {
                      const previousRecord = filteredRecords[index + 1];
                      return (
                        <tr
                          key={record.date}
                          className="border-b border-cyan-500/10 hover:bg-cyan-900/20 transition-all duration-300"
                        >
                          <td className="py-3 px-6 text-sm font-mono">
                            {formatDate(record.date)}
                          </td>
                          {/* Total Outbound with arrow/percent */}
                          <td className="py-3 px-6 text-right">
                            <div className="flex items-center justify-end gap-3">
                              <span className="font-mono text-sm">
                                {record.totalOutbound.toLocaleString()}
                              </span>
                              {previousRecord &&
                                getChangeArrow(
                                  record.totalOutbound,
                                  previousRecord.totalOutbound
                                )}
                            </div>
                          </td>
                          {/* Reminder Outbound with arrow/percent */}
                          <td className="py-3 px-6 text-right">
                            <div className="flex items-center justify-end gap-3">
                              <span className="font-mono text-sm">
                                {record.reminderOutbound.toLocaleString()}
                              </span>
                              {previousRecord &&
                                getChangeArrow(
                                  record.reminderOutbound,
                                  previousRecord.reminderOutbound
                                )}
                            </div>
                          </td>
                          {/* Reminder Inbound with arrow/percent */}
                          <td className="py-3 px-6 text-right font-mono text-sm">
                            <div className="flex items-center justify-end gap-3">
                              {record.reminderInbound}
                              {previousRecord &&
                                getChangeArrow(
                                  record.reminderInbound,
                                  previousRecord.reminderInbound
                                )}
                            </div>
                          </td>
                          {/* PP/Web with arrow/percent */}
                          <td className="py-3 px-6 text-right font-mono text-sm">
                            <div className="flex items-center justify-end gap-3">
                              {record.reminderPPWeb}
                              {previousRecord &&
                                getChangeArrow(
                                  record.reminderPPWeb,
                                  previousRecord.reminderPPWeb
                                )}
                            </div>
                          </td>
                          {/* Sales Past Due with arrow/percent */}
                          <td className="py-3 px-6 text-right font-mono text-sm">
                            <div className="flex items-center justify-end gap-3">
                              {record.salesPastDue}
                              {previousRecord &&
                                getChangeArrow(
                                  record.salesPastDue,
                                  previousRecord.salesPastDue
                                )}
                            </div>
                          </td>
                          {/* CRT Past Due with arrow/percent */}
                          <td className="py-3 px-6 text-right font-mono text-sm">
                            <div className="flex items-center justify-end gap-3">
                              {record.crtDialerPastDue}
                              {previousRecord &&
                                getChangeArrow(
                                  record.crtDialerPastDue,
                                  previousRecord.crtDialerPastDue
                                )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Records Found", value: filteredRecords.length },
            {
              label: "Date Range",
              value:
                filteredRecords.length > 0
                  ? `${filteredRecords.length} days`
                  : "0 days",
            },
            {
              label: "Avg Total Outbound",
              value:
                filteredRecords.length > 0
                  ? Math.round(
                      filteredRecords.reduce(
                        (sum, r) => sum + r.totalOutbound,
                        0
                      ) / filteredRecords.length
                    ).toLocaleString()
                  : "0",
            },
            {
              label: "Avg CRT Past Due",
              value:
                filteredRecords.length > 0
                  ? Math.round(
                      filteredRecords.reduce(
                        (sum, r) => sum + r.crtDialerPastDue,
                        0
                      ) / filteredRecords.length
                    ).toLocaleString()
                  : "0",
            },
          ].map((stat, index) => (
            <div
              key={index}
              className="p-3 rounded-2xl text-center backdrop-blur-md bg-white/10 dark:bg-black/10 border border-white/20 shadow-xl transition-transform duration-300 hover:scale-105"
              style={{
                boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
              }}
            >
              <div className="text-xl md:text-2xl font-semibold text-cyan-300">
                {stat.value}
              </div>
              <div className="text-xs md:text-sm text-gray-400 uppercase tracking-wide mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
