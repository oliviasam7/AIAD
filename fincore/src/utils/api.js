import { MODEL } from "./constants";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

export async function extractTextFromPDF(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map((item) => item.str).join(" ");
    fullText += pageText + "\n";
  }
  return fullText.trim();
}

export async function callAPI(messages, systemPrompt) {
  const key = process.env.REACT_APP_OPENAI_API_KEY;
  if (!key) throw new Error("API key not configured. Add REACT_APP_OPENAI_API_KEY to your .env file.");

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 2000,
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

export function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => reject(new Error("Cannot read file"));
    reader.readAsText(file);
  });
}

export async function analyzeContract(contractText, focusAreas, imageData) {
  const key = process.env.REACT_APP_OPENAI_API_KEY;
  if (!key) throw new Error("API key not configured. Add REACT_APP_OPENAI_API_KEY to your .env file.");

  const systemPrompt = `You are a contract analysis expert. Analyze the contract and return ONLY valid JSON in exactly this format, no markdown:
{
  "riskScore": <integer 0-100>,
  "riskLevel": "<Low|Medium|High>",
  "summary": "<2-3 sentence plain English summary of what this contract is about>",
  "clauses": [
    { "type": "<risk|positive|neutral>", "tag": "<clause name>", "text": "<detailed explanation referencing actual contract language>" }
  ],
  "financials": [
    { "label": "<label>", "value": "<value>", "note": "<short note>" }
  ],
  "recommendation": "<final recommendation paragraph with specific references to the contract>"
}`;

  let userContent;

  if (imageData) {
    userContent = [
      {
        type: "image_url",
        image_url: { url: `data:${imageData.type};base64,${imageData.data}` },
      },
      {
        type: "text",
        text: `Analyze this contract image in detail. Focus on: ${focusAreas.join(", ")}. Reference specific clauses and terms you can see.`,
      },
    ];
  } else {
    if (!contractText || contractText.trim().length < 40) {
      throw new Error("Contract text is too short or empty. Please check your file.");
    }
    if (contractText.length > 60000) {
      contractText = contractText.slice(0, 60000) + "\n\n[Contract truncated due to length]";
    }
    userContent = `Analyze this contract in detail. Focus on: ${focusAreas.join(", ")}. Reference specific clauses, terms, dates, and monetary values found in the text.\n\nCONTRACT TEXT:\n${contractText}`;
  }

  const raw = await callAPI([{ role: "user", content: userContent }], systemPrompt);
  const parsed = parseJSON(raw);
  if (!parsed) throw new Error("Could not parse AI response. Please try again.");

  // Store extracted text on result so chatbot can use it
  parsed._contractText = contractText || "";
  return parsed;
}

export async function sendChatMessage(contractText, message, history) {
  if (!contractText || contractText.trim().length < 10) {
    return "I don't have access to the contract text for this session. Please re-upload and re-analyze the contract, then ask your question.";
  }

  const systemPrompt = `You are a contract analysis assistant. You have been given the full contract text below. Answer questions based ONLY on this specific contract. Always reference specific clauses, section numbers, dates, names, and monetary values that appear in the contract. Never say you don't have access to the contract — you do, it is provided below.\n\nCONTRACT:\n${contractText}`;

  const messages = [
    ...history,
    { role: "user", content: message },
  ];

  return await callAPI(messages, systemPrompt);
}

export async function translateContract(contractText, language) {
  const systemPrompt = `You are a contract expert and translator. Explain this contract clearly in ${language} using simple everyday language. Structure your response with these sections:\n\n1. Summary\n2. Payment and Penalties\n3. Termination Rules\n4. Key Risks\n5. What to watch out for before signing`;

  return await callAPI(
    [{ role: "user", content: `Explain this contract in ${language}:\n\nCONTRACT:\n${contractText}` }],
    systemPrompt
  );
}