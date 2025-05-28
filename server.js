const express = require("express");
const multer = require("multer");
const fetch = require("node-fetch");
const cors = require("cors");
const FormData = require("form-data");
const path = require("path");

const app = express();
const upload = multer();

app.use(cors());
app.use(express.static(__dirname)); // Sert index.html et CSS statique

// Sert la page d'accueil
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Proxy vers l’API externe
app.post("/proxy", upload.single("image"), async (req, res) => {
  try {
    const targetUrl = req.body.targetUrl;
    if (!targetUrl) {
      return res.status(400).json({ error: "URL cible manquante" });
    }

    const formData = new FormData();
    formData.append("image", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    const response = await fetch(targetUrl, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    res.set("Access-Control-Allow-Origin", "*");
    res.json(data);
  } catch (err) {
    console.error("Erreur proxy:", err);
    res.status(500).json({ error: err.toString() });
  }
});

app.listen(3000, () => {
  console.log("✅ Serveur web + proxy dispo sur http://localhost:3000");
});
