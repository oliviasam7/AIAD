from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
import json
import re
from typing import List
from ai_engine.fraud_detection import analyze as detect_fraud

app = FastAPI(title="FinCore API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = OpenAI()  # reads OPENAI_API_KEY from environment


# ── Pydantic Models ────────────────────────────────────────────────────────────

class AnalyzeRequest(BaseModel):
    contract_text: str

class ChatRequest(BaseModel):
    contract_text: str
    message: str
    history: List[dict] = []

class TranslateRequest(BaseModel):
    contract_text: str
    target_language: str


# ── Helpers ───────────────────────────────────────────────────────────────────

def call_openai(system: str, user: str, max_tokens: int = 1500) -> str:
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": system},
            {"role": "user",   "content": user},
        ],
        max_tokens=max_tokens,
    )
    return response.choices[0].message.content


def safe_json(raw: str) -> dict:
    """Strip markdown fences and parse JSON safely."""
    cleaned = re.sub(r"```(?:json)?", "", raw).strip().rstrip("`").strip()
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        return {}


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"status": "ok", "message": "FinCore API running"}


@app.post("/upload")
async def upload_contract(file: UploadFile = File(...)):
    """Accept .txt or .pdf upload and return extracted text."""
    try:
        content = await file.read()
        filename_lower = (file.filename or "").lower()

        if filename_lower.endswith(".pdf"):
            try:
                import pdfplumber
                import io
                with pdfplumber.open(io.BytesIO(content)) as pdf:
                    text = "\n".join(p.extract_text() or "" for p in pdf.pages)
            except ImportError:
                raise HTTPException(status_code=500, detail="pdfplumber not installed.")
        else:
            text = content.decode("utf-8", errors="ignore")

        if not text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from file.")

        return {"text": text, "filename": file.filename, "size": len(content)}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/analyze/explain")
def analyze_explain(req: AnalyzeRequest):
    system = (
        "You are a contract analysis expert. Analyze the contract and return EXACTLY "
        "this format — one line per field, no extra text:\n"
        "PAYMENT_TERMS: <one clear sentence>\n"
        "TERMINATION: <one clear sentence>\n"
        "IP_OWNERSHIP: <one clear sentence>\n"
        "LIABILITY: <one clear sentence>\n"
        "GOVERNING_LAW: <one clear sentence>\n"
        "DURATION: <one clear sentence>\n"
        "KEY_OBLIGATIONS: <one clear sentence>"
    )
    try:
        raw = call_openai(system, f"Analyze this contract:\n\n{req.contract_text}", max_tokens=800)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    label_map = {
        "PAYMENT_TERMS":  "Payment Terms",
        "TERMINATION":    "Termination",
        "IP_OWNERSHIP":   "IP Ownership",
        "LIABILITY":      "Liability Cap",
        "GOVERNING_LAW":  "Governing Law",
        "DURATION":       "Contract Duration",
        "KEY_OBLIGATIONS":"Key Obligations",
    }
    items = []
    for line in raw.split("\n"):
        if ":" not in line:
            continue
        key, _, val = line.partition(":")
        key = key.strip()
        val = val.strip()
        if key in label_map and val:
            items.append({"key": key, "label": label_map[key], "value": val})
    return {"items": items}


@app.post("/analyze/risk")
def analyze_risk(req: AnalyzeRequest):
    system = (
        "You are a contract risk analyst. Return ONLY valid JSON — no markdown, no extra text:\n"
        '{"score":<integer 0-100>,"level":"<Low|Medium|High>",'
        '"issues":[{"title":"...","severity":"<high|medium|low>","detail":"..."}],'
        '"summary":"..."}'
    )
    try:
        raw = call_openai(system, f"Assess risks in this contract:\n\n{req.contract_text}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    data = safe_json(raw)
    if not data:
        data = {"score": 50, "level": "Medium", "issues": [], "summary": "Could not parse risk data."}
    return data


@app.post("/analyze/financial")
def analyze_financial(req: AnalyzeRequest):
    system = (
        "You are a financial contract analyst. Return ONLY valid JSON — no markdown, no extra text:\n"
        '{"monthly_fee":<number or null>,"contract_value":<number or null>,"currency":"INR",'
        '"scenarios":[{"name":"...","formula":"...","amount":<number>,"description":"..."}],'
        '"summary":"..."}\n'
        "Extract actual numbers from the contract. Compute realistic penalty/termination scenarios."
    )
    try:
        raw = call_openai(system, f"Extract financial details from this contract:\n\n{req.contract_text}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    data = safe_json(raw)
    if not data:
        data = {
            "monthly_fee": None, "contract_value": None, "currency": "INR",
            "scenarios": [], "summary": "Could not parse financial data."
        }
    return data


@app.post("/analyze/fraud")
def analyze_fraud(req: AnalyzeRequest):
    try:
        return detect_fraud(req.contract_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/chat")
def chat(req: ChatRequest):
    system = (
        "You are a contract analysis assistant. Answer questions based ONLY on the contract below. "
        "Be specific about clauses. Keep answers under 200 words.\n\n"
        f"CONTRACT:\n{req.contract_text}"
    )
    messages = req.history + [{"role": "user", "content": req.message}]
    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "system", "content": system}] + messages,
            max_tokens=600,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {"reply": response.choices[0].message.content}


@app.post("/translate")
def translate_contract(req: TranslateRequest):
    system = (
        "You are a professional legal document translator specializing in Indian languages."
    )
    user = (
        f"First summarize this contract in 3-4 sentences in English. "
        f"Then translate that summary into {req.target_language}.\n"
        f'Return ONLY valid JSON — no markdown:\n'
        f'{{"summary_en":"...","translated_text":"...","language":"{req.target_language}"}}\n\n'
        f"CONTRACT:\n{req.contract_text}"
    )
    try:
        raw = call_openai(system, user, max_tokens=1000)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    data = safe_json(raw)
    if not data or "translated_text" not in data:
        data = {
            "summary_en": "Translation failed. Please try again.",
            "translated_text": "",
            "language": req.target_language,
        }
    return data