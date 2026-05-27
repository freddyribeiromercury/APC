import satori from 'satori'
import sharp from 'sharp'

async function fetchArrayBuffer(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`)
  return res.arrayBuffer()
}

// Old user-agent forces Google Fonts to return TTF (not WOFF2) which satori requires
async function fetchGoogleFont(family, weight) {
  const css = await fetch(
    `https://fonts.googleapis.com/css?family=${family}:${weight}`,
    { headers: { 'User-Agent': 'Mozilla/5.0' } }
  ).then(r => r.text())
  const url = css.match(/src: url\((.+?)\)/)?.[1]
  if (!url) throw new Error(`Font URL not found for ${family}:${weight}`)
  const buf = await fetch(url).then(r => r.arrayBuffer())
  const bytes = new Uint8Array(buf).slice(0, 4)
  console.log(`[font] ${family}:${weight} url=${url.slice(-30)} size=${buf.byteLength} sig=${Array.from(bytes).map(b => b.toString(16).padStart(2,'0')).join(' ')}`)
  return buf
}

async function fetchImageAsDataUrl(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch image ${url}: ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  const ct = res.headers.get('content-type') || 'image/jpeg'
  return `data:${ct};base64,${buf.toString('base64')}`
}

function cardElement({ nome, titulo, numLabel, bgColor, fotoDataUrl, logoDataUrl }) {
  const nameFontSize = nome.length > 24 ? 36 : nome.length > 18 ? 42 : 50

  return {
    type: 'div',
    props: {
      style: {
        width: '856px',
        height: '540px',
        backgroundColor: bgColor,
        borderRadius: '34px',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Inter',
        overflow: 'hidden',
      },
      children: [
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flex: '1',
              padding: '28px 36px',
              gap: '32px',
              alignItems: 'center',
            },
            children: [
              // Photo
              {
                type: 'img',
                props: {
                  src: fotoDataUrl,
                  width: 230,
                  height: 340,
                  style: {
                    width: '230px',
                    height: '340px',
                    objectFit: 'cover',
                    borderRadius: '18px',
                    border: '6px solid #1a2966',
                    flexShrink: '0',
                  },
                },
              },
              // Right content
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'column',
                    flex: '1',
                    justifyContent: 'center',
                    gap: '16px',
                  },
                  children: [
                    // Logo + org name
                    {
                      type: 'div',
                      props: {
                        style: { display: 'flex', alignItems: 'center', gap: '14px' },
                        children: [
                          ...(logoDataUrl ? [{
                            type: 'img',
                            props: {
                              src: logoDataUrl,
                              width: 52,
                              height: 52,
                              style: { width: '52px', height: '52px', objectFit: 'contain' },
                            },
                          }] : []),
                          {
                            type: 'div',
                            props: {
                              style: { display: 'flex', flexDirection: 'column' },
                              children: [
                                {
                                  type: 'div',
                                  props: {
                                    style: { fontSize: '19px', fontWeight: '700', color: '#0d0d0d', lineHeight: '1.25' },
                                    children: 'Associação Portuguesa',
                                  },
                                },
                                {
                                  type: 'div',
                                  props: {
                                    style: { fontSize: '19px', fontWeight: '700', color: '#0d0d0d', lineHeight: '1.25' },
                                    children: 'de Criminologia',
                                  },
                                },
                              ],
                            },
                          },
                        ],
                      },
                    },
                    // Name
                    {
                      type: 'div',
                      props: {
                        style: { fontSize: `${nameFontSize}px`, fontWeight: '800', color: '#0d0d0d', lineHeight: '1.1' },
                        children: nome,
                      },
                    },
                    // Title (criminologists only)
                    ...(titulo ? [{
                      type: 'div',
                      props: {
                        style: { fontSize: '30px', fontWeight: '400', color: '#2a2a2a' },
                        children: titulo,
                      },
                    }] : []),
                    // Member number
                    {
                      type: 'div',
                      props: {
                        style: { fontSize: '36px', fontWeight: '700', color: '#0d0d0d' },
                        children: numLabel,
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
        // Footer
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 36px',
              borderTop: '1px solid rgba(0,0,0,0.18)',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: { display: 'flex', gap: '8px', alignItems: 'center' },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: { width: '30px', height: '30px', borderRadius: '6px', backgroundColor: '#1877F2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '20px', fontWeight: '800' },
                        children: 'f',
                      },
                    },
                    {
                      type: 'div',
                      props: {
                        style: { width: '30px', height: '30px', borderRadius: '6px', backgroundColor: '#2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '16px', fontWeight: '600' },
                        children: '@',
                      },
                    },
                    {
                      type: 'div',
                      props: {
                        style: { width: '30px', height: '30px', borderRadius: '6px', backgroundColor: '#4a5568', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '13px', fontWeight: '700' },
                        children: 'www',
                      },
                    },
                  ],
                },
              },
              {
                type: 'div',
                props: {
                  style: { fontSize: '15px', color: '#2a2a2a', fontWeight: '400' },
                  children: 'apcriminologia@gmail.com  |  apcriminologia.com',
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
    fetchImageAsDataUrl(`${base}/logotopo.png`).catch(() => null),
  ])

  const bgColor = temLicenciatura ? '#c8c8c8' : '#f5ca3c'
  const titulo = temLicenciatura
    ? (genero === 'Feminino' ? 'Criminóloga' : 'Criminólogo')
    : null
  const numLabel = temLicenciatura ? `N.º ${numeroSocio}` : `Sócio n.º ${numeroSocio}`

  const element = cardElement({ nome, titulo, numLabel, bgColor, fotoDataUrl, logoDataUrl })

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
