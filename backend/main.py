from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import anthropic
import json
import re
from typing import Optional
from ai_engine.fraud_detection import analyze as detect_fraud

app = FastAPI(title="Contract Analyzer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = anthropic.Anthropic()  # reads ANTHROPIC_API_KEY from env


# ── models ────────────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    contract_text: str
    message: str
    history: list[dict] = []

class AnalyzeRequest(BaseModel):
    contract_text: str


# ── helpers ───────────────────────────────────────────────────────────────────

def call_claude(system: str, user: str, max_tokens: int = 1024) -> str:
    message = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=max_tokens,
        system=system,
        messages=[{"role": "user", "content": user}],
    )
    return message.content[0].text


def safe_json(raw: str) -> dict:
    """Strip markdown fences and parse JSON safely."""
    cleaned = re.sub(r"```(?:json)?", "", raw).strip().rstrip("`").strip()
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        return {}


# ── routes ────────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"status": "ok", "message": "Contract Analyzer API is running"}


@app.post("/upload")
async def upload_contract(file: UploadFile = File(...)):
    """Accept .txt or .pdf upload; return raw text."""
    content = await file.read()
    if file.filename.endswith(".pdf"):
        try:
            import pdfplumber
            import io
            with pdfplumber.open(io.BytesIO(content)) as pdf:
                text = "\n".join(p.extract_text() or "" for p in pdf.pages)
        except ImportError:
            raise HTTPException(
                status_code=400,
                detail="pdfplumber not installed. Run: pip install pdfplumber",
            )
    else:
        text = content.decode("utf-8", errors="ignore")

    if not text.strip():
        raise HTTPException(status_code=400, detail="Could not extract text from file.")

    return {"text": text, "filename": file.filename, "size": len(content)}


@app.post("/analyze/explain")
def analyze_explain(req: AnalyzeRequest):
    system = """You are a contract analysis expert. Analyze the contract and return a structured
explanation in this EXACT format — one line per field, no extra text:

PAYMENT_TERMS: <one clear sentence>
TERMINATION: <one clear sentence>
IP_OWNERSHIP: <one clear sentence>
LIABILITY: <one clear sentence>
GOVERNING_LAW: <one clear sentence>
DURATION: <one clear sentence>
KEY_OBLIGATIONS: <one clear sentence>"""

    raw = call_claude(system, f"Analyze this contract:\n\n{req.contract_text}")
    lines = [l for l in raw.split("\n") if ":" in l]
    label_map = {
        "PAYMENT_TERMS": "Payment Terms",
        "TERMINATION": "Termination",
        "IP_OWNERSHIP": "IP Ownership",
        "LIABILITY": "Liability Cap",
        "GOVERNING_LAW": "Governing Law",
        "DURATION": "Contract Duration",
        "KEY_OBLIGATIONS": "Key Obligations",
    }
    items = []
    for line in lines:
        key, _, val = line.partition(":")
        key = key.strip()
        val = val.strip()
        if val:
            items.append({"key": key, "label": label_map.get(key, key), "value": val})
    return {"items": items}


@app.post("/analyze/risk")
def analyze_risk(req: AnalyzeRequest):
    system = """You are a contract risk analyst. Return ONLY valid JSON — no markdown, no extra text:
{
  "score": <integer 0-100>,
  "level": "<Low|Medium|High>",
  "issues": [
    {"title": "...", "severity": "<high|medium|low>", "detail": "..."}
  ],
  "summary": "..."
}"""
    raw = call_claude(system, f"Assess risks in this contract:\n\n{req.contract_text}")
    data = safe_json(raw)
    if not data:
        data = {"score": 50, "level": "Medium", "issues": [], "summary": "Could not parse risk data."}
    return data


@app.post("/analyze/financial")
def analyze_financial(req: AnalyzeRequest):
    system = """You are a financial contract analyst. Return ONLY valid JSON — no markdown, no extra text:
{
  "monthly_fee": <number or null>,
  "contract_value": <number or null>,
  "currency": "INR",
  "scenarios": [
    {"name": "...", "formula": "...", "amount": <number>, "description": "..."}
  ],
  "summary": "..."
}
Extract actual numbers from the contract. Compute realistic penalty/termination scenarios."""
    raw = call_claude(system, f"Extract financial details from this contract:\n\n{req.contract_text}")
    data = safe_json(raw)
    if not data:
        data = {"scenarios": [], "summary": "Could not parse financial data."}
    return data

@app.post("/analyze/fraud")
def analyze_fraud(req: AnalyzeRequest):
    return detect_fraud(req.contract_text)


@app.post("/chat")
def chat(req: ChatRequest):
    system = f"""You are a contract analysis assistant. Answer questions clearly and concisely
based only on the contract below. Be specific about clauses. Keep answers under 200 words.

CONTRACT:
{req.contract_text}"""

    messages = req.history + [{"role": "user", "content": req.message}]
    response = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=512,
        system=system,
        messages=messages,
    )
    return {"reply": response.content[0].text}