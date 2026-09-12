import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Kowi - Tu intención. Tu camino. Tu acción.',
  description: 'Convierte tu objetivo en un plan concreto de 30 días.',
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