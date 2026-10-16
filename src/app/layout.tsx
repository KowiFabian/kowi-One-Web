import type { Metadata, Viewport } from 'next';
import './globals.css';
import KowiDemoWidget from '@/components/KowiDemoWidget';

export const metadata: Metadata = {
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, title: 'KOWI IA', statusBarStyle: 'default' },
  title: 'KOWI IA | Inteligencia artificial para convertir ideas en acción',
  description: 'KOWI IA conecta personas, ideas y agentes de inteligencia artificial. Aprende, crea, emprende y transforma tus objetivos en acciones.',
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