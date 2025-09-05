const fetch = require("node-fetch");

exports.handler = async (event) => {
  try {
    const response = await fetch("https://example.com/api");
    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Something went wrong" }),
    };
  }
};