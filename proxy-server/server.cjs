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
      "https://86dfqxwd74.execute-api.us-east-1.amazonaws.com/Pre-prod",
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
    const results = [];

    for (let i = 0; i < days; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);

      try {
        const dayRes = await fetch(
          "https://86dfqxwd74.execute-api.us-east-1.amazonaws.com/Pre-prod",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ date: dateStr }),
          }
        );
        if (dayRes.ok) {
          let record = await dayRes.json();
          if (record && typeof record === "object" && !Array.isArray(record)) {
            record.date = dateStr;
            results.push(record);
          }
        } else {
          // Try to extract error info from the day API
          const errorBody = await dayRes.text();
          console.warn(`[GET /proxy/past-records-range] No data for ${dateStr}:`, errorBody);
        }
      } catch (err) {
        console.warn(`[GET /proxy/past-records-range] Error fetching ${dateStr}: ${err}`);
      }
    }
    // Logging for debug: comment out if not needed
    console.log(`[GET /proxy/past-records-range] Returning ${results.length} records for last ${days} days`);
    res.json({ data: results });
  } catch (err) {
    console.error("[GET /proxy/past-records-range] Uncaught error:", err);
    res.status(500).json({ error: "Failed to fetch past records (range)" });
  }
});

app.get("/proxy/aws-scheduler", async (req, res) => {
  try {
    const response = await fetch(
      "https://86dfqxwd74.execute-api.us-east-1.amazonaws.com/Pre-prod/aws-scheduler"
    );
    const data = await response.json();
    if (!response.ok) {
      console.error("[GET /proxy/aws-scheduler] Error:", data);
      return res.status(response.status).json(data);
    }
    res.json(data);
  } catch (err) {
    console.error("[GET /proxy/aws-scheduler] Uncaught error:", err);
    res.status(500).json({ error: "Failed to fetch AWS scheduler data" });
  }
});

app.listen(PORT, () => {
  console.log("Proxy running on port " + PORT);
});
