import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Email Scheduler',
  description: 'Simple recurring email scheduler',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">{children}</body>
    </html>
  );
}
