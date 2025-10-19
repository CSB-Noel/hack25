import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { normalizeAnalyzeResponse } from '../../../lib/analysis'
// helper that strips code fences and extracts JSON
import { tryParseJSON } from '../../../lib/parseBackendResponse'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    // console.log('[api/analyze] incoming body:', JSON.stringify(body).slice(0, 2000))

    const res = await fetch(`${BACKEND_URL}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const text = await res.text()

    // Log raw backend response for debugging
    // console.log('[api/analyze] backend response status:', res.status)
    // console.log('[api/analyze] backend response text (first 2000 chars):', text.slice(0, 2000))
    // also log a longer slice for deeper inspection
    try {
    //   console.log('[api/analyze] backend response text (full trimmed 10000 chars):', text.slice(0, 10000))
    } catch (e) {}

  // backend returns JSON; sometimes the model output is nested in `result` as a string
    let parsed: any = null
    // try a robust parse that handles markdown fences and surrounding text
  parsed = tryParseJSON(text)
    // console.log('[api/analyze] tryParseJSON returned:', parsed ? '[object]' : null)
    if (parsed) {
      try {
        // console.log('[api/analyze] parsed (stringified, truncated):', JSON.stringify(parsed).slice(0, 4000))
      } catch (e) { 
        // console.log('[api/analyze] parsed (non-serializable)') 
    }
    }
    if (!parsed) {
      try {
        // fallback to JSON.parse once more
        parsed = JSON.parse(text)
        // console.log('[api/analyze] JSON.parse fallback succeeded')
      } catch (e) {
        // console.log('[api/analyze] could not parse backend response as JSON')
      }
    }

    // if the backend wrapped the model output in `result` (string), try parsing that too
    if (parsed && typeof parsed.result === 'string') {
      const inner = tryParseJSON(parsed.result) || (function() { try { return JSON.parse(parsed.result) } catch(e){ return null } })()
      if (inner) {
        parsed = inner
        // console.log('[api/analyze] parsed nested result JSON after unwrapping code fences')
      } else {
        // console.log('[api/analyze] could not parse nested result as JSON even after unwrapping')
      }
    }

    // console.log('[api/analyze] final parsed object keys:', parsed && typeof parsed === 'object' ? Object.keys(parsed) : typeof parsed)

    // normalize and log normalized result
    const normalized = normalizeAnalyzeResponse(parsed)
    try {
    //   console.log('[api/analyze] normalized.classified length:', Array.isArray(normalized.classified) ? normalized.classified.length : 'not-array')
    //   console.log(normalized)
    } catch (e) {}
    // Return normalized classified array and also include raw debug info so UI or curl can inspect
    return NextResponse.json({ ...normalized, debug: { rawText: text, parsed } })
  } catch (err: any) {
    return NextResponse.json({ classified: [], error: String(err) }, { status: 500 })
  }
}
