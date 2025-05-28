const fetch = require("node-fetch");
const FormData = require("form-data");
const { IncomingForm } = require("formidable");
const { Buffer } = require("buffer");

// Pour que Netlify n’interprète pas le corps
exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Méthode non autorisée" };
  }

  return new Promise((resolve, reject) => {
    const form = new IncomingForm({ multiples: false });

    // Parse le fichier de l'image
    form.parse(event, async (err, fields, files) => {
      if (err) {
        return resolve({
          statusCode: 500,
          body: "Erreur parsing image: " + err.message,
        });
      }

      const targetUrl = fields.targetUrl || event.queryStringParameters?.target;
      const uploadedFile = files.image;

      if (!targetUrl || !uploadedFile) {
        return resolve({
          statusCode: 400,
          body: "Paramètre ou fichier manquant",
        });
      }

      const fs = require("fs");
      const fileData = fs.readFileSync(uploadedFile.filepath);

      const formData = new FormData();
      formData.append("image", fileData, {
        filename: uploadedFile.originalFilename,
        contentType: uploadedFile.mimetype,
      });

      try {
        const response = await fetch(targetUrl, {
          method: "POST",
          body: formData,
        });

        const data = await response.json();
        return resolve({
          statusCode: 200,
          headers: { "Access-Control-Allow-Origin": "*" },
          body: JSON.stringify(data),
        });
      } catch (error) {
        return resolve({
          statusCode: 500,
          body: "Erreur proxy: " + error.message,
        });
      }
    });
  });
};
