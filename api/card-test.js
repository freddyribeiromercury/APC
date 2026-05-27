import { generateCard } from './lib/generate-card.js'

export default async function handler(req, res) {
  try {
    return res.json({ ok: true, hasGenerateCard: typeof generateCard })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
