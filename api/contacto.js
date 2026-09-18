import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const escapeHtml = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const stripCrlf = (s = '') => String(s).replace(/[\r\n]+/g, ' ').trim()

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.SITE_URL || 'https://apcriminologia.com')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' })

  try {
    const { nome, email, assunto, mensagem } = req.body || {}

    if (!nome || !email || !mensagem) {
      return res.status(400).json({ error: 'Nome, email e mensagem são obrigatórios' })
    }
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ error: 'Email inválido' })
    }

    const assuntoLimpo = stripCrlf(assunto).slice(0, 200)

    const { error: emailError } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: 'geral@apcriminologia.com',
      replyTo: email,
      subject: assuntoLimpo ? `[Contacto site] ${assuntoLimpo}` : `[Contacto site] Nova mensagem de ${stripCrlf(nome).slice(0, 200)}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
          <h2 style="color:#1a2a36;">Nova mensagem do formulário de contacto</h2>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px 0;color:#666;">Nome</td><td style="padding:8px 0;font-weight:600;">${escapeHtml(nome)}</td></tr>
            <tr><td style="padding:8px 0;color:#666;">Email</td><td style="padding:8px 0;">${escapeHtml(email)}</td></tr>
            <tr><td style="padding:8px 0;color:#666;">Assunto</td><td style="padding:8px 0;">${escapeHtml(assuntoLimpo) || '—'}</td></tr>
          </table>
          <p style="color:#666;margin-top:16px;">Mensagem:</p>
          <p style="white-space:pre-wrap;">${escapeHtml(mensagem)}</p>
        </div>
      `,
    })
    if (emailError) {
      console.error('[contacto] Resend error:', emailError)
      return res.status(502).json({ error: 'Não foi possível enviar a mensagem. Tente mais tarde.' })
    }

    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('[contacto]', err)
    return res.status(500).json({ error: 'Erro interno. Por favor tente mais tarde.' })
  }
}
