import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import UploadPage from '../pages/UploadPage.jsx';
import ResultsPage from '../pages/ResultsPage.jsx';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function ResumeAnalyzer({ dark }) {
  const [currentFile, setCurrentFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // ⭐ 100% FIX: Remove unwanted JSX fields from backend JSON
  function deepSanitize(obj) {
    if (Array.isArray(obj)) return obj.map(deepSanitize);

    if (obj && typeof obj === "object") {
      const cleaned = {};
      for (const key in obj) {
        if (key.toLowerCase() === "jsx") continue; // remove illegal JSX prop
        cleaned[key] = deepSanitize(obj[key]);
      }
      return cleaned;
    }

    return obj;
  }

  // ⭐ Normalize backend response → ALWAYS clean & compatible
 function transformBackendData(data) {
  const clean = deepSanitize(data);

  const score =
    Number(clean.ats_score) ||
    Number(clean.overall_score) ||
    0;

  return {
    ats_score: score,
    overall_score: score,

    key_metrics: {
      keyword_density: clean.key_metrics?.keyword_density || 0.5,
      formatting_clarity: clean.key_metrics?.formatting_clarity || 0.8
    },

    skills_proficiency: Array.isArray(clean.skills_proficiency)
      ? clean.skills_proficiency.map(s => ({
          skill: String(s.skill || s.name || s),
          confidence: s.confidence || 75
        }))
      : [],

    job_recommendations: Array.isArray(clean.job_recommendations)
      ? clean.job_recommendations.map(role => ({
          role: String(role.role || role),
          score: role.score || 80,
          reason: "Good match based on your skills"
        }))
      : [],

    entities: clean.entities || {},
    ats_breakdown: clean.ats_breakdown || {},
    summary: clean.summary || ""
  };
}


  const handleFileSelect = async (file) => {
    setCurrentFile(file);
    setIsAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

 const response = await fetch("https://resume-analyzer-g4sr.onrender.com/upload", {
  method: "POST",
  body: formData
});



      if (!response.ok) throw new Error(`Backend error: ${response.status}`);

      const raw = await response.json();
      console.log("📥 RAW Backend Data:", raw);

      const transformed = transformBackendData(raw);
      console.log("✨ Transformed Clean Analysis:", transformed);

      setAnalysis(transformed);

    } catch (error) {
      console.error('❌ Error analyzing resume:', error);
      alert(`Failed to analyze resume: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setCurrentFile(null);
    setAnalysis(null);
    setIsAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AnimatePresence mode="wait">
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <div className="text-center">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl"
              />
              <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                Analyzing Your Resume
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                AI is processing your document...
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!analysis ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-6xl mx-auto px-6 py-8">
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition mb-6"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              Back to Home
            </button>
          </div>
          <UploadPage onFileSelect={handleFileSelect} />
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-16 z-20">
            <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                >
                  <ArrowLeftIcon className="w-5 h-5" />
                  New Analysis
                </button>
                <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Analyzing:{" "}
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {currentFile?.name}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <ResultsPage analysis={analysis} />
        </motion.div>
      )}
    </div>
  );
}
