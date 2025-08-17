import { useState, useEffect } from "react";
import {
  Calendar,
  Database,
  TrendingUp,
  TrendingDown,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface DialerRecord {
  date: string;
  totalOutbound: number;
  reminderOutbound: number;
  reminderInbound: number;
  reminderPPWeb: number;
  salesPastDue: number;
  crtDialerPastDue: number;
}

// Add interface for the actual API response
interface APIRecord {
  statusCode: number;
  body:
    | {
        sales_record_count: number;
        outbound_records: number;
        inbound_records: number;
        PP_records: number;
        past_due_count: number;
        CRT_record_count: number;
        CRT_past_due_count: number;
        COT_record_count: number;
        COT_past_due_count: number;
      }
    | string;
  date: string;
}

interface APIResponse {
  data?: APIRecord[];
  errors?: unknown[];
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

  // Optimized fetch records with caching
  async function fetchRecentRecords(days: number) {
    const cacheKey = `records-${days}`;
    const now = Date.now();

    // Check cache first
    if (cache.has(cacheKey)) {
      const cached = cache.get(cacheKey)!;
      if (now - cached.timestamp < CACHE_DURATION) {
        console.log(`Using cached data for ${days} days`);
        setRecords(cached.data);
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      console.log(`Fetching records for ${days} days...`);
      const url = `/api/proxy?days=${days}`;
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

      let apiResponse: APIResponse;
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
      const validRecords = (apiResponse.data || [])
        .filter((record) => {
          console.log(
            `Record ${record.date}: statusCode=${
              record.statusCode
            }, body type=${typeof record.body}`
          );
          return record.statusCode === 200 && typeof record.body === "object";
        })
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
          const transformed = {
            date: record.date,
            totalOutbound: body.outbound_records || 0,
            reminderOutbound: body.outbound_records || 0, // Using same value as total for now
            reminderInbound: body.inbound_records || 0,
            reminderPPWeb: body.PP_records || 0,
            salesPastDue: body.past_due_count || 0,
            crtDialerPastDue: body.CRT_past_due_count || 0,
          } as DialerRecord;
          console.log(`Transformed record for ${record.date}:`, transformed);
          return transformed;
        });

      console.log("Parsed recordsArray:", validRecords);
      console.log(`Setting ${validRecords.length} records to state`);

      // Cache the results
      cache.set(cacheKey, { data: validRecords, timestamp: now });
      setRecords(validRecords);
    } catch (err: unknown) {
      console.error(err);
      setError((err as Error)?.message || "Error fetching past records");
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }

  // Initial fetch with lazy loading strategy
  useEffect(() => {
    fetchRecentRecords(6);
  }, []);

  // Filtering logic (normalize dates)
  useEffect(() => {
    let data = [...records];
    console.log(
      `Filtering: ${records.length} records, selectedDate="${selectedDate}", searchTerm="${searchTerm}"`
    );

    // If user selected a date, use that to filter
    if (selectedDate) {
      data = data.filter((r) => toISO(r.date) === toISO(selectedDate));
      console.log(`After date filter: ${data.length} records`);
    }
    // Else if user typed something in the search input
    else if (searchTerm) {
      data = data.filter((r) => toISO(r.date).includes(searchTerm.trim()));
      console.log(`After search filter: ${data.length} records`);
    }

    console.log(`Final filtered records:`, data);
    setFilteredRecords(data);
  }, [records, selectedDate, searchTerm]);

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
    <div className="p-6 h-full bg-gradient-to-br from-gray-900 to-black overflow-auto">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="glassmorphism p-6 rounded-xl shadow-lg">
          <div className="flex items-center gap-4 mb-6">
            <Database className="w-10 h-10 text-cyan-400" />
            <h1 className="text-3xl font-bold text-white font-mono tracking-wide">
              Historical Dialer Records
            </h1>
          </div>
          <p className="text-gray-400 text-sm">
            Analyze past dialer records with real-time trend insights
          </p>
        </div>

        {/* Filters */}
        <div className="glassmorphism p-5 rounded-xl shadow-lg">
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
                <div className="absolute top-12 left-0 z-10 glassmorphism p-4 rounded-xl shadow-lg bg-gray-900/80 w-64">
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
              className="px-6 py-2 bg-cyan-600/80 hover:bg-cyan-500/80 rounded-lg text-white font-medium transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Clear Filters
            </button>
            <button
              onClick={() => {
                clearCache();
                fetchRecentRecords(6);
              }}
              disabled={loading}
              className="px-6 py-2 bg-cyan-800 hover:bg-cyan-600 rounded-lg text-white font-medium transition-all shadow active:scale-95 disabled:opacity-60"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
          {error && <div className="text-red-400 mt-2">{error}</div>}
          <div className="text-xs text-gray-500 mt-2">
            {cache.size > 0
              ? "⚡ Cached data available"
              : "🔄 Fetching fresh data"}
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
                <table className="w-full text-white">
                  <thead>
                    <tr className="border-b border-cyan-500/20">
                      <th className="text-left py-4 px-6 font-semibold text-gray-300">
                        Date
                      </th>
                      <th className="text-right py-4 px-6 font-semibold text-gray-300">
                        Total Outbound
                      </th>
                      <th className="text-right py-4 px-6 font-semibold text-gray-300">
                        Reminder Outbound
                      </th>
                      <th className="text-right py-4 px-6 font-semibold text-gray-300">
                        Reminder Inbound
                      </th>
                      <th className="text-right py-4 px-6 font-semibold text-gray-300">
                        PP/Web
                      </th>
                      <th className="text-right py-4 px-6 font-semibold text-gray-300">
                        Sales Past Due
                      </th>
                      <th className="text-right py-4 px-6 font-semibold text-gray-300">
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
                          {/* Total Outbound with trend */}
                          <td className="py-3 px-6 text-right">
                            <div className="flex items-center justify-end gap-3">
                              <span className="font-mono text-sm">
                                {record.totalOutbound.toLocaleString()}
                              </span>
                              {previousRecord && (
                                <div className="flex items-center gap-1">
                                  {getTrendIcon(
                                    getChange(
                                      record.totalOutbound,
                                      previousRecord.totalOutbound
                                    )
                                  )}
                                  <span className="text-xs text-gray-400">
                                    {Math.abs(
                                      getChange(
                                        record.totalOutbound,
                                        previousRecord.totalOutbound
                                      )
                                    ).toFixed(1)}
                                    %
                                  </span>
                                </div>
                              )}
                            </div>
                          </td>
                          {/* Reminder Outbound with trend */}
                          <td className="py-3 px-6 text-right">
                            <div className="flex items-center justify-end gap-3">
                              <span className="font-mono text-sm">
                                {record.reminderOutbound.toLocaleString()}
                              </span>
                              {previousRecord && (
                                <div className="flex items-center gap-1">
                                  {getTrendIcon(
                                    getChange(
                                      record.reminderOutbound,
                                      previousRecord.reminderOutbound
                                    )
                                  )}
                                  <span className="text-xs text-gray-400">
                                    {Math.abs(
                                      getChange(
                                        record.reminderOutbound,
                                        previousRecord.reminderOutbound
                                      )
                                    ).toFixed(1)}
                                    %
                                  </span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-6 text-right font-mono text-sm">
                            {record.reminderInbound}
                          </td>
                          <td className="py-3 px-6 text-right font-mono text-sm">
                            {record.reminderPPWeb}
                          </td>
                          <td className="py-3 px-6 text-right font-mono text-sm">
                            {record.salesPastDue}
                          </td>
                          <td className="py-3 px-6 text-right font-mono text-sm">
                            {record.crtDialerPastDue}
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