'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  CheckCircle2,
  Zap,
  Users,
  BarChart3,
  Calendar,
  Brain,
  ArrowRight,
  Sparkles,
} from 'lucide-react'

export default function Home() {
  const router = useRouter()

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 10,
      },
    },
  }

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Prioritization',
      description:
        'Let artificial intelligence help you prioritize tasks intelligently based on deadlines and importance',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: BarChart3,
      title: 'Task Categorization',
      description:
        'Automatically categorize and organize your tasks with AI suggestions for better workflow management',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description:
        'Create teams, assign tasks, and collaborate seamlessly with your team members in real-time',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: Calendar,
      title: 'Smart Scheduling',
      description:
        'Set due dates, receive reminders, and stay on top of your commitments with visual calendars',
      color: 'from-orange-500 to-red-500',
    },
    {
      icon: Zap,
      title: 'Kanban Board View',
      description:
        'Visualize your workflow with an intuitive kanban board - drag and drop tasks across columns effortlessly',
      color: 'from-yellow-500 to-orange-500',
    },
    {
      icon: CheckCircle2,
      title: 'Progress Tracking',
      description:
        'Monitor your productivity with real-time statistics and completion rates for personal growth',
      color: 'from-green-600 to-teal-600',
    },
  ]

  const benefits = [
    {
      title: '⚡ Stay Focused',
      description:
        'Eliminate decision fatigue by letting AI prioritize what matters most. Focus on high-impact tasks instead of juggling priorities manually.',
    },
    {
      title: '👥 Work Together',
      description:
        'Break team silos with transparent task assignment and real-time collaboration. Everyone stays aligned on what needs to be done.',
    },
    {
      title: '📊 Data-Driven Insights',
      description:
        'Get actionable metrics on productivity trends. Understand your work patterns and optimize your daily routine.',
    },
    {
      title: '🚀 Ship Faster',
      description:
        'Reduce context switching and wasted time on task management. Spend more time doing, less time organizing.',
    },
  ]

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-32 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
          <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative max-w-5xl mx-auto text-center space-y-8"
        >
          <motion.div variants={itemVariants} className="flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-600" />
            <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
              The Future of Task Management
            </span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight"
          >
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Take Control of Your Time
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed"
          >
            Productivity Assistant is your intelligent task management companion. Organize tasks,
            collaborate with teams, and let AI help you prioritize what truly matters.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
          >
            <Button
              size="lg"
              className="text-base font-semibold px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              onClick={() => router.push('/signup')}
            >
              Start Free Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-base font-semibold px-8"
              onClick={() => router.push('/login')}
            >
              Sign In
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Powerful Features Built for You</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Everything you need to manage tasks effectively and boost productivity
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div key={index} variants={itemVariants}>
                  <Card className="h-full border-none shadow-lg hover:shadow-xl transition-shadow duration-300 dark:bg-gray-800/50">
                    <CardHeader>
                      <div
                        className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-20 sm:py-24 bg-white/50 dark:bg-gray-800/30">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Why Choose Us?</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Experience the benefits that thousands of productive teams enjoy every day
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {benefits.map((benefit, index) => (
              <motion.div key={index} variants={itemVariants} className="flex gap-4">
                <div className="flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-green-500 mt-1" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{benefit.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-8 sm:p-12 text-white shadow-2xl"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Ready to Transform Your Productivity?
          </h2>
          <p className="text-lg mb-8 text-white/90">
            Join teams and individuals who are already achieving more with smarter task management.
            No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="text-base font-semibold bg-white text-purple-600 hover:bg-gray-100"
              onClick={() => router.push('/signup')}
            >
              Get Started Free
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-base font-semibold text-white border-white hover:bg-white/10"
              onClick={() => router.push('/login')}
            >
              Sign In
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Footer Info */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-12 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <h3 className="font-semibold text-lg mb-2">For Individuals</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your personal tasks with AI assistance and beautiful visualizations
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">For Teams</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Collaborate seamlessly and keep your team aligned on priorities
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Powered by AI</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Smart prioritization and categorization to save you time daily
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
