from dotenv import load_dotenv
load_dotenv()

from openai import OpenAI
import json
import re

client = OpenAI()

SYSTEM = """You are a contract fraud detection specialist.
Return ONLY valid JSON — no markdown, no extra text:
{
  "fraud_score": <integer 0-100>,
  "alert_level": "<Safe|Caution|Warning|Alert>",
  "hidden_charges": [{"title":"...","detail":"...","clause_ref":"...","estimated_impact":"..."}],
  "suspicious_clauses": [{"title":"...","issue":"...","severity":"<high|medium|low>","benchmark":"..."}],
  "one_sided_terms": ["..."],
  "missing_protections": ["..."],
  "recommendations": ["..."],
  "summary": "..."
}"""


def analyze(contract_text: str) -> dict:
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": SYSTEM},
            {"role": "user",   "content": f"Detect hidden charges and fraud in:\n\n{contract_text}"},
        ],
        max_tokens=1500,
    )
    raw = response.choices[0].message.content
    cleaned = re.sub(r"```(?:json)?", "", raw).strip().rstrip("`").strip()
    try:
        return json.loads(cleaned)
    except Exception:
        return {
            "fraud_score": 0,
            "alert_level": "Safe",
            "hidden_charges": [],
            "suspicious_clauses": [],
            "one_sided_terms": [],
            "missing_protections": [],
            "recommendations": [],
            "summary": "Could not parse response.",
        }