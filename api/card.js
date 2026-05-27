import { sanity, imageUrl } from './lib/sanity.js'
import { generateCard } from './lib/generate-card.js'

export default async function handler(req, res) {
  try {
    const { id } = req.query
    if (!id) return res.status(400).json({ error: 'Parâmetro id obrigatório' })

    const member = await sanity.fetch(
      `*[_type == "membro" && _id == $id && ativo == true][0]`,
      { id }
    )
    if (!member) return res.status(404).json({ error: 'Sócio não encontrado' })
    if (!member.numeroSocio) return res.status(400).json({ error: 'Número de sócio ainda não atribuído' })

    const fotoUrl = imageUrl(member.foto).width(400).height(500).fit('crop').url()
    const png = await generateCard({
      nome: member.nome,
      genero: member.genero,
      temLicenciatura: member.temLicenciatura,
      numeroSocio: member.numeroSocio,
      fotoUrl,
      siteUrl: process.env.SITE_URL,
    })

    res.setHeader('Content-Type', 'image/png')
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600')
    res.setHeader('Content-Disposition', `inline; filename="cartao-socio-${member.numeroSocio}.png"`)
    return res.send(png)
  } catch (err) {
    console.error('[card]', err)
    return res.status(500).json({ error: err.message, stack: err.stack?.split('\n').slice(0,3).join(' | ') })
  }
}
