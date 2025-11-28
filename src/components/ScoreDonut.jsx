import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

export default function ScoreDonut({ value }) {
  const score = Math.min(100, Math.max(0, value));
  const data = [
    { name: "score", value: score },
    { name: "rest", value: 100 - score },
  ];

  const COLORS = ["#10B981", "#E5E7EB"]; // emerald + gray

  return (
    <div className="w-40 h-40">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            innerRadius="70%"
            outerRadius="90%"
            startAngle={90}
            endAngle={-270}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, idx) => (
              <Cell key={idx} fill={COLORS[idx]} stroke="none" />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-900">{score}</div>
          <div className="text-sm text-gray-500">Score</div>
        </div>
      </div>
    </div>
  );
}
