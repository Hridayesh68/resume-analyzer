import React from 'react';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

export default function DarkModeToggle({ dark, setDark }) {
  return (
    <button
      onClick={() => setDark(!dark)}
      className="relative w-14 h-7 bg-gray-200 dark:bg-gray-700 rounded-full p-1 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      aria-label="Toggle dark mode"
    >
      <motion.div
        className="w-5 h-5 bg-white dark:bg-gray-900 rounded-full shadow-md flex items-center justify-center"
        animate={{ x: dark ? 24 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        {dark ? (
          <MoonIcon className="w-3 h-3 text-indigo-600" />
        ) : (
          <SunIcon className="w-3 h-3 text-yellow-500" />
        )}
      </motion.div>
    </button>
  );
}