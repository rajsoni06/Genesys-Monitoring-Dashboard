const fetch = require("node-fetch");

exports.handler = async function (event, context) {
  try {
    const response = await fetch(
      "https://xe2t0qjr85.execute-api.us-east-1.amazonaws.com/Prod"
    );
    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({
          error: `HTTP error! status: ${response.status}`,
          body: data,
        }),
      };
    }

    const schedules = data.body || [];

    const transformed = schedules.map((item, idx) => ({
      id: `${idx}`,
      name: item.Name || item.name || `Schedule-${idx}`,
      status: item.Status || item.status || "UNKNOWN",
    }));

    const total = transformed.length;
    const enabled = transformed.filter((s) => s.status === "ENABLED").length;
    const disabled = transformed.filter((s) => s.status === "DISABLED").length;
    const percentEnabled = total > 0 ? ((enabled / total) * 100).toFixed(2) : "0";

    return {
      statusCode: 200,
      body: JSON.stringify({
        schedulerData: transformed,
        schedulerStats: {
          total,
          enabled,
          disabled,
          percentEnabled,
        },
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message || "Failed to fetch AWS Scheduler data",
      }),
    };
  }
};