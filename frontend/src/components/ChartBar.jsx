import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function ChartBar({ data, xKey = "name", bars = [], height = 300 }) {
  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} className="">
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey={xKey} className="text-xs text-slate-400" />
          <YAxis className="text-xs text-slate-400" />
          <Tooltip wrapperClassName="bg-slate-900 text-white rounded-lg shadow-lg text-xs" />
          <Legend wrapperStyle={{ color: '#fff' }} />
          {bars.map((bar, idx) => (
            <Bar key={bar.key} dataKey={bar.key} fill={bar.color} name={bar.label} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
