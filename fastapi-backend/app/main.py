from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import requests
import os
import json

app = FastAPI()

OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY", "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")

# Load sample transactions from data.json (used instead of request.transactions)
DATA_FILE = os.path.join(os.path.dirname(__file__), 'data.json')
try:
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        DATA = json.load(f)
except Exception:
    DATA = { 'transactions': [] }

class AnalyzeRequest(BaseModel):
    transactions: list

class InsightRequest(BaseModel):
    transactions: list


#Analyze returns the category data. Used for the graph and the insights if necessary.
@app.post("/analyze")
def analyze(request: AnalyzeRequest):
    payload = {
        "model": "google/gemini-2.5-flash",
        "messages": [
            {
                "role": "system",
                "content": "You are a Senior Financial Data Analyst specializing in consumer behavior. Your task is to analyze the provided list of financial purchases. Your output MUST be a single, valid JSON array containing one object for each input purchase. You must preserve the original 'purchase_id' and add the following calculated fields."
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": f""" 
You are a financial transaction classifier.

TASK
Categorize each transaction into exactly ONE enum category. Keep output compact.

INPUT FIELDS PER TRANSACTION
- purchase_id, merchant_id, amount, description, purchase_date

ENUM CATEGORIES
- Fixed::Housing
- Fixed::Debt
- Fixed::Subscriptions
- Variable::Groceries
- Variable::Dining/Takeout
- Variable::Transportation
- Variable::Health&Personal
- Variable::Impulse&Wants
- Income::Salary
- Transfer::P2P

RULES (apply in order; stop at first match)
1) PURPOSE KEYWORDS (highest precedence)
   - rent/mortgage/lease/hoa → Fixed::Housing
   - loan/student loan/interest/servicer/ach withdrawal → Fixed::Debt
   - subscription/membership/gym/prime/netflix/spotify/icloud → Fixed::Subscriptions
   - salary/payroll/direct deposit/employer → Income::Salary
2) MERCHANT HEURISTICS (if no purpose keyword)
   - Groceries: WHOLE FOODS, HEB, KROGER, COSTCO, TRADER JOE'S, ALDI
   - Dining/Takeout: STARBUCKS/ST-BUCKS, DOORDASH, UBER EATS, GRUBHUB, RESTAURANT, CAFE
   - Transportation: AIRLINES, UBER, LYFT, GAS, TRANSIT/RAIL
   - Health&Personal: CVS, WALGREENS, RITE AID, CLINIC, PHARMACY
   - Subscriptions: PRIME, GYM MEMBERSHIP, STREAMING SERVICES
   - Impulse&Wants: APPLE STORE/IN-APP, GAME, LUXURY, ELECTRONICS
   - Transfer::P2P: VENMO, CASH APP, ZELLE, PAYPAL (only if no rent/loan keyword)
3) RECURRING PATTERN (monthly ±5d, similar amount) → Fixed::Subscriptions, unless a stronger purpose keyword applies.
4) FALLBACKS
   - If discretionary and unknown → Variable::Impulse&Wants
   - If P2P with no purpose → Transfer::P2P

OUTPUT (JSON only, no extras)
{{
  "classified": [
    {{
      "purchase_id": string,
      "merchant_id": string,
      "amount": number,
      "purchase_date": string,
      "description": string,
      "category": string,     // one of the enums
      "reason": string,       // ≤120 chars, succinct why
      "confidence": number    // 0..1
    }}
  ]
}}

CONSTRAINTS
- Each input transaction appears exactly once.
- Choose exactly one category per transaction.
- Keep reasons brief; no long prose.
- Do not include insights or additional sections.

Transactions:
{json.dumps(DATA.get('transactions', []), ensure_ascii=False, indent=2)}
<<<<<<< Updated upstream

