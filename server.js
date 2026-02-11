import express from "express";
import OpenAI from "openai";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  baseURL: "http://localhost:1234/v1",  // LM Studio OpenAI-compatible endpoint
  apiKey: "lm-studio",                  // dummy/fake required by client
});

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files
app.use(express.static(__dirname));

app.post("/api/ai", async (req, res) => {
  try {
    const { prompt } = req.body;

    async function callModel(userPrompt) {
  const response = await openai.chat.completions.create({
    model: "llama-3-8b-instruct",
    messages: [
      {
        role: "system",
        content: `
You are a strict JSON-only semiconductor analysis engine.

Rules:
- Output must be valid JSON.
- No explanations.
- No markdown.
- No commentary.
- No extra text before or after JSON.
- Do not wrap in code blocks.
If you fail, the system will reject your response.
`
      },
      {
        role: "user",
        content: userPrompt
      }
    ],
    temperature: 0.4,
    max_tokens: 1200
  });

  return response.choices[0].message.content;
}


    // First attempt
    let text = await callModel(prompt);

    function extractJSON(raw) {
      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) return null;

      try {
        return JSON.parse(match[0]);
      } catch {
        return null;
      }
    }

    let parsed = extractJSON(text);

    // If JSON failed → ask model to fix itself
    if (!parsed) {
      console.log("⚠️ JSON invalid. Retrying with correction prompt...");

      const correctionPrompt = `
The previous response was invalid JSON.

Here is the invalid output:

${text}

Return ONLY valid JSON.
Do not include explanations.
Do not include markdown.
Return corrected JSON only.
`;

      text = await callModel(correctionPrompt);
      parsed = extractJSON(text);
    }

    if (!parsed) {
      return res.status(500).json({
        error: "Model failed to produce valid JSON after retry.",
        raw: text
      });
    }

    res.json({ result: parsed });

  } catch (err) {
    console.error("LLM Error:", err);
    res.status(500).json({ error: err.message });
  }
});


app.listen(3000, () => {
  console.log("Local LLM backend running at http://localhost:3000");
  
});
