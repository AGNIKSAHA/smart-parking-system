import React from "react";

interface BookingsHeaderProps {
  title: string;
  subtitle: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onDownloadPdf?: () => void;
  icon?: React.ReactNode;
  placeholder?: string;
}

export const BookingsHeader: React.FC<BookingsHeaderProps> = ({
  title,
  subtitle,
  searchQuery,
  onSearchChange,
  onDownloadPdf,
  icon,
  placeholder = "Search...",
}) => {
  return (
    <header className="sticky top-0 z-10 -mx-4 mb-6 bg-slate-50/80 px-4 pb-4 pt-1 backdrop-blur-md">
      <div className="rounded-2xl border border-slate-200 bg-white/50 p-4 shadow-sm ring-1 ring-slate-900/5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            {icon ? (
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-xl shadow-slate-200">
                {icon}
              </div>
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-xl shadow-slate-200">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2v20" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
            )}
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                {title}
              </h1>
              <p className="text-xs font-medium text-slate-500">{subtitle}</p>
            </div>
          </div>
          {onDownloadPdf && (
            <button
              onClick={onDownloadPdf}
              className="group flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-slate-200 transition-all hover:bg-slate-800 hover:shadow-xl active:scale-95"
            >
              <svg
                className="transition-transform group-hover:-translate-y-0.5"
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download PDF
            </button>
          )}
        </div>

        <div className="mt-6 relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </div>
          <input
            type="text"
            placeholder={placeholder}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 pl-11 py-3 text-sm shadow-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
    </header>
  );
};
