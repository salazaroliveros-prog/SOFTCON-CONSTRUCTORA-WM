import React from "react";

export default function StatCard({ title, value, tone = "default" }) {
  const color =
    tone === "red"
      ? "text-red-400 bg-red-900/30 border-red-400/20"
      : tone === "green"
      ? "text-green-400 bg-green-900/30 border-green-400/20"
      : "text-yellow-400 bg-yellow-900/30 border-yellow-400/20";

  return (
    <div
      className={`rounded-xl border p-5 flex flex-col items-start shadow-md min-h-[110px] w-full ${color}`}
    >
      <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
        {title}
      </div>
      <div className="text-2xl font-black leading-tight text-white">{value}</div>
    </div>
  );
}
