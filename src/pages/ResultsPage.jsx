import React, { useState } from "react";
import Scorecard from "../components/Scorecard";
import SkillChart from "../components/SkillChart";
import JobRecommendations from "../components/JobRecommendations";

export default function ResultsPage({ analysis }) {
  const [tab, setTab] = useState("score");

  const tabs = [
    { key: "score", label: "Scorecard" },
    { key: "skills", label: "Skills" },
    { key: "jobs", label: "Job Matches" },
  ];

  const handleSuggestJobs = () => {
    setTab("jobs");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col md:flex-row">

      {/* Mobile Tabs */}
      <div className="md:hidden sticky top-0 bg-white dark:bg-gray-800 shadow z-20">
        <div className="flex overflow-x-auto no-scrollbar border-b border-gray-200 dark:border-gray-700">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`
                flex-1 px-4 py-3 text-sm font-medium whitespace-nowrap
                ${tab === t.key
                  ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400"
                  : "text-gray-600 dark:text-gray-300"}
              `}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Auto Job Suggestion Button (visible on mobile) */}
        <button
          onClick={handleSuggestJobs}
          className="m-3 px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700"
        >
          Suggest Jobs Based on My Skills
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-56 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-6 sticky top-0 h-screen">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Analysis
        </h2>

        <nav className="space-y-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`
                w-full text-left px-4 py-2 rounded-lg font-medium transition
                ${tab === t.key
                  ? "bg-indigo-600 text-white dark:bg-indigo-500"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"}
              `}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {/* Auto Job Suggestion Button */}
        <button
          onClick={handleSuggestJobs}
          className="mt-6 w-full px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700"
        >
          Suggest Jobs
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 md:p-10">
        {tab === "score" && <Scorecard analysis={analysis} />}
        {tab === "skills" && <SkillChart skills={analysis.skills_proficiency} />}
        {tab === "jobs" && (
          <JobRecommendations
            jobs={analysis.job_recommendations}
            skills={analysis.skills_proficiency}
          />
        )}
      </main>
    </div>
  );
}
