import React, { useState, useEffect } from "react";
import DarkModeToggle from "./DarkModeToggle";

export default function Header({ dark, setDark, onEnterApp }) {
  const [scrolled, setScrolled] = useState(false);
  const [hoveredLink, setHoveredLink] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-700 sticky top-0 z-30 transition-all duration-300 ${
        scrolled ? "shadow-lg py-2" : "py-4"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-4 group cursor-pointer">
          <div
            className="bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-lg group-hover:shadow-indigo-500/50 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300"
            aria-hidden
          >
            <span className="animate-pulse">AI</span>
          </div>
          <div>
            <div className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Elevate Resume
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-300 tracking-wide">
              Resume Intelligence
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <nav className="hidden md:flex items-center gap-1 text-sm relative">
            {["Features", "Contact"].map((item, idx) => (
              <a
                key={item}
                className={`px-4 py-2 rounded-lg hover:text-indigo-600 dark:hover:text-indigo-300 transition-all duration-300 relative overflow-hidden ${
                  hoveredLink === idx ? "text-indigo-600 dark:text-indigo-300" : ""
                }`}
                href={`#${item.toLowerCase()}`}
                onMouseEnter={() => setHoveredLink(idx)}
                onMouseLeave={() => setHoveredLink(null)}
              >
                <span className="relative z-10">{item}</span>
                {hoveredLink === idx && (
                  <span className="absolute inset-0 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg animate-fade-in" />
                )}
              </a>
            ))}
          </nav>

          <button
            onClick={onEnterApp}
            className="hidden sm:inline-block px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-lg shadow-lg hover:shadow-indigo-500/50 transform hover:scale-105 hover:-translate-y-0.5 transition-all duration-300 font-medium relative overflow-hidden group"
          >
            <span className="relative z-10">Try Elevate</span>
            <span className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>

          <DarkModeToggle dark={dark} setDark={setDark} />
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </header>
  );
}