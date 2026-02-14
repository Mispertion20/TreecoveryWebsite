import express from "express";
import multer from "multer";
import fetch from "node-fetch";
import FormData from "form-data";
import fs from "fs";

const router = express.Router();
const upload = multer({ dest: "tmp/" });

router.post("/predict", upload.single("file"), async (req, res) => {
  try {
    const form = new FormData();
    form.append("file", fs.createReadStream(req.file!.path));

    const r = await fetch("http://localhost:8001/predict", {
      method: "POST",
      body: form as any,
    });

    const data = await r.json();
    fs.unlinkSync(req.file!.path);

    res.json(data);
  } catch (e) {
    res.status(500).json({ error: "Inference failed" });
  }
});

export default router;
