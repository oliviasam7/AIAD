import { MODEL } from "./constants";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

export async function callAPI(messages, systemPrompt) {
  const key = process.env.REACT_APP_OPENAI_API_KEY;

  // Development fallback: return a mocked response when no OpenAI key is configured.
  if (!key) {
    console.warn("No OpenAI key configured — using mocked response in development.");
    // If this is the contract analysis system prompt, return a minimal valid JSON string
    if (systemPrompt && systemPrompt.startsWith("You are a contract analysis expert")) {
      return JSON.stringify({
        riskScore: 10,
        riskLevel: "Low",
        summary: "(Mock) This contract appears low risk based on provided text.",
        clauses: [],
        financials: [],
        recommendation: "(Mock) Review payment terms and termination clauses before signing."
      });
    }
    // Generic mock reply for chat/translation features
    return "(Mock) OpenAI API key not configured. Set REACT_APP_OPENAI_API_KEY to enable real AI responses.";
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
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

export async function readFileAsText(file) {
  const fileType = file.type;

  if (fileType === "text/plain") {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = () => reject(new Error("Cannot read file"));
      reader.readAsText(file);
    });
  }

  if (fileType === "application/pdf") {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({
        data: arrayBuffer,
        useWorkerFetch: false,
        isEvalSupported: false,
        useSystemFonts: true,
      });
      const pdf = await loadingTask.promise;
      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map((item) => item.str).join(" ");
        fullText += pageText + "\n";
      }
      if (!fullText.trim()) {
        throw new Error(
          "No text found in this PDF. It may be scanned — try uploading as an image instead."
        );
      }
      return fullText.trim();
    } catch (err) {
      if (err.message.includes("No text found")) throw err;
      throw new Error("Failed to read PDF: " + err.message);
    }
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => reject(new Error("Cannot read file"));
    reader.readAsText(file);
  });
}

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
  // `callAPI` handles missing OpenAI keys by providing a safe development
  // fallback. Do not block here so the UI can work without a key.

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
        image_url: {
          url: `data:${imageData.type};base64,${imageData.data}`,
        },
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