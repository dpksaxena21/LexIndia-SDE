import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://lexsindia.com', lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: 'https://lexsindia.com/research', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: 'https://lexsindia.com/assistant', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: 'https://lexsindia.com/drafts', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: 'https://lexsindia.com/scan', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: 'https://lexsindia.com/vault', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: 'https://lexsindia.com/plain', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: 'https://lexsindia.com/login', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: 'https://lexsindia.com/register', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ]
}
