import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'Radhakrishna Panchadhatu',
    short_name: 'Radhakrishna',
    description:
      'Handcrafted Panchadhatu and surgical steel jewellery with nationwide delivery across Nepal.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#F7F5F0',
    theme_color: '#B08A45',
    icons: [
      {
        src: '/pwa-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/pwa-maskable-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
