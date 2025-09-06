export interface DialerRecord {
  date: string;
  totalOutbound: number;
  reminderOutbound: number;
  reminderInbound: number;
  reminderPPWeb: number;
  salesPastDue: number;
  crtDialerPastDue: number;
}

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

const dialerCache = new Map<string, { data: { today: DialerRecord | null; previous: DialerRecord | null }; timestamp: number }>();
const DIALER_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

export async function fetchTodaysDialerRecords(): Promise<{
  today: DialerRecord | null;
  previous: DialerRecord | null;
}> {
  const cacheKey = "todaysDialerRecords";
  const now = Date.now();

  if (dialerCache.has(cacheKey)) {
    const cached = dialerCache.get(cacheKey)!;
    if (now - cached.timestamp < DIALER_CACHE_DURATION) {
      return cached.data;
    }
  }

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

    const result = { today: todayRecord, previous: prevRecord };
    dialerCache.set(cacheKey, { data: result, timestamp: Date.now() });

    return result;
  } catch (err) {
    console.error("Error in fetchTodaysDialerRecords:", err);
    return { today: null, previous: null };
  }
}