import React from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";

import "react-circular-progressbar/dist/styles.css";


export default function Scorecard({ analysis }) {
  const score = analysis.overall_score || 0;
  const metrics = analysis.key_metrics || {};

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-xl p-6 w-full">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        Overall Score
      </h2>

      {/* DONUT SCORE */}
      <div className="w-40 h-40 mx-auto">
        <CircularProgressbar
          value={score}
          text={`${score}%`}
          styles={buildStyles({
            pathColor: "#6366F1",
            textColor: "white",
            trailColor: "#d1d5db",
            textSize: "16px",
          })}
        />
      </div>

      {/* SUB SCORES */}
      <div className="mt-8 space-y-4">
        {Object.entries(metrics).map(([key, value]) => (
          <div key={key}>
            <div className="flex justify-between text-gray-800 dark:text-gray-100 text-sm mb-1">
              <span className="capitalize">{key.replace("_", " ")}</span>
              <span>{Math.round(value * 100)}%</span>
            </div>

            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
              <div
                className="h-full bg-indigo-600 dark:bg-indigo-400 rounded-full"
                style={{ width: `${value * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
