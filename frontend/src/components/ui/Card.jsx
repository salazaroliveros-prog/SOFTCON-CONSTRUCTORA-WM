export function Card({ className = "", children }) {
  return (
    <div
      className={[
        "rounded-2xl border border-white/10 bg-white/5 shadow-2xl shadow-black/40 backdrop-blur",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

export function CardBody({ className = "", children }) {
  return <div className={["p-6 sm:p-8", className].join(" ")}>{children}</div>;
}