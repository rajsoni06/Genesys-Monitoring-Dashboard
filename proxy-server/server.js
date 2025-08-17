require("dotenv").config();
const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// HEALTH CHECK
app.get("/health", (req, res) => res.json({ ok: true }));

// AWS TOKEN
app.get("/proxy/token", async (req, res) => {
  try {
    const response = await fetch(
      "https://mt381v4a65.execute-api.us-east-1.amazonaws.com/GetAccessToken_Preprod/"
    );
    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({
        error: `HTTP error! status: ${response.status}`,
        body: data,
      });
    }
    res.json(data);
  } catch (error) {
    console.error("Proxy error (Token):", error);
    res.status(500).json({ error: error.message || "Failed to fetch token" });
  }
});

// AWS SCHEDULER
app.get("/proxy/aws-scheduler", async (req, res) => {
  try {
    // Fetch token first (assuming the scheduler API requires it)
    const tokenResponse = await fetch(
      "https://mt381v4a65.execute-api.us-east-1.amazonaws.com/GetAccessToken_Preprod/"
    );
    if (!tokenResponse.ok) {
      const tokenError = await tokenResponse.text();
      console.error("Token fetch failed:", tokenResponse.status, tokenError);
      return res.status(tokenResponse.status).json({
        error: `Failed to fetch token: ${tokenResponse.status}`,
        details: tokenError,
      });
    }
    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token || tokenData.token; // Adjust based on actual token field

    // Fetch scheduler data with token
    const response = await fetch(
      "https://86dfqxwd74.execute-api.us-east-1.amazonaws.com/Pre-prod",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`, // Include token if required
          "Content-Type": "application/json",
        },
      }
    );
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error("Non-JSON response from AWS Scheduler API:", text);
      return res.status(500).json({
        error: "AWS Scheduler API did not return valid JSON",
        raw: text,
      });
    }

    if (!response.ok) {
      console.error("Scheduler API error:", response.status, data);
      return res.status(response.status).json({
        error: `HTTP error! status: ${response.status}`,
        body: data,
      });
    }

    let schedules = [];
    if (typeof data.body === "string") {
      try {
        schedules = JSON.parse(data.body);
      } catch (e) {
        console.error("Error parsing data.body:", e, data.body);
        return res.status(500).json({
          error: "Failed to parse scheduler data body",
          raw: data.body,
        });
      }
    } else if (Array.isArray(data.body)) {
      schedules = data.body;
    } else if (Array.isArray(data.schedules)) {
      schedules = data.schedules;
    } else if (Array.isArray(data)) {
      schedules = data;
    } else {
      console.error("Unexpected scheduler data structure:", data);
      return res.status(500).json({
        error: "Scheduler API returned unexpected structure",
        raw: data,
      });
    }

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
  } catch (error) {
    console.error("Proxy error (AWS Scheduler):", error);
    res.status(500).json({
      error: error.message || "Failed to fetch AWS Scheduler data",
    });
  }
});

// SINGLE-DAY PAST RECORDS (POST)
app.post("/proxy/past-records", async (req, res) => {
  try {
    const { date } = req.body;
    if (!date) {
      return res.status(400).json({ error: 'Missing "date" in body.' });
    }
    const response = await fetch(
      "https://hj3m0fs93m.execute-api.us-east-1.amazonaws.com/prod",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date }),
      }
    );
    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `API returned an error for single-day fetch: ${response.status} - ${errorText}`
      );
      return res.status(response.status).json({
        error: `API request failed: ${response.status}`,
        details: errorText,
      });
    }
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Single-day proxy error:", err);
    res.status(500).json({ error: "Failed to fetch past records" });
  }
});

// MULTI-DAY PAST RECORDS (GET)
app.get("/proxy/past-records-range", async (req, res) => {
  try {
    let days = parseInt(req.query.days || "6", 10);
    if (isNaN(days) || days < 1 || days > 30) days = 6;

    const today = new Date();
    const datePromises = [];

    for (let i = 0; i < days; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);

      // Create a promise for each day's fetch
      const fetchPromise = fetch(
        "https://hj3m0fs93m.execute-api.us-east-1.amazonaws.com/prod",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date: dateStr }),
        }
      )
        .then(async (dayRes) => {
          if (dayRes.ok) {
            let record = await dayRes.json();
            if (record && typeof record === "object" && !Array.isArray(record)) {
              record.date = dateStr;
              return record;
            }
          } else {
            const errorText = await dayRes.text();
            console.warn(
              `API call for date ${dateStr} failed: ${dayRes.status} - ${dayRes.statusText}. Response: ${errorText}`
            );
          }
          return null; // Return null for failed or invalid responses
        })
        .catch((err) => {
          console.error(`Error fetching data for date ${dateStr}:`, err.message);
          return null; // Return null on error
        });

      datePromises.push(fetchPromise);
    }

    // Wait for all fetches to complete
    const results = await Promise.all(datePromises);

    // Filter out any null results from failed fetches
    const validResults = results.filter(Boolean);

    // Return the data in the format the frontend expects
    res.json({ data: validResults });

  } catch (err) {
    console.error("Range proxy error:", err);
    res.status(500).json({ error: "Failed to fetch past records (range)" });
  }
});

app.listen(PORT, () =>
  console.log(`Proxy server running on port ${PORT}`)
);