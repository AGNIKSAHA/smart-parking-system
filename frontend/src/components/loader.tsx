export const Loader = ({ label }: { label?: string }) => (
  <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
    <div className="flex flex-col items-center gap-4 rounded-3xl bg-white p-8 shadow-2xl ring-1 ring-slate-100">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent shadow-xl"></div>
      {label && <p className="text-sm font-black text-slate-900">{label}</p>}
    </div>
  </div>
);
