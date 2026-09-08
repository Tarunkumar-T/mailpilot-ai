import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MailPilot — Gmail Workspace',
  description: 'Functional mail application connected to real email providers, featuring an AI assistant that directly controls the application UI via natural language actions.',
  keywords: ['MailPilot', 'Gmail AI Client', 'Gmail API', 'UI Control AI Agent', 'Next.js Mail App'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="h-full overflow-hidden bg-[#f6f8fc] text-[#1f1f1f] antialiased">
        {children}
      </body>
    </html>
  );
}
