import crypto from 'crypto'
import { sanity, imageUrl } from './lib/sanity.js'
import { generateCard } from './lib/generate-card.js'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

function verifySignature(rawBody, secret, signature) {
  if (!secret || !signature) return !secret // skip verification if no secret configured
  try {
    const hmac = crypto.createHmac('sha256', secret)
    hmac.update(rawBody)
    const expected = hmac.digest('base64')
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  } catch {
    return false
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  // Collect raw body for signature verification
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  const rawBody = Buffer.concat(chunks).toString('utf8')

  const signature = req.headers['sanity-webhook-signature'] || ''
  if (!verifySignature(rawBody, process.env.SANITY_WEBHOOK_SECRET, signature)) {
    return res.status(401).json({ error: 'Assinatura inválida' })
  }

  let payload
  try { payload = JSON.parse(rawBody) } catch {
    return res.status(400).json({ error: 'Payload inválido' })
  }

  // Sanity sends the document as the root payload or inside .result
  const doc = payload._id ? payload : (payload.result ?? payload.after ?? {})

  if (!doc._id || !doc.ativo || doc.cartaoEnviado) {
    return res.json({ skip: true })
  }

  try {
    // Assign member number (series starts at 2000)
    const maxNumero = await sanity.fetch(
      `*[_type == "membro" && defined(numeroSocio)] | order(numeroSocio desc)[0].numeroSocio`
    )
    const numeroSocio = Math.max(maxNumero ?? 1999, 1999) + 1

    // Immediately mark as sent to prevent duplicates on retry
    await sanity
      .patch(doc._id)
      .set({
        numeroSocio,
        cartaoEnviado: true,
        dataAprovacao: new Date().toISOString(),
      })
      .commit()

    // Generate card
    const fotoUrl = imageUrl(doc.foto).width(400).height(500).fit('crop').url()
    const cardPng = await generateCard({
      nome: doc.nome,
      genero: doc.genero,
      temLicenciatura: doc.temLicenciatura,
      numeroSocio,
      fotoUrl,
      siteUrl: process.env.SITE_URL,
    })

    // Send welcome email with card attachment
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: doc.email,
      subject: `Bem-vindo(a) à APC — Cartão de Sócio N.º ${numeroSocio}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1a2a36;">
          <img src="${process.env.SITE_URL || 'https://apcriminologia.com'}/logotopo.png"
               alt="APC" style="height:48px;margin-bottom:24px;" />
          <h2>Bem-vindo(a) à Associação Portuguesa de Criminologia</h2>
          <p>Caro(a) <strong>${doc.nome}</strong>,</p>
          <p>A sua inscrição foi aprovada. O seu cartão de sócio <strong>N.º ${numeroSocio}</strong> segue em anexo.</p>
          <p>Guarde-o no seu dispositivo — pode apresentá-lo sempre que necessário.</p>
          <hr style="border:none;border-top:1px solid #e8eff3;margin:24px 0;" />
          <p style="color:#666;font-size:13px;">
            Associação Portuguesa de Criminologia<br />
            apcriminologia@gmail.com | apcriminologia.com
          </p>
        </div>
      `,
      attachments: [
        {
          filename: `cartao-socio-${numeroSocio}.png`,
          content: Buffer.from(cardPng).toString('base64'),
        },
      ],
    })

    return res.json({ success: true, numeroSocio })
  } catch (err) {
    console.error('[webhook-aprovacao]', err)
    return res.status(500).json({ error: err.message })
  }
}
