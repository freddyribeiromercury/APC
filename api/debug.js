export default async function handler(req, res) {
  const results = {}

  try {
    const s = await import('satori')
    results.satori = 'ok'
  } catch (e) {
    results.satori = e.message
  }

  try {
    const sh = await import('sharp')
    results.sharp = 'ok - ' + JSON.stringify(sh.default.versions?.sharp)
  } catch (e) {
    results.sharp = e.message
  }

  try {
    await import('./lib/generate-card.js')
    results.generateCard = 'ok'
  } catch (e) {
    results.generateCard = e.message
  }

  try {
    await import('./lib/sanity.js')
    results.sanity = 'ok'
  } catch (e) {
    results.sanity = e.message
  }

  results.platform = process.platform
  results.arch = process.arch
  results.nodeVersion = process.version

  return res.status(200).json(results)
}
