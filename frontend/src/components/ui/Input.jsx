export function Input({ className = "", ...props }) {
  return (
    <input
      className={[
        "w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-slate-100 outline-none",
        "placeholder:text-slate-500 focus:border-sky-400/60 focus:ring-4 focus:ring-sky-400/10",
        className,
      ].join(" ")}
      {...props}
    />
  );
}