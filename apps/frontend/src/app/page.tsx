'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function Home() {
  const router = useRouter()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-8"
      >
        <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Productivity Assistant
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          A modern productivity application built with Next.js, Tailwind CSS, Framer Motion, and
          Shadcn UI with Supabase Authentication
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" className="text-lg" onClick={() => router.push('/signup')}>
            Get Started
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="text-lg"
            onClick={() => router.push('/login')}
          >
            Sign In
          </Button>
        </div>
      </motion.div>
    </main>
  )
}
