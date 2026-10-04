import type { Metadata, Viewport } from 'next';
import './globals.css';
import KowiDemoWidget from '@/components/KowiDemoWidget';

export const metadata: Metadata = {
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, title: 'KOWI', statusBarStyle: 'default' },
  title: 'Kowi One | Ideas que se convierten en acción',
  description: 'Kowi conecta ideas, personas y agentes de IA. Explora Kowi Business o convierte tu intención en un plan concreto.',
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#071612' };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-secondary text-gray-900">
        {children}
        <KowiDemoWidget />
      </body>
    </html>
  );
}