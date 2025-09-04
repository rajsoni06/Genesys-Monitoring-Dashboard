const fetch = require("node-fetch");

exports.handler = async (event, context) => {
  try {
    const { days } = event.queryStringParameters;
    let numDays = parseInt(days || "6", 10);
    if (isNaN(numDays) || numDays < 1 || numDays > 30) numDays = 6;

    const today = new Date();
    const datePromises = [];

    for (let i = 0; i < numDays; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);

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
            return {
              date: dateStr,
              statusCode: dayRes.status,
              error: errorText,
            };
          }
          return null;
        })
        .catch((err) => {
          return {
            date: dateStr,
            statusCode: 500,
            error: err.message,
          };
        });

      datePromises.push(fetchPromise);
    }

    const results = await Promise.all(datePromises);
    const validResults = results.filter(Boolean);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: validResults }),
    };
  } catch (err) {
    console.error("Proxy function error:", err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Internal server error", details: err.message }),
    };
  }
};