import satori from 'satori'
import sharp from 'sharp'

async function fetchGoogleFont(family, weight) {
  const css = await fetch(
    `https://fonts.googleapis.com/css?family=${family}:${weight}`,
    { headers: { 'User-Agent': 'Mozilla/5.0' } }
  ).then(r => r.text())
  const url = css.match(/src: url\((.+?)\)/)?.[1]
  if (!url) throw new Error(`Font URL not found for ${family}:${weight}`)
  return fetch(url).then(r => r.arrayBuffer())
}

async function fetchImageAsDataUrl(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch image ${url}: ${res.status}`)
  const ct = res.headers.get('content-type') || ''
  // A host that answers 200 with an HTML page (SPA fallback, login wall) would
  // otherwise reach satori as a data:text/html URL and fail as "u is not iterable".
  if (!ct.startsWith('image/')) {
    throw new Error(`Not an image: ${url} returned ${ct || 'no content-type'}`)
  }
  const buf = Buffer.from(await res.arrayBuffer())
  return `data:${ct};base64,${buf.toString('base64')}`
}

function cardElement({ nome, titulo, numLabel, accentColor, panelBg, rightBg, fotoDataUrl, logoDataUrl }) {
  const nameFontSize = nome.length > 24 ? 30 : nome.length > 18 ? 36 : 42

  return {
    type: 'div',
    props: {
      style: {
        width: '856px',
        height: '540px',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Inter',
        borderRadius: '24px',
        overflow: 'hidden',
      },
      children: [
        // Main row
        {
          type: 'div',
          props: {
            style: { display: 'flex', flex: '1' },
            children: [
              // LEFT dark panel — photo
              {
                type: 'div',
                props: {
                  style: {
                    width: '296px',
                    flexShrink: '0',
                    backgroundColor: panelBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                  },
                  children: [
                    // top accent stripe
                    {
                      type: 'div',
                      props: {
                        style: {
                          position: 'absolute',
                          top: '0', left: '0', right: '0',
                          height: '4px',
                          backgroundColor: accentColor,
                        },
                      },
                    },
                    // photo
                    {
                      type: 'img',
                      props: {
                        src: fotoDataUrl,
                        width: 200,
                        height: 280,
                        style: {
                          width: '200px',
                          height: '280px',
                          objectFit: 'cover',
                          borderRadius: '14px',
                          border: `4px solid ${accentColor}`,
                        },
                      },
                    },
                  ],
                },
              },
              // RIGHT panel — content
              {
                type: 'div',
                props: {
                  style: {
                    flex: '1',
                    backgroundColor: rightBg,
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '36px 44px 28px 44px',
                    position: 'relative',
                  },
                  children: [
                    // top accent stripe
                    {
                      type: 'div',
                      props: {
                        style: {
                          position: 'absolute',
                          top: '0', left: '0', right: '0',
                          height: '4px',
                          backgroundColor: accentColor,
                        },
                      },
                    },
                    // Logo
                    ...(logoDataUrl ? [{
                      type: 'div',
                      props: {
                        style: { display: 'flex', width: '100%' },
                        children: [{
                          type: 'img',
                          props: {
                            src: logoDataUrl,
                            width: 344,
                            height: 88,
                            style: {
                              width: '344px',
                              height: '88px',
                              objectFit: 'contain',
                            },
                          },
                        }],
                      },
                    }] : [{
                      type: 'div',
                      props: {
                        style: { display: 'flex', flexDirection: 'column' },
                        children: [
                          { type: 'div', props: { style: { fontSize: '15px', fontWeight: '700', color: '#0d1926' }, children: 'Associação Portuguesa' } },
                          { type: 'div', props: { style: { fontSize: '15px', fontWeight: '700', color: '#0d1926' }, children: 'de Criminologia' } },
                        ],
                      },
                    }]),
                    // spacer
                    { type: 'div', props: { style: { flex: '1' } } },
                    // name + title
                    {
                      type: 'div',
                      props: {
                        style: { display: 'flex', flexDirection: 'column', gap: '6px' },
                        children: [
                          {
                            type: 'div',
                            props: {
                              style: { fontSize: `${nameFontSize}px`, fontWeight: '800', color: '#111820', lineHeight: '1.1' },
                              children: nome,
                            },
                          },
                          ...(titulo ? [{
                            type: 'div',
                            props: {
                              style: { fontSize: '16px', fontWeight: '600', color: accentColor, letterSpacing: '0.12em' },
                              children: titulo.toUpperCase(),
                            },
                          }] : []),
                        ],
                      },
                    },
                    // spacer
                    { type: 'div', props: { style: { height: '22px' } } },
                    // number with accent bar
                    {
                      type: 'div',
                      props: {
                        style: { display: 'flex', alignItems: 'center', gap: '14px' },
                        children: [
                          {
                            type: 'div',
                            props: {
                              style: { width: '3px', height: '32px', borderRadius: '2px', backgroundColor: accentColor },
                            },
                          },
                          {
                            type: 'div',
                            props: {
                              style: { fontSize: '24px', fontWeight: '700', color: '#111820' },
                              children: numLabel,
                            },
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
        // Footer bar
        {
          type: 'div',
          props: {
            style: {
              height: '46px',
              backgroundColor: panelBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 32px',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: { fontSize: '12px', fontWeight: '400', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.04em' },
                  children: 'apcriminologia.com',
                },
              },
              // three dots
              {
                type: 'div',
                props: {
                  style: { display: 'flex', gap: '5px', alignItems: 'center' },
                  children: [
                    { type: 'div', props: { style: { width: '5px', height: '5px', borderRadius: '50%', backgroundColor: accentColor } } },
                    { type: 'div', props: { style: { width: '5px', height: '5px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)' } } },
                    { type: 'div', props: { style: { width: '5px', height: '5px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)' } } },
                  ],
                },
              },
              {
                type: 'div',
                props: {
                  style: { fontSize: '12px', fontWeight: '400', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.04em' },
                  children: 'apcriminologia@gmail.com',
                },
              },
            ],
          },
        },
      ],
    },
  }
}

export async function generateCard({ nome, genero, temLicenciatura, numeroSocio, fotoUrl, siteUrl }) {
  const base = siteUrl || 'https://apcriminologia.com'

  const [fontRegular, fontBold, fontExtrabold, fotoDataUrl, logoDataUrl] = await Promise.all([
    fetchGoogleFont('Inter', 400),
    fetchGoogleFont('Inter', 700),
    fetchGoogleFont('Inter', 800),
    fetchImageAsDataUrl(fotoUrl),
    fetchImageAsDataUrl(`${base}/logo_cartao.png`).catch(() => null),
  ])

  // Criminólogos: navy escuro + vermelho + fundo branco
  // Associados: navy escuro + verde + fundo amarelo suave
  const accentColor = temLicenciatura ? '#C0392B' : '#27AE60'
  const panelBg     = '#111820'
  const rightBg     = temLicenciatura ? '#ffffff' : '#FDF3C0'
  const titulo = temLicenciatura
    ? (genero === 'Feminino' ? 'Criminóloga' : 'Criminólogo')
    : null
  const numLabel = temLicenciatura ? `N.º ${numeroSocio}` : `Sócio N.º ${numeroSocio}`

  const element = cardElement({ nome, titulo, numLabel, accentColor, panelBg, rightBg, fotoDataUrl, logoDataUrl })

  const svg = await satori(element, {
    width: 856,
    height: 540,
    fonts: [
      { name: 'Inter', data: fontRegular, weight: 400, style: 'normal' },
      { name: 'Inter', data: fontBold, weight: 700, style: 'normal' },
      { name: 'Inter', data: fontExtrabold, weight: 800, style: 'normal' },
    ],
  })

  return sharp(Buffer.from(svg)).png().toBuffer()
}
