// Lightweight parser to extract JSON from a backend text response.
// It avoids complex regex and handles cases where the JSON is wrapped in
// markdown code fences (```...```) or contains surrounding text.
function tryParseJSON(text) {
  if (!text || typeof text !== 'string') return null

  // 1) raw parse
  try {
    return JSON.parse(text)
  } catch (e) {
    // continue
  }

  // 2) trim and remove a leading code fence header line if present
  let candidate = text.trim()
  if (candidate.startsWith('```')) {
    const firstNewline = candidate.indexOf('\n')
    if (firstNewline !== -1) candidate = candidate.slice(firstNewline + 1)
  }

  // 3) remove trailing code fence if present
  if (candidate.endsWith('```')) {
    candidate = candidate.slice(0, -3).trim()
  }

  // 4) try parsing the cleaned candidate
  try {
    return JSON.parse(candidate)
  } catch (e) {
    // continue
  }

  // 5) attempt to extract the first {...} JSON object substring
  const firstBrace = candidate.indexOf('{')
  const lastBrace = candidate.lastIndexOf('}')
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const inner = candidate.slice(firstBrace, lastBrace + 1)
    try {
      return JSON.parse(inner)
    } catch (e) {
      // continue
    }
  }

  // 6) attempt to extract the first [...] JSON array substring
  const firstBracket = candidate.indexOf('[')
  const lastBracket = candidate.lastIndexOf(']')
  if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
    const inner = candidate.slice(firstBracket, lastBracket + 1)
    try {
      return JSON.parse(inner)
    } catch (e) {
      // continue
    }
  }

  return null
}

module.exports = { tryParseJSON }
