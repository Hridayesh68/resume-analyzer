import React from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

export default function Scorecard({ analysis }) {
  // 100% reliable numeric ATS score
  const atsScore = Number(analysis?.ats_score ?? analysis?.overall_score ?? 0);

  // Proper breakdown returned from backend
  const breakdown = analysis?.ats_breakdown || {};

  const metrics = [
    { key: "skill_match", label: "Skill Match" },
    { key: "keyword_coverage", label: "Keyword Coverage" },
    { key: "contact_score", label: "Contact Info Score" },
    { key: "education_score", label: "Education Match" },
    { key: "formatting_score", label: "Formatting Quality" },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        ATS Score
      </h2>

      {/* Main ATS Score Circle */}
      <div className="flex justify-center mt-4">
        <div className="w-44 h-44">
          <CircularProgressbar
            value={atsScore}
            text={`${atsScore}%`}
            styles={buildStyles({
              pathColor:
                atsScore >= 80
                  ? "#4ade80"
                  : atsScore >= 60
                  ? "#facc15"
                  : "#f87171",
              trailColor: "#e5e7eb",
              textColor: "#000",
            })}
          />
        </div>
      </div>

      <h3 className="text-center mt-4 text-lg font-semibold text-gray-900 dark:text-gray-200">
        Applicant Tracking System Match
      </h3>

      {/* Breakdown Section */}
      <div className="mt-8 space-y-4">
        {metrics.map((m) => {
          const rawValue = breakdown[m.key] ?? 0;
          const percent = Math.round(rawValue * 100);

          return (
            <div key={m.key}>
              <div className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300">
                <span>{m.label}</span>
                <span>{percent}%</span>
              </div>

              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-1">
                <div
                  style={{ width: `${percent}%` }}
                  className="h-full rounded-full bg-indigo-600 dark:bg-indigo-400 transition-all duration-300"
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      {analysis?.summary && (
        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            Summary
          </h3>
          <p className="text-gray-700 dark:text-gray-200 text-sm">
            {analysis.summary}
          </p>
        </div>
      )}
    </div>
  );
}
