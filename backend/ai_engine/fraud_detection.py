import anthropic, json, re
client = anthropic.Anthropic()

SYSTEM = """You are a contract fraud detection specialist.
Return ONLY valid JSON — no markdown, no extra text:
{
  "fraud_score": <integer 0-100>,
  "alert_level": "<Safe|Caution|Warning|Alert>",
  "hidden_charges": [{"title": "...", "detail": "...", "clause_ref": "...", "estimated_impact": "..."}],
  "suspicious_clauses": [{"title": "...", "issue": "...", "severity": "<high|medium|low>", "benchmark": "..."}],
  "one_sided_terms": ["..."],
  "missing_protections": ["..."],
  "recommendations": ["..."],
  "summary": "..."
}"""

def analyze(contract_text: str) -> dict:
    msg = client.messages.create(
        model="claude-opus-4-5", max_tokens=1200, system=SYSTEM,
        messages=[{"role": "user", "content": f"Detect hidden charges and fraud in:\n\n{contract_text}"}],
    )
    raw = msg.content[0].text
    cleaned = re.sub(r"```(?:json)?", "", raw).strip().rstrip("`")
    try:
        return json.loads(cleaned)
    except:
        return {"fraud_score": 0, "alert_level": "Safe", "hidden_charges": [],
                "suspicious_clauses": [], "one_sided_terms": [], "missing_protections": [],
                "recommendations": [], "summary": "Could not parse."}