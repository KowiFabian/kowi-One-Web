import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Kowi One | Ideas que se convierten en acción',
  description: 'Kowi conecta ideas, personas y agentes de IA. Explora Kowi Business o convierte tu intención en un plan concreto.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-secondary text-gray-900">
        {children}
      </body>
    </html>
  );
}