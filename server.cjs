const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

/**
 * Health check endpoint useful for sanity.
 */
app.get("/health", (req, res) => res.json({ ok: true }));

/**
 * POST /proxy/past-records
 * Proxy for one-day request. Expects { date: "YYYY-MM-DD" } in body.
 */
app.post("/proxy/past-records", async (req, res) => {
  try {
    const bodyDate = req.body.date;
    if (!bodyDate) {
      return res.status(400).json({ error: 'Missing "date" in body.' });
    }
    const response = await fetch(
      "https://hj3m0fs93m.execute-api.us-east-1.amazonaws.com/prod",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: bodyDate }),
      }
    );
    const data = await response.json();
    if (!response.ok) {
      console.error(`[POST /proxy/past-records] Error for date ${bodyDate}:`, data);
      return res.status(response.status).json(data);
    }
    res.json(data);
  } catch (err) {
    console.error("[POST /proxy/past-records] Uncaught error:", err);
    res.status(500).json({ error: "Failed to fetch past records" });
  }
});

/**
 * GET /proxy/past-records-range?days=N
 * Aggregates results for the last N days up to today.
 * Returns: [ {...record for day 1}, {...record for day 2}, ... ]
 */
app.get("/proxy/past-records-range", async (req, res) => {
  try {
    let days = parseInt(req.query.days || "6", 10);
    if (isNaN(days) || days < 1 || days > 30) days = 6;

    const today = new Date();
    const promises = [];

    for (let i = 0; i < days; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);

      const promise = fetch(
        "https://hj3m0fs93m.execute-api.us-east-1.amazonaws.com/prod",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date: dateStr }),
        }
      )
        .then((res) => {
          if (res.ok) {
            return res.json().then((record) => {
              if (record && typeof record === "object" && !Array.isArray(record)) {
                record.date = dateStr;
                return record;
              }
              return null;
            });
          }
          return null;
        })
        .catch((err) => {
          console.warn(`[GET /proxy/past-records-range] Error fetching ${dateStr}: ${err}`);
          return null;
        });
      promises.push(promise);
    }

    const results = (await Promise.all(promises)).filter(Boolean);
    res.json(results);
  } catch (err) {
    console.error("[GET /proxy/past-records-range] Uncaught error:", err);
    res.status(500).json({ error: "Failed to fetch past records (range)" });
  }
});

app.get("/proxy/aws-scheduler", async (req, res) => {
  try {
    const response = await fetch(
      "https://xe2t0qjr85.execute-api.us-east-1.amazonaws.com/Prod"
    );
    const data = await response.json();

    if (!response.ok) {
      console.error("Scheduler API error:", response.status, data);
      return res.status(response.status).json({
        error: `HTTP error! status: ${response.status}`,
        body: data,
      });
    }

    const schedules = data.body || [];

    // Transform data to match AWSScheduler.tsx expectations
    const transformed = schedules.map((item, idx) => ({
      id: `${idx}`,
      name: item.Name || item.name || `Schedule-${idx}`,
      status: item.Status || item.status || "UNKNOWN",
    }));

    // Calculate stats for frontend
    const total = transformed.length;
    const enabled = transformed.filter((s) => s.status === "ENABLED").length;
    const disabled = transformed.filter((s) => s.status === "DISABLED").length;
    const percentEnabled = total > 0 ? ((enabled / total) * 100).toFixed(2) : "0";

    return res.json({
      schedulerData: transformed,
      schedulerStats: {
        total,
        enabled,
        disabled,
        percentEnabled,
      },
    });
  } catch (err) {
    console.error("[GET /proxy/aws-scheduler] Uncaught error:", err);
    res.status(500).json({ error: "Failed to fetch AWS scheduler data" });
  }
});

app.listen(PORT, () => {
  console.log("Proxy running on port " + PORT);
});