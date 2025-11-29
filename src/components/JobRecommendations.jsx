import React from "react";

export default function JobRecommendations({ jobs, skills }) {
  const strongSkills = (skills || []).filter((s) => s.confidence > 20);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Job Recommendations
      </h2>

      {/* Show strong skills */}
      {strongSkills.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200 mb-2">
            Top Matched Skills
          </h3>

          <div className="flex flex-wrap gap-2">
            {strongSkills.map((s, i) => (
              <span
                key={i}
                className="px-3 py-1 bg-indigo-600 text-white rounded-full text-sm"
              >
                {s.skill} ({s.confidence}%)
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Job List */}
      <div className="space-y-4">
        {jobs.map((job, i) => (
          <div
            key={i}
            className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg shadow"
          >
            <div className="flex justify-between items-center">
              <p className="font-semibold text-gray-900 dark:text-white">
                {job.role}
              </p>

              <span className="px-3 py-1 bg-indigo-600 text-white rounded-full text-sm">
                {job.score}%
              </span>
            </div>

            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
              {job.reason}
            </p>

            <button
  onClick={() =>
    window.open(
      `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(job.role)}`,
      "_blank"
    )
  }
  className="mt-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm"
>
  View on LinkedIn
</button>

          </div>
        ))}
      </div>
    </div>
  );
}
