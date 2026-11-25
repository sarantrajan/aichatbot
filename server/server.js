import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY
);

console.log(
  "Gemini API Key:",
  process.env.GEMINI_API_KEY ? "Loaded ✅" : "Missing ❌"
);

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_DELAY = 2000; // 2 seconds

// Wait function
const delay = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Check temporary errors
const isTemporaryError = (error) => {
  const status = Number(error.status || error.statusCode);

  return (
    status === 503 ||
    status === 429 ||
    status === 500 ||
    status === 502 ||
    status === 504 ||
    /\[(503|429|500|502|504)\]/.test(error.message || "")
  );
};

// Generate response with automatic retry
async function generateWithRetry(model, message) {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`Gemini request attempt ${attempt}/${MAX_RETRIES}`);

      const result = await model.generateContent(message);

      console.log("Gemini response received successfully ✅");

      return result.response.text();

    } catch (error) {
      console.error(
        `Gemini attempt ${attempt} failed:`,
        error.message
      );

      // Stop retrying for permanent errors
      if (!isTemporaryError(error)) {
        throw error;
      }

      // Stop after maximum attempts
      if (attempt === MAX_RETRIES) {
        throw error;
      }

      // Exponential backoff: 2s, 4s
      const waitTime = INITIAL_DELAY * Math.pow(2, attempt - 1);

      console.log(
        `Gemini temporarily unavailable. Retrying after ${waitTime / 1000} seconds...`
      );

      await delay(waitTime);
    }
  }
}

// Chat API
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        error: "Message is required.",
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "Gemini API key is missing in environment variables.",
      });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-3.5-flash",
    });

    const reply = await generateWithRetry(
      model,
      message.trim()
    );

    return res.status(200).json({
      success: true,
      reply,
    });

  } catch (error) {
    console.error("FULL CHAT ERROR:", error);

    const status = Number(error.status || error.statusCode);
    const message = error.message || "";

    if (status === 503 || /\[503\]/.test(message)) {
      return res.status(503).json({
        success: false,
        error: "AI service is currently busy. Please try again after some time.",
      });
    }

    if (status === 429 || /\[429\]/.test(message)) {
      return res.status(429).json({
        success: false,
        error: "Gemini API quota exceeded. Please try again later.",
      });
    }

    return res.status(500).json({
      success: false,
      error: "Something went wrong while generating the AI response.",
    });
  }
});

// Health check
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Gemini Chat Backend is running 🚀",
  });
});

app.listen(PORT, () => {
  console.log(`Gemini server running on port ${PORT} ✅`);
});
