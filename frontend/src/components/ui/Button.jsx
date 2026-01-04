export function Button({ className = "", variant = "primary", ...props }) {
  const base =
    "inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold " +
    "focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60";

  const variants = {
    primary:
      "bg-sky-500 text-white shadow-lg shadow-sky-500/10 hover:bg-sky-400 focus:ring-sky-400/20",
    ghost:
      "bg-transparent text-slate-200 hover:bg-white/5 border border-white/10 focus:ring-white/10",
  };

  return <button className={[base, variants[variant], className].join(" ")} {...props} />;
}