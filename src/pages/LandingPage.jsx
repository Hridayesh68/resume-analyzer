import React from "react";
import Hero from "../components/Hero.jsx";
import Features from "../components/Features.jsx";
import Footer from "../components/Footer.jsx";

export default function LandingPage({ onEnter }) {
  return (
    <div>
      <Hero onEnter={onEnter} />
      <main className="max-w-6xl mx-auto px-6 py-12 space-y-20">
        <Features />
      </main>
      <Footer />
    </div>
  );
}
