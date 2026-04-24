// REPLACE WITH THESE 4 LINES:
import * as pdfjsLib from "pdfjs-dist";
import { MODEL } from "./constants";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.mjs",
  import.meta.url
).toString();export async function callAPI(messages, systemPrompt) {
  const key = process.env.REACT_APP_OPENAI_API_KEY;
  if (!key) throw new Error("API key not configured. Add REACT_APP_OPENAI_API_KEY to your .env file.");

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1500,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "API call failed");
  return data.choices[0].message.content || "";
}

export function parseJSON(raw) {
  try {
    const match =
      raw.match(/```json\s*([\s\S]*?)\s*```/) || raw.match(/(\{[\s\S]*\})/);
    if (match) return JSON.parse(match[1]);
  } catch {}
  return null;
}

// ← THIS IS THE ONLY FUNCTION THAT CHANGED, everything else is identical
// REMOVE FROM HERE:
export async function readFileAsText(file) {
  const fileType = file.type;

  // Plain text files — read directly
  if (fileType === "text/plain") {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = () => reject(new Error("Cannot read file"));
      reader.readAsText(file);
    });
  }

  // PDFs — use PDF.js to extract real text
  if (fileType === "application/pdf") {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map((item) => item.str).join(" ");
      fullText += `\n${pageText}`;
    }

    if (!fullText.trim()) {
      throw new Error(
        "Could not extract text from this PDF. It may be a scanned image — please paste the text manually."
      );
    }

    return fullText.trim();
  }

  // Fallback for any other file type
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => reject(new Error("Cannot read file"));
    reader.readAsText(file);
  });
}
// REMOVE TO HERE
export function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) =>
      resolve({ data: e.target.result.split(",")[1], type: file.type });
    reader.onerror = () => reject(new Error("Cannot read image"));
    reader.readAsDataURL(file);
  });
}

export async function analyzeContract(contractText, focusAreas, imageData) {
  const key = process.env.REACT_APP_OPENAI_API_KEY;
  if (!key) throw new Error("API key not configured. Add REACT_APP_OPENAI_API_KEY to your .env file.");

  const systemPrompt = `You are a contract analysis expert. Analyze the contract and return ONLY valid JSON in exactly this format, no markdown:
{
  "riskScore": <integer 0-100>,
  "riskLevel": "<Low|Medium|High>",
  "summary": "<2-3 sentence plain English summary>",
  "clauses": [
    { "type": "<risk|positive|neutral>", "tag": "<clause name>", "text": "<explanation>" }
  ],
  "financials": [
    { "label": "<label>", "value": "<value>", "note": "<short note>" }
  ],
  "recommendation": "<final recommendation paragraph>"
}`;

  let userContent;

  if (imageData) {
    userContent = [
      {
        type: "image_url",
        image_url: {
          url: `data:${imageData.type};base64,${imageData.data}`,
        },
      },
      {
        type: "text",
        text: `Analyze this contract image. Focus on: ${focusAreas.join(", ")}.`,
      },
    ];
  } else {
    if (contractText.length > 50000) {
      contractText = contractText.slice(0, 50000) + "\n\n[Contract truncated due to length]";
    }
    userContent = `Analyze this contract. Focus on: ${focusAreas.join(", ")}.\n\nCONTRACT:\n${contractText}`;
  }

  const raw = await callAPI([{ role: "user", content: userContent }], systemPrompt);
  const parsed = parseJSON(raw);
  if (!parsed) throw new Error("Could not parse AI response. Please try again.");
  return parsed;
}

export async function sendChatMessage(contractText, message, history) {
  const systemPrompt = `You are a contract analysis assistant. Answer questions based ONLY on the contract below. Be specific and reference clauses when relevant. Keep answers under 150 words.

CONTRACT:
${contractText}`;

  const messages = [
    ...history,
    { role: "user", content: message },
  ];

  return await callAPI(messages, systemPrompt);
}

export async function translateContract(contractText, language) {
  const systemPrompt = `You are a contract expert and translator. Explain this contract clearly in ${language} using simple everyday language. Structure your response with these sections:

1. Summary
2. Payment and Penalties
3. Termination Rules
4. Key Risks
5. What to watch out for before signing`;

  return await callAPI(
    [{ role: "user", content: `Explain this contract in ${language}:\n\nCONTRACT:\n${contractText}` }],
    systemPrompt
  );
}