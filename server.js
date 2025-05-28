const express = require("express");
const multer = require("multer");
const fetch = require("node-fetch");
const cors = require("cors");
const FormData = require("form-data");

const app = express();
const upload = multer();

app.use(cors());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.post("/proxy", upload.single("image"), async (req, res) => {
  const targetUrl = req.body.targetUrl;
  if (!targetUrl) return res.status(400).json({ error: "targetUrl manquant" });

  const formData = new FormData();
  formData.append("image", req.file.buffer, {
    filename: req.file.originalname,
    contentType: req.file.mimetype,
  });

  try {
    const response = await fetch(targetUrl, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Proxy en écoute sur http://localhost:${PORT}`);
});
