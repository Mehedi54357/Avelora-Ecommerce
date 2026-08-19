import type { Metadata } from 'next';
import './globals.css';
import LayoutProvider from '../components/layout-provider';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://avelora.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'AVELORA | Elegance in Every Choice - Luxury Fashion, Hijabs, Jewellery & Leather',
    template: '%s | AVELORA',
  },
  description:
    'AVELORA presents an exclusive haute heritage collection for Women, Men & Kids — featuring Turkish Silk Hijabs, traditional কাঁচের ও রেশমি চুড়ি, 18K Fine Jewellery, Italian Leather Loafers, and Festive Gowns.',
  keywords: [
    'AVELORA',
    'AVELORA BD',
    'luxury fashion Bangladesh',
    'Turkish Silk Hijab',
    'কাঁচের চুড়ি',
    'রেশমি চুড়ি',
    'Bangles Bangladesh',
    'Fine Jewellery',
    'Italian Leather Loafers',
    'Men Panjabi',
    'Kids Festive Gowns',
  ],
  authors: [{ name: 'AVELORA Atelier' }],
  creator: 'AVELORA',
  publisher: 'AVELORA',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'bn_BD',
    url: siteUrl,
    title: 'AVELORA | Elegance in Every Choice',
    description:
      'Haute heritage curation for Women, Men & Kids. Complimentary signature gift packaging with express delivery across Bangladesh.',
    siteName: 'AVELORA',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=80',
        width: 1200,
        height: 630,
        alt: 'AVELORA Luxury Haute Collection',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AVELORA | Elegance in Every Choice',
    description:
      'Haute heritage curation for Women, Men & Kids. Express delivery across Bangladesh.',
    images: ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=80'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased bg-[#FAFAF8] text-[#111827]">
        <LayoutProvider>{children}</LayoutProvider>
      </body>
    </html>
  );
}

