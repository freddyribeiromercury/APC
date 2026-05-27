import formidable from 'formidable'
import fs from 'fs'
import { sanity } from './lib/sanity.js'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.SITE_URL || 'https://apcriminologia.com')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' })

  try {
    const form = formidable({ maxFileSize: 5 * 1024 * 1024 })
    const [fields, files] = await form.parse(req)

    const get = (key) => (Array.isArray(fields[key]) ? fields[key][0] : fields[key]) || ''

    const fotoFile = files.foto?.[0]
    if (!fotoFile) return res.status(400).json({ error: 'Fotografia obrigatória' })

    const nome = get('nome')
    const email = get('email')
    if (!nome || !email) return res.status(400).json({ error: 'Nome e email são obrigatórios' })

    // Upload photo to Sanity
    const fotoBuffer = fs.readFileSync(fotoFile.filepath)
    const fotoAsset = await sanity.assets.upload('image', fotoBuffer, {
      filename: fotoFile.originalFilename || 'foto.jpg',
      contentType: fotoFile.mimetype || 'image/jpeg',
    })

    // Create member document
    const doc = await sanity.create({
      _type: 'membro',
      nome,
      genero: get('genero'),
      email,
      telemovel: get('telemovel'),
      cartaoCidadao: get('cartaoCidadao'),
      morada: get('morada'),
      temLicenciatura: get('temLicenciatura') === 'true',
      foto: { _type: 'image', asset: { _type: 'reference', _ref: fotoAsset._id } },
      ativo: false,
      cartaoEnviado: false,
      dataSubmissao: new Date().toISOString(),
    })

    // Notify admin
    const studioUrl = `https://apc-criminologia.sanity.studio/structure/membro;${doc._id}`
    const tipoSocio = get('temLicenciatura') === 'true'
      ? 'Com licenciatura em Criminologia (cartão cinzento)'
      : 'Sem licenciatura (cartão amarelo)'

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: process.env.ADMIN_EMAIL,
      subject: `Novo pedido de inscrição — ${nome}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
          <h2 style="color:#1a2a36;">Novo pedido de inscrição na APC</h2>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px 0;color:#666;">Nome</td><td style="padding:8px 0;font-weight:600;">${nome}</td></tr>
            <tr><td style="padding:8px 0;color:#666;">Email</td><td style="padding:8px 0;">${email}</td></tr>
            <tr><td style="padding:8px 0;color:#666;">Telemóvel</td><td style="padding:8px 0;">${get('telemovel')}</td></tr>
            <tr><td style="padding:8px 0;color:#666;">Tipo de sócio</td><td style="padding:8px 0;">${tipoSocio}</td></tr>
          </table>
          <div style="margin-top:24px;">
            <a href="${studioUrl}" style="background:#C0392B;color:#fff;padding:12px 24px;text-decoration:none;border-radius:4px;font-weight:600;display:inline-block;">
              Aprovar no Sanity Studio →
            </a>
          </div>
          <p style="color:#999;font-size:12px;margin-top:24px;">Para aprovar: abrir o link, mudar o campo "Ativo" para ✓ e publicar o documento.</p>
        </div>
      `,
    })

    try { fs.unlinkSync(fotoFile.filepath) } catch (_) {}

    return res.status(200).json({ success: true, id: doc._id })
  } catch (err) {
    console.error('[inscricao]', err)
    return res.status(500).json({ error: 'Erro interno. Por favor tente mais tarde.', _debug: err?.message || String(err) })
  }
}
