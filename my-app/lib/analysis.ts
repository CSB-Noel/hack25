export interface RawTransaction {
  purchase_id: string
  merchant_id: string
  amount: number
  description: string
  purchase_date: string
}

export interface ClassifiedItem {
  purchase_id: string
  merchant_id: string
  amount: number
  purchase_date: string
  description: string
  category: string
  reason: string
  confidence: number
}

export interface AnalyzeRequest {
  transactions: RawTransaction[]
}

export interface AnalyzeResponse {
  classified: ClassifiedItem[]
}

// Small parser that normalizes a backend response into AnalyzeResponse
export function normalizeAnalyzeResponse(body: any): AnalyzeResponse {
  // backend returns either { classified: [...] } or a raw array (depending on model output)
  if (!body) return { classified: [] }
  if (Array.isArray(body)) return { classified: body }
  if (body.classified && Array.isArray(body.classified)) return { classified: body.classified }
  // try to detect an array on first level
  const keys = Object.keys(body)
  for (const k of keys) {
    if (Array.isArray(body[k])) return { classified: body[k] }
  }
  return { classified: [] }
}
