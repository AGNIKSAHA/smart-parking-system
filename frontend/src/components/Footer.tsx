export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t bg-white/80 py-8 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 text-center">
        <div className="mb-4 flex flex-col items-center gap-2">
          <span className="text-lg font-black tracking-tight text-slate-900">
            ParkSphere
          </span>
          <p className="text-sm text-slate-500 max-w-xs">
            Digitalizing parking management with real-time tracking and seamless
            reservations.
          </p>
        </div>

        <div className="h-px w-16 bg-slate-200 mx-auto mb-6"></div>

        <div className="flex flex-col items-center gap-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Design & Development
          </p>
          <p className="text-sm font-medium text-slate-700">
            Made with <span className="text-rose-500 text-base">♥</span> by{" "}
            <span className="font-bold text-slate-900 border-b-2 border-indigo-500/30 pb-0.5">
              AGNIK SAHA
            </span>
          </p>
        </div>

        <p className="mt-8 text-xs text-slate-400">
          © {currentYear} ParkSphere. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
