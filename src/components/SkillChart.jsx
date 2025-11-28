import React from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";

export default function SkillChart({ skills }) {
  if (!skills || !skills.length) {
    return <div className="p-6 text-gray-500 dark:text-gray-300">No skills detected.</div>;
  }

  const data = skills.map((s) => ({
    skill: s.skill,
    confidence: s.confidence,
  }));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 animate-fade-in">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Skill Radar
      </h2>

      {/* Radar Chart */}
      <div className="w-full h-80">
        <ResponsiveContainer>
          <RadarChart data={data}>
            <PolarGrid stroke="#E5E7EB" />
            <PolarAngleAxis
              dataKey="skill"
              tick={{ fill: "#374151", fontSize: 12 }}
            />
            <Radar
              name="Skill Level"
              dataKey="confidence"
              stroke="#6366F1"
              fill="#6366F1"
              fillOpacity={0.5}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Skill Boxes */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {skills.map((s, i) => (
          <div
            key={i}
            className={`
              p-4 rounded-lg shadow
              ${
                s.confidence > 10
                  ? "bg-indigo-50 dark:bg-indigo-900"
                  : "bg-gray-100 dark:bg-gray-700"
              }
            `}
          >
            <p className="font-semibold text-gray-900 dark:text-white">
              {s.skill}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Confidence: {s.confidence}%
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
