const fetch = require("node-fetch");
const FormData = require("form-data");

exports.handler = async (event) => {
  try {
    // Netlify encode le body en base64 dans les fonctions
    const body = Buffer.from(event.body, 'base64');

    const contentType = event.headers['content-type'] || event.headers['Content-Type'];

    if (!contentType || !contentType.includes("multipart/form-data")) {
      return {
        statusCode: 400,
        body: "Contenu invalide, multipart attendu.",
      };
    }

    // Extraire les limites de formData
    const boundaryMatch = /boundary=(.+);?/.exec(contentType);
    if (!boundaryMatch) {
      return {
        statusCode: 400,
        body: "Impossible de déterminer le boundary.",
      };
    }

    const boundary = boundaryMatch[1];

    const formData = new FormData();
    const filePart = {
      value: body,
      options: {
        filename: "image.jpg",
        contentType: "image/jpeg",
      },
    };

    // Recréer le formData depuis le corps brut
    formData.append("image", filePart.value, filePart.options);

    // Récupérer l'URL cible depuis les paramètres de requête (query string)
    const urlParams = new URLSearchParams(event.queryStringParameters);
    const targetUrl = urlParams.get("target");

    if (!targetUrl) {
      return {
        statusCode: 400,
        body: "Paramètre ?target manquant",
      };
    }

    const response = await fetch(targetUrl, {
      method: "POST",
      body: formData,
    });

    co
