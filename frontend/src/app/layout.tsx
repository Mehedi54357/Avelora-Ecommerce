import type { Metadata } from 'next';
import './globals.css';
import LayoutProvider from '../components/layout-provider';

export const metadata: Metadata = {
  title: 'AVELORA | Elegance in Every Choice - Luxury Handbags, Perfumes & Accessories',
  description:
    'Discover AVELORA’s bespoke collection of luxury handcrafted leather handbags, artisanal Parisian perfumes, Swiss timepieces, and 18K gold designer accessories. Complimentary gift packaging with nationwide express delivery.',
  keywords: 'AVELORA, luxury handbags, perfumes, gold watches, designer jewelry, fashion Bangladesh',
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
