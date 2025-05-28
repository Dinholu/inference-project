const express = require("express");
const multer = require("multer");
const fetch = require("node-fetch");
const cors = require("cors");
const FormData = require("form-data");
const path = require("path");

const app = express();
const upload = multer();

app.use(cors());
app.use(express.static("public")); // sert index.html et assets depuis /public

app.post("/proxy", upload.single("image"), async (req, res) => {
  try {
    const formData = new FormData();
    formData.append("image", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    const targetUrl = req.body.targetUrl || req.query.target;
    if (!targetUrl) {
      return res.status(400).json({ error: "URL cible manquante." });
    }

    const response = await fetch(targetUrl, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    res.set("Access-Control-Allow-Origin", "*");
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Serveur en écoute sur http://localhost:${PORT}`);
});
