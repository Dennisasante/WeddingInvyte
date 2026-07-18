import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'WeddingInvite',
  description: 'Every love story deserves a beautiful invitation.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-body">{children}</body>
    </html>
  );
}
