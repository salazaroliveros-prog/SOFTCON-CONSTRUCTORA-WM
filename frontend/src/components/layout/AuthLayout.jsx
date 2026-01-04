export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="mb-6">
            <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
            {subtitle ? <p className="mt-2 text-sm text-slate-300">{subtitle}</p> : null}
          </div>

          {children}

          <p className="mt-6 text-center text-xs text-slate-500">
            © {new Date().getFullYear()} SOFTCON
          </p>
        </div>
      </div>
    </div>
  );
}