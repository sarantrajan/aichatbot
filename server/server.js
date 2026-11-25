
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

const MODEL_NAME =
  process.env.GEMINI_MODEL || "gemini-3.8-flash";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

console.log(
  "Gemini API Key:",
  process.env.GEMINI_API_KEY ? "Loaded" : "Missing"
);

console.log("Gemini Model:", MODEL_NAME);

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_DELAY = 2000;

// Wait function
const delay = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Check temporary errors
const isTemporaryError = (error) => {
  const status = Number(error.status || error.statusCode);

  return (
    [429, 500, 502, 503, 504].includes(status) ||
    /\b(429|500|502|503|504)\b/.test(error.message || "")
  );
};

// Current date and time
function getCurrentDateTime() {
  return new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "full",
    timeStyle: "long",
  });
}

// System instructions
function createPrompt(message) {
  const currentDate = getCurrentDateTime();

  return `
You are a helpful, intelligent AI assistant.

CURRENT DATE AND TIME:
${currentDate}
Timezone: Asia/Kolkata (India)

IMPORTANT INSTRUCTIONS:

1. Always use the provided current date and time.
2. Never assume the current year from your training data.
3. For current events, latest news, recent updates,
   technology news, current prices and recent developments,
   use Google Search to obtain updated information.
4. Prefer recent and trustworthy sources.
5. Clearly distinguish confirmed facts from uncertain information.
6. Never invent news, dates, events or statistics.
7. If reliable current information is unavailable,
   clearly tell the user.
8. Answer naturally in the language used by the user.
9. For general knowledge questions that do not need
   current information, answer normally.

USER QUESTION:
${message}
`;
}

// Generate response with retry
async function generateWithRetry(message) {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(
        `Gemini request attempt ${attempt}/${MAX_RETRIES}`
      );

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: createPrompt(message),

        // Enable Google Search Grounding
        config: {
          tools: [
            {
              googleSearch: {},
            },
          ],
        },
      });

      console.log("Gemini response received successfully");

      const reply = response.text || "No response generated.";

      const groundingMetadata =
        response.candidates?.[0]?.groundingMetadata;

      // Extract source links
      const sources = (
        groundingMetadata?.groundingChunks || []
      )
        .filter((chunk) => chunk.web?.uri)
        .map((chunk) => ({
          title: chunk.web.title || "Source",
          url: chunk.web.uri,
        }));

      // Remove duplicate sources
      const uniqueSources = [
        ...new Map(
          sources.map((source) => [source.url, source])
        ).values(),
      ];

      // Google Search suggestions HTML
      const searchWidgetHtml =
        groundingMetadata?.searchEntryPoint?.renderedContent || null;

      return {
        reply,
        sources: uniqueSources,
        searchWidgetHtml,
        searchedWeb: Boolean(groundingMetadata),
      };

    } catch (error) {
      console.error(
        `Gemini attempt ${attempt} failed:`,
        error.message
      );

      if (!isTemporaryError(error)) {
        throw error;
      }

      if (attempt === MAX_RETRIES) {
        throw error;
      }

      const waitTime =
        INITIAL_DELAY * Math.pow(2, attempt - 1);

      console.log(
        `Retrying after ${waitTime / 1000} seconds...`
      );

      await delay(waitTime);
    }
  }
}

// Chat API
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (
      !message ||
      typeof message !== "string" ||
      !message.trim()
    ) {
      return res.status(400).json({
        success: false,
        error: "Message is required.",
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        error: "Gemini API key is missing.",
      });
    }

    const result = await generateWithRetry(message.trim());

    return res.status(200).json({
      success: true,
      reply: result.reply,
      sources: result.sources,
      searchedWeb: result.searchedWeb,
      searchWidgetHtml: result.searchWidgetHtml,
    });

  } catch (error) {
    console.error("FULL CHAT ERROR:", error);

    const status = Number(error.status || error.statusCode);

    if (status === 503) {
      return res.status(503).json({
        success: false,
        error: "AI service is currently busy. Please try again.",
      });
    }

    if (status === 429) {
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
    message: "Gemini Chat Backend is running",
    model: MODEL_NAME,
  });
});

app.listen(PORT, () => {
  console.log(`Gemini server running on port ${PORT}`);
});
