import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'LexIndia — AI Legal Research for Indian Advocates',
  description: 'Research, drafting, case tracking, file storage and AI assistance for Indian lawyers. Built for BNS, BNSS, IPC and eCourts.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}