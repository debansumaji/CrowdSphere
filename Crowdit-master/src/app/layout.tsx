import type { Metadata } from 'next';
import '@/app/globals.css';
import { ErrorBoundary } from '@/components/error-boundary';
import { Navbar } from '@/components/navbar';
import { Providers } from '@/components/providers';

export const metadata: Metadata = {
  title: 'Crowdit - Live Crowdfunding on Stellar',
  description:
    'Launch and back campaigns on Stellar with stark live progress, wallet-native flows, and on-chain reward incentives.',
  keywords: ['crowdfunding', 'stellar', 'soroban', 'blockchain', 'web3'],
  authors: [{ name: 'Crowdit' }],
  openGraph: {
    title: 'Crowdit - Live Crowdfunding on Stellar',
    description: 'A sharper crowdfunding surface for creators and supporters on Stellar.',
    type: 'website',
    url: 'https://crowdit-web.vercel.app',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Crowdit',
    description: 'Crowdfunding on Stellar with live campaign updates and reward balances.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): JSX.Element {
  return (
    <html lang="en">
      <body className="font-body">
        <Providers>
          <ErrorBoundary>
            <div className="app-shell min-h-screen">
              <Navbar />
              <main
                id="top"
                className="mx-auto flex w-full max-w-[92rem] flex-col px-4 pb-20 pt-6 sm:px-6 lg:px-8"
              >
                {children}
              </main>
            </div>
          </ErrorBoundary>
        </Providers>
      </body>
    </html>
  );
}
