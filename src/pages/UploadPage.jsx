import React, { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import { CloudArrowUpIcon, DocumentIcon } from "@heroicons/react/24/outline";

const ACCEPTED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export default function UploadPage({ onFileSelect }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const validateFile = useCallback((file) => {
    if (!file) return "No file selected.";
    if (!ACCEPTED_TYPES.includes(file.type)) {
      const name = (file.name || "").toLowerCase();
      if (!name.endsWith(".pdf") && !name.endsWith(".doc") && !name.endsWith(".docx")) {
        return "Unsupported file type. Use PDF or DOCX.";
      }
    }
    if (file.size > MAX_BYTES) {
      return `File too large. Max ${MAX_BYTES / (1024 * 1024)} MB.`;
    }
    return "";
  }, []);

  const handlePickFile = useCallback(
    (file) => {
      const err = validateFile(file);
      if (err) {
        setError(err);
        setSelectedFile(null);
        return;
      }
      setError("");
      setSelectedFile(file);
      onFileSelect && onFileSelect(file);
    },
    [validateFile, onFileSelect]
  );

  const onInputChange = (e) => {
    const file = e.target.files?.[0];
    handlePickFile(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    handlePickFile(file);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const onDragLeave = () => {
    setIsDragOver(false);
  };

  const clickBrowse = () => {
    inputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6 transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl"
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700 transition-colors duration-300">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Upload your Resume
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xl">
                  Drag & drop your CV here or click{" "}
                  <span className="font-medium text-indigo-600 dark:text-indigo-400">Browse</span> to
                  upload. Supported:{" "}
                  <span className="font-medium">PDF, DOC, DOCX</span>. Max file size{" "}
                  <span className="font-medium">5MB</span>.
                </p>
              </motion.div>

              {/* Upload Area */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                className={`mt-6 border-2 rounded-xl p-8 transition-all duration-300 ${
                  isDragOver
                    ? "border-indigo-500 dark:border-indigo-400 shadow-lg bg-indigo-50 dark:bg-indigo-900/20 scale-105"
                    : "border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50"
                }`}
                aria-label="Resume dropzone"
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={onInputChange}
                />

                <div className="flex items-center gap-6">
                  {/* Icon */}
                  <motion.div
                    animate={{
                      scale: isDragOver ? 1.1 : 1,
                      rotate: isDragOver ? 5 : 0,
                    }}
                    className={`flex items-center justify-center w-28 h-28 rounded-2xl transition-all duration-300 ${
                      isDragOver
                        ? "bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-xl"
                        : "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                    }`}
                    aria-hidden
                  >
                    {isDragOver ? (
                      <CloudArrowUpIcon className="w-14 h-14" />
                    ) : (
                      <DocumentIcon className="w-14 h-14" />
                    )}
                  </motion.div>

                  <div className="flex-1">
                    <div className="text-sm text-gray-700 dark:text-gray-300 font-medium mb-3">
                      {isDragOver ? "Drop your file here" : "Drag your file here"}
                    </div>
                    <div className="flex items-center gap-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={clickBrowse}
                        className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-lg font-medium shadow-lg hover:shadow-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-300"
                      >
                        Browse files
                      </motion.button>

                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        or drop a file to start analysis
                      </div>
                    </div>

                    <div className="mt-4 text-sm">
                      <p className="text-gray-500 dark:text-gray-400">
                        Accepted: PDF, DOCX (Max 5MB)
                      </p>
                      
                      {/* Error Message */}
                      {error && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-2 text-sm text-rose-600 dark:text-rose-400 font-medium"
                        >
                          ⚠️ {error}
                        </motion.p>
                      )}
                      
                      {/* Selected File */}
                      {selectedFile && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="mt-3 inline-flex items-center gap-3 px-4 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            className="text-green-600 dark:text-green-400"
                          >
                            <path
                              d="M5 13l4 4L19 7"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <div className="text-sm text-gray-700 dark:text-gray-300">
                            {selectedFile.name} •{" "}
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-6 flex items-center gap-3"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (!selectedFile) {
                      setError("Please choose a file first.");
                    } else {
                      onFileSelect && onFileSelect(selectedFile);
                    }
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 transition-all duration-300"
                >
                  Analyze Resume
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSelectedFile(null);
                    setError("");
                    if (inputRef.current) inputRef.current.value = null;
                  }}
                  className="px-5 py-3 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-300"
                >
                  Reset
                </motion.button>
              </motion.div>
            </div>

            {/* Tips Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="hidden lg:block w-80"
            >
              <div className="p-5 bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800 shadow-sm">
                <h3 className="text-sm font-bold text-indigo-700 dark:text-indigo-300 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Tips for best results
                </h3>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 dark:text-indigo-400 mt-0.5">✓</span>
                    <span>Prefer PDF for better text extraction</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 dark:text-indigo-400 mt-0.5">✓</span>
                    <span>Keep contact details at the top</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 dark:text-indigo-400 mt-0.5">✓</span>
                    <span>Use bullet points for achievements</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 dark:text-indigo-400 mt-0.5">✓</span>
                    <span>Include relevant keywords naturally</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>

          {/* Footer Note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 text-xs text-gray-400 dark:text-gray-500 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>
              By uploading you agree to our terms. We analyze documents securely - no
              third-party storage.
            </span>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}