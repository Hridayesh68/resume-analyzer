import React, { useState } from "react";
import { motion } from "framer-motion";
import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import Features from "./components/Features.jsx";
import ResumeAnalyzer from "./components/ResumeAnalyzer.jsx";

function App() {
  const [dark, setDark] = useState(false);
  const [showApp, setShowApp] = useState(false);

  // Contact form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState("");

  // Send message to backend
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setStatus("");

   try {
  const res = await fetch("https://resume-analyzer-g4sr.onrender.com/send_email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(formData)
  });

  const data = await res.json();
  console.log("Email response:", data);

} catch (error) {
  console.error("Email error:", error);
}


  return (
    <div className={dark ? "dark" : ""}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">

        {/* Header */}
        <Header dark={dark} setDark={setDark} onEnterApp={() => setShowApp(true)} />

        {/* Analyzer App vs Landing Page */}
        {showApp ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ResumeAnalyzer dark={dark} />
          </motion.div>
        ) : (
          <>
            <Hero onGetStarted={() => setShowApp(true)} />
            <Features />

            {/* Contact Section */}
            <section id="contact" className="py-20 px-6 bg-white dark:bg-gray-800">
              <div className="max-w-4xl mx-auto">

                {/* Heading */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-center mb-12"
                >
                  <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-transparent bg-clip-text">
                    Get In Touch
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 text-lg">
                    Have questions? We'd love to hear from you.
                  </p>
                </motion.div>

                {/* Contact Form */}
                <motion.form
                  onSubmit={handleContactSubmit}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="space-y-6"
                >
                  <div className="grid md:grid-cols-2 gap-6">
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent
                                 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                      required
                    />

                    <input
                      type="email"
                      placeholder="Your Email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent
                                 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                      required
                    />
                  </div>

                  <textarea
                    placeholder="Your Message"
                    rows="5"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent
                               focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    required
                  ></textarea>

                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white
                               rounded-lg shadow-lg hover:shadow-indigo-500/50 transform hover:scale-105 
                               transition-all duration-300 font-semibold disabled:opacity-50"
                  >
                    {sending ? "Sending..." : "Send Message"}
                  </button>

                  {status && (
                    <p className="text-center mt-4 text-lg font-medium text-indigo-600 dark:text-indigo-400">
                      {status}
                    </p>
                  )}
                </motion.form>

              </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-300 py-12 px-6">
              <div className="max-w-6xl mx-auto text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="bg-gradient-to-br from-indigo-600 to-violet-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold">
                    AI
                  </div>
                  <span className="text-xl font-bold text-white">Elevate Resume</span>
                </div>

                <p className="mb-4">Empowering your career journey with AI-driven insights</p>
                <p className="text-sm text-gray-500">© 2024 Elevate Resume. All rights reserved.</p>
              </div>
            </footer>

          </>
        )}

      </div>
    </div>
  );
}

export default App;
