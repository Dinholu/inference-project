const fetch = require("node-fetch");
const FormData = require("form-data");

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed",
    };
  }

  try {
    // Récupère le body brut en binaire (base64 → buffer)
    const buffer = Buffer.from(event.body, "base64");

    // Lit l'en-tête Content-Type d'origine
    const contentType =
      event.headers["content-type"] || event.headers["Content-Type"];
    const target = event.queryStringParameters?.target;

    if (!target || !contentType.includes("multipart/form-data")) {
      return {
        statusCode: 400,
        body: "Paramètres invalides. Assurez-vous de passer ?target= et multipart/form-data",
      };
    }

    // Proxifie la requête brute
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
      body: "Erreur proxy: " + err.message,
    };
  }
};
