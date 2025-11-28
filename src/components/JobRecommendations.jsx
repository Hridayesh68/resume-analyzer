import React from "react";

export default function JobRecommendations({ jobs, skills }) {
  const strongSkills = (skills || []).filter((s) => s.confidence > 10);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Job Recommendations
      </h2>

      {/* If no strong skills found */}
      {strongSkills.length === 0 && (
        <p className="text-gray-600 dark:text-gray-300">
          Not enough strong skills detected. Improve skill keywords in your CV
          to get job recommendations.
        </p>
      )}

      {/* Strong Skills List */}
      {strongSkills.length > 0 && (
        <>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Strong Skills (>{">"}10% match)
          </h3>

          <div className="flex flex-wrap gap-2 mb-6">
            {strongSkills.map((s, i) => (
              <span
                key={i}
                className="px-3 py-1 bg-indigo-600 dark:bg-indigo-500 text-white rounded-full text-sm"
              >
                {s.skill} — {s.confidence}%
              </span>
            ))}
          </div>

          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recommended Jobs
          </h3>

          {/* Job Cards */}
          <div className="space-y-4">
            {jobs.map((job, i) => (
              <div
                key={i}
                className="p-4 rounded-lg bg-gray-100 dark:bg-gray-700 shadow"
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    {job.role}
                  </h3>

                  <span className="px-3 py-1 rounded-full text-sm font-medium 
                                   bg-indigo-600 dark:bg-indigo-500 text-white">
                    {job.score}%
                  </span>
                </div>

                <p className="text-gray-700 dark:text-gray-300 mt-2 text-sm">
                  {job.reason}
                </p>

                <button
                  onClick={() =>
                    window.open(
                      `https://www.google.com/search?q=${escape(
                        job.role + " jobs"
                      )}`,
                      "_blank"
                    )
                  }
                  className="mt-3 px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white text-sm rounded-lg 
                             shadow hover:bg-indigo-700 dark:hover:bg-indigo-400"
                >
                  Search Jobs
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
