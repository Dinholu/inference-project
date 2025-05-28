const fetch = require("node-fetch");
const FormData = require("form-data");

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed",
    };
  }

  const contentType =
    event.headers["content-type"] || event.headers["Content-Type"];
  if (!contentType.startsWith("multipart/form-data")) {
    return {
      statusCode: 400,
      body: "Content-Type must be multipart/form-data",
    };
  }

  // Netlify Functions encode body as base64 by default
  const buffer = Buffer.from(event.body, "base64");

  // We manually build form-data with raw bytes and headers
  const boundary = contentType.split("boundary=")[1];
  const rawBody = `--${boundary}\r\n${buffer.toString()}\r\n--${boundary}--`;

  const target = event.queryStringParameters?.target;

  if (!target) {
    return {
      statusCode: 400,
      body: "Missing ?target parameter",
    };
  }

  try {
    const response = await fetch(target, {
      method: "POST",
      headers: {
        "Content-Type": contentType,
      },
      body: buffer,
    });

    const json = await response.json();

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(json),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: "Proxy error: " + err.message,
    };
  }
};
