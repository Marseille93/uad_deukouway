import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'UAD Deukouway - Logements étudiants à Bambey',
  description: 'Plateforme de logements étudiants pour l\'Université Alioune Diop de Bambey. Trouvez ou publiez des annonces de chambres, appartements et maisons.',
  keywords: 'logement étudiant, Bambey, UAD, université, colocation, chambre, appartement',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}