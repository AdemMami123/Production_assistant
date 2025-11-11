import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/styles/globals.css'
import { EnvironmentProvider } from '@/components/EnvironmentProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Productivity Assistant',
  description: 'Your personal productivity companion',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <EnvironmentProvider>{children}</EnvironmentProvider>
      </body>
    </html>
  )
}
