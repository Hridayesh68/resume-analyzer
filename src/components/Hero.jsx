import React from 'react';
import { motion } from 'framer-motion';
import { SparklesIcon, RocketLaunchIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';

export default function Hero({ onGetStarted }) {
  return (
    <section className="relative py-20 px-6 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full text-indigo-600 dark:text-indigo-300 text-sm font-semibold mb-8"
          >
            <SparklesIcon className="w-4 h-4" />
            NLP-Powered Resume Intelligence
          </motion.div>

          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
          >
            Elevate Your Resume to
            <span className="block bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 bg-clip-text text-transparent animate-gradient">
              Land Your Dream Job
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto"
          >
            Get instant AI-powered insights, beat ATS systems, and craft a resume that stands out to recruiters
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
          >
            <button
              onClick={onGetStarted}
              className="group px-8 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl shadow-2xl hover:shadow-indigo-500/50 transform hover:scale-105 transition-all duration-300 font-semibold text-lg flex items-center gap-2"
            >
              <RocketLaunchIcon className="w-6 h-6 group-hover:rotate-12 transition-transform" />
              Analyze Your Resume
            </button>
            {/* <button className="px-8 py-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-indigo-600 dark:hover:border-indigo-400 transition-all duration-300 font-semibold text-lg">
             
            </button> */}
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-gray-600 dark:text-gray-400"
          >
            <div className="flex items-center gap-2">
              <CheckBadgeIcon className="w-5 h-5 text-green-500" />
              <span>Many resumes analyzed</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckBadgeIcon className="w-5 h-5 text-green-500" />
              <span>90% ATS compatibility</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckBadgeIcon className="w-5 h-5 text-green-500" />
              <span>Trusted by professionals</span>
            </div>
          </motion.div>
        </div>

        {/* Animated preview cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-20 relative"
        >
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { icon: '📊', title: 'ATS Score', value: '92%', color: 'from-green-500 to-emerald-500' },
              { icon: '🎯', title: 'Match Rate', value: '88%', color: 'from-indigo-500 to-blue-500' },
              { icon: '⚡', title: 'Improvements', value: '12', color: 'from-violet-500 to-purple-500' }
            ].map((card, idx) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + idx * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                <div className="text-4xl mb-3">{card.icon}</div>
                <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">{card.title}</h3>
                <div className={`text-4xl font-bold bg-gradient-to-r ${card.color} bg-clip-text text-transparent`}>
                  {card.value}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </section>
  );
}