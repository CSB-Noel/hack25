from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import requests
import os
import json

app = FastAPI()

OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY", "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")

class AnalyzeRequest(BaseModel):
    transactions: list

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
{json.dumps(request.transactions, ensure_ascii=False, indent=2)}

"""
                    }
                ]
            }
        ],
        "temperature": 0.5,
    }

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