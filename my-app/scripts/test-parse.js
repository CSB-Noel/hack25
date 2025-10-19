const { tryParseJSON } = require('../lib/parseBackendResponse')

const samples = [
  '{"classified":[{"purchase_id":"1","merchant_id":"m","amount":10}] }',
  '```json\n{"classified":[{"purchase_id":"1","merchant_id":"m","amount":10}]}\n```',
  'Here is the output:\n```json\n{"classified":[{"purchase_id":"1","merchant_id":"m","amount":10}]}\n```\nthanks',
  'Some text [metadata]\n{"classified":[{"purchase_id":"1","merchant_id":"m","amount":10}]}\nmore text',
  '[{"purchase_id":"1","merchant_id":"m","amount":10}]',
]

for (const s of samples) {
  const parsed = tryParseJSON(s)
  console.log('--- sample ---')
  console.log(s)
  console.log('parsed =>', parsed)
}