"""
                    }
                ]
            }
        ],
        "temperature": 0.5,
    }

    # prefer incoming request.transactions when provided, otherwise fall back to data.json
    txs = request.transactions if getattr(request, 'transactions', None) and len(getattr(request, 'transactions', [])) > 0 else DATA.get('transactions', [])
    source = 'request' if getattr(request, 'transactions', None) and len(getattr(request, 'transactions', [])) > 0 else 'data.json'
    print(f"[analyze] sending {len(txs)} transactions from {source} to OpenRouter")

    # inject the chosen transactions into the prompt payload
    payload['messages'][1]['content'][0]['text'] = payload['messages'][1]['content'][0]['text'].replace(
        json.dumps(DATA.get('transactions', []), ensure_ascii=False, indent=2),
        json.dumps(txs, ensure_ascii=False, indent=2)
    )

    response = requests.post(
        url="https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        },
        json=payload
    )

    if response.status_code == 200:
        data = response.json()
        message = data["choices"][0]["message"]["content"]
        return {"result": message}
    else:
        raise HTTPException(status_code=response.status_code, detail=response.text)
    
@app.post("/fetch_insights")
def fetch_insights(request: InsightRequest):
    payload = {
        "model": "google/gemini-2.5-flash",
        "messages": [
            {
                "role": "system",
                "content": "You are a Senior Financial Data Analyst specializing in consumer behavior. Your task is to analyze the provided list of financial purchases. Your output MUST be a single, valid JSON array containing one object for each input purchase. You must preserve the original 'purchase_id' and add the following calculated fields."
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": f""" 
You are a Senior Financial Analyst. Given a list of Capital One–style transactions, output ONLY a valid JSON array (no text, no markdown) of 3–8 insight objects matching this schema:

[
  {{
    "id": "string",
    "kind": "subscription"|"bill"|"anomaly"|"goal"|"advice",
    "title": "string",
    "merchantOrBill": "string",
    "amount": number,
    "date": "YYYY-MM-DDTHH:MM:SSZ",
    "account": "string",
    "category": "string",
    "delta30": number,
    "delta90": number,
    "aiHeader": {{
      "bullets": ["string",...],
      "nextStep": "string",
      "badges": ["priority","priceUp","duplicateSub","dueSoon","anomaly"],
      "confidence": number
    }}
  }}
]

Rules:
- Use only provided transactions; ignore pending unless relevant.
- Deltas = current − 30d/90d avg (fallback category → 0).
- IDs: purchase_id or "ins::<kind>::<merchant_id>::<YYYY-MM>".
- Round amounts to 2 decimals; ≤3 bullets/badges; confidence 0.75–0.98.
- Use concise, user-facing titles.

Detector hints:
• subscription → recurring similar-amount monthly/weekly payments  
• bill → utilities/telecom with monthly cadence (add “dueSoon” if <7 days)  
• anomaly → ≥2.5× avg or multiple same-day charges  
• goal → savings transfers or positive balance growth  
• advice → multi-service overlap (e.g. streaming bundle)

Return JSON array only.

Transactions:
{json.dumps(request.transactions, ensure_ascii=False, indent=2)}
=======
>>>>>>> Stashed changes

"""
                    }
                ]
            }
        ],
        "temperature": 0.5,
    }

    # prefer incoming request.transactions when provided, otherwise fall back to data.json
    txs = request.transactions if getattr(request, 'transactions', None) and len(getattr(request, 'transactions', [])) > 0 else DATA.get('transactions', [])
    source = 'request' if getattr(request, 'transactions', None) and len(getattr(request, 'transactions', [])) > 0 else 'data.json'
    print(f"[analyze] sending {len(txs)} transactions from {source} to OpenRouter")

    # inject the chosen transactions into the prompt payload
    payload['messages'][1]['content'][0]['text'] = payload['messages'][1]['content'][0]['text'].replace(
        json.dumps(DATA.get('transactions', []), ensure_ascii=False, indent=2),
        json.dumps(txs, ensure_ascii=False, indent=2)
    )

    response = requests.post(
        url="https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        },
        json=payload
    )

    if response.status_code == 200:
        data = response.json()
        message = data["choices"][0]["message"]["content"]
        return {"result": message}
    else:
        raise HTTPException(status_code=response.status_code, detail=response.text)
    
