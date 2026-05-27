import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

export const sanity = createClient({
  projectId: process.env.SANITY_PROJECT_ID || 'v8cpwm2k',
  dataset: process.env.SANITY_DATASET || 'production',
  token: process.env.SANITY_API_TOKEN,
  apiVersion: '2024-01-01',
  useCdn: false,
})

const builder = imageUrlBuilder(sanity)
export const imageUrl = (source) => builder.image(source)
