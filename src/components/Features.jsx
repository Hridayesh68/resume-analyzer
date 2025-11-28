import React from 'react';
import { motion } from 'framer-motion';
import { 
  MagnifyingGlassIcon, 
  ChartBarIcon, 
  LightBulbIcon, 
  ShieldCheckIcon,
  BoltIcon,
  DocumentCheckIcon
} from '@heroicons/react/24/outline';

export default function Features() {
  const features = [
    {
      icon: MagnifyingGlassIcon,
      title: 'ATS Optimization',
      description: 'Ensure your resume passes Applicant Tracking Systems with our advanced scanning technology.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: ChartBarIcon,
      title: 'Detailed Analytics',
      description: 'Get comprehensive insights on keywords, formatting, and content optimization.',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      icon: LightBulbIcon,
      title: 'Smart Suggestions',
      description: 'Receive AI-powered recommendations to improve your resume\'s impact and effectiveness.',
      color: 'from-violet-500 to-pink-500'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Privacy First',
      description: 'Your data is encrypted and secure. We never share your information with third parties.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: BoltIcon,
      title: 'Instant Results',
      description: 'Get your analysis in seconds. No waiting, no hassle, just instant actionable feedback.',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: DocumentCheckIcon,
      title: 'Multiple Formats',
      description: 'Support for PDF, DOCX, and TXT formats. Analyze any resume format with ease.',
      color: 'from-teal-500 to-cyan-500'
    }
  ];

  return (
    <section id="features" className="py-20 px-6 bg-white dark:bg-gray-800">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            Powerful Features
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Everything you need to create a resume that gets noticed
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ y: -10 }}
              className="group relative bg-gray-50 dark:bg-gray-900 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300"
            >
              {/* Gradient border effect */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl`} />
              
              <div className="relative">
                {/* Icon */}
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-indigo-600 group-hover:to-violet-600 transition-all duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>

                {/* Decorative arrow */}
                <div className="mt-6 flex items-center gap-2 text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-2 transition-all duration-300">
                  <span className="text-sm font-semibold">Learn more</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 rounded-full">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-400 border-2 border-white dark:border-gray-800"
                />
              ))}
            </div>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Join Many professionals who improved their resumes
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}