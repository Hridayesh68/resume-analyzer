import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import UploadPage from '../pages/UploadPage.jsx';
import ResultsPage from '../pages/ResultsPage.jsx';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function ResumeAnalyzer({ dark }) {
  const [currentFile, setCurrentFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFileSelect = async (file) => {
    setCurrentFile(file);
    setIsAnalyzing(true);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);

      // Call your backend API
      const response = await fetch('http://localhost:8000/analyze_resume', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Received analysis from backend:', data);

      // Transform backend response to match frontend format
      const transformedAnalysis = {
        overall_score: data.overall_score || 0,
        key_metrics: {
          keyword_density: data.key_metrics?.keyword_density || 0,
          readability_grade: data.key_metrics?.readability_grade || 0,
          formatting_clarity: data.key_metrics?.formatting_clarity || 0
        },
        skills_proficiency: (data.skills_proficiency || []).map(skill => ({
          skill: skill.skill || skill.name,
          confidence: skill.confidence || skill.level || 0
        })),
        job_recommendations: (data.job_recommendations || []).map(job => ({
          role: job.role || job.title,
          score: job.score || 0,
          reason: job.reason || 'Good match based on your skills and experience.'
        }))
      };

      setAnalysis(transformedAnalysis);
    } catch (error) {
      console.error('❌ Error analyzing resume:', error);
      
      // Show error message to user
      alert(`Failed to analyze resume: ${error.message}\n\nMake sure the backend is running on http://localhost:8000`);
      
      // Fallback to mock data for testing
      const mockAnalysis = {
        overall_score: 84,
        key_metrics: {
          keyword_density: 0.72,
          readability_grade: 68,
          formatting_clarity: 0.85
        },
        skills_proficiency: [
          { skill: 'JavaScript', confidence: 90 },
          { skill: 'React', confidence: 85 },
          { skill: 'Python', confidence: 75 },
          { skill: 'Node.js', confidence: 80 },
          { skill: 'SQL', confidence: 70 },
          { skill: 'Git', confidence: 88 }
        ],
        job_recommendations: [
          {
            role: 'Senior Frontend Developer',
            score: 92,
            reason: 'Strong match based on your React and JavaScript expertise.'
          },
          {
            role: 'Full Stack Developer',
            score: 85,
            reason: 'Your backend skills complement your frontend knowledge.'
          },
          {
            role: 'Software Engineer',
            score: 78,
            reason: 'General software engineering role where your diverse skill set would be valuable.'
          }
        ]
      };
      setAnalysis(mockAnalysis);
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
                  rotate: [0, 180, 360]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl"
              />
              <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                Analyzing Your Resume
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                AI is processing your document...
              </p>
              <motion.div
                className="mt-6 flex gap-2 justify-center"
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{
                      y: [0, -20, 0],
                    }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                    className="w-3 h-3 bg-indigo-600 rounded-full"
                  />
                ))}
              </motion.div>
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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
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
                  Analyzing: <span className="font-semibold text-gray-900 dark:text-white">{currentFile?.name}</span>
                </div>
              </div>
              <button
                onClick={() => alert('Export feature coming soon!')}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
              >
                Export Report
              </button>
            </div>
          </div>
          <ResultsPage analysis={analysis} />
        </motion.div>
      )}
    </div>
  );
}