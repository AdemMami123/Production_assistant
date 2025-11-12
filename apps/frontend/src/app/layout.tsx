import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/styles/globals.css'
import { EnvironmentProvider } from '@/components/EnvironmentProvider'
import { WorkspaceProvider } from '@/contexts/WorkspaceContext'
import { ToastProvider } from '@/contexts/ToastContext'
import { ToastContainer } from '@/components/ToastContainer'
import { ConditionalHeader } from '@/components/ConditionalHeader'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Productivity Assistant',
  description: 'Your personal productivity companion',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <EnvironmentProvider>
          <WorkspaceProvider>
            <ToastProvider>
              <ConditionalHeader />
              {children}
              <ToastContainer />
            </ToastProvider>
          </WorkspaceProvider>
        </EnvironmentProvider>
      </body>
    </html>
  )
}
