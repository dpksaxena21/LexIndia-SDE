import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from './auth/AuthContext'
import MobileNav from './components/BottomNav'

export const metadata: Metadata = {
  title: 'LexIndia — AI Legal Research for Indian Advocates',
  description: 'AI-powered legal research, case law search, document drafting and analysis for Indian lawyers. Search 27 crore judgments. Built for BNS, BNSS, IPC, CrPC and Indian courts.',
  keywords: 'Indian legal research, AI legal assistant India, BNS BNSS IPC CrPC, Indian case law search, bail application generator, legal document drafting India, Indian Kanoon AI, advocate tools India',
  authors: [{ name: 'LexIndia' }],
  creator: 'LexIndia',
  publisher: 'LexIndia',
  metadataBase: new URL('https://lexsindia.com'),
  alternates: {
    canonical: 'https://lexsindia.com',
  },
  openGraph: {
    title: 'LexIndia — AI Legal Research for Indian Advocates',
    description: 'Search 27 crore judgments, draft legal documents, and get AI legal analysis. Built for Indian advocates.',
    url: 'https://lexsindia.com',
    siteName: 'LexIndia',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LexIndia — AI Legal Research for Indian Advocates',
    description: 'Search 27 crore judgments, draft legal documents, and get AI legal analysis. Built for Indian advocates.',
  },
  verification: {
    google: '6hrDh4_-twQXNRIps8xHMi9-onbp1NLv0seZMvJsLMA',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
  <AuthProvider>
    {children}
    <MobileNav />
  </AuthProvider>
</body>
    </html>
  )
}