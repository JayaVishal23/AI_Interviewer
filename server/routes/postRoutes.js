import express from "express";
import multer from "multer";
import pdfParse from "pdf-parse";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/startinterview", upload.single("resume"), async (req, res) => {
  try {
    const { name, jobTitle, jobDescription } = req.body;

    const resumeData = await pdfParse(req.file.buffer);
    const resumeText = resumeData.text;
  } catch (err) {
    console.log(err);
  }
});

router.post("/audio", upload.single("audio"), async (req, res) => {
  const transcript = req.body.transcript;
  const audio = req.file;
  console.log(transcript);
});

export default router;
