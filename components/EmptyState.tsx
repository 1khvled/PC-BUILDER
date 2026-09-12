"use client";

interface EmptyStateProps {
  type?: "search" | "products" | "offers" | "builds" | "default";
  title: string;
  description?: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
}

export default function EmptyState({
  type = "default",
  title,
  description,
  actionText,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white rounded-xl border border-slate-200/80 shadow-2xs my-4">
      <div className="w-20 h-20 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-center mb-4 text-slate-400 shadow-inner">
        {type === "search" && (
          <svg className="w-10 h-10 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="8" y1="11" x2="14" y2="11" strokeDasharray="2 2" />
          </svg>
        )}
        {type === "products" && (
          <svg className="w-10 h-10 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="4" width="16" height="16" rx="2" />
            <rect x="9" y="9" width="6" height="6" />
            <line x1="9" y1="1" x2="9" y2="4" />
            <line x1="15" y1="1" x2="15" y2="4" />
            <line x1="9" y1="20" x2="9" y2="23" />
            <line x1="15" y1="20" x2="15" y2="23" />
            <line x1="20" y1="9" x2="23" y2="9" />
            <line x1="20" y1="15" x2="23" y2="15" />
            <line x1="1" y1="9" x2="4" y2="9" />
            <line x1="1" y1="15" x2="4" y2="15" />
          </svg>
        )}
        {type === "offers" && (
          <svg className="w-10 h-10 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <line x1="2" y1="10" x2="22" y2="10" />
            <circle cx="7" cy="15" r="1" />
            <line x1="11" y1="15" x2="17" y2="15" />
          </svg>
        )}
        {type === "builds" && (
          <svg className="w-10 h-10 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <line x1="12" y1="4" x2="12" y2="20" />
            <line x1="2" y1="12" x2="22" y2="12" />
          </svg>
        )}
        {type === "default" && (
          <svg className="w-10 h-10 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
          </svg>
        )}
      </div>
      <h3 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">{title}</h3>
      {description && <p className="text-xs sm:text-sm text-slate-500 max-w-md mt-1.5 leading-relaxed">{description}</p>}
      {(actionText && actionHref) && (
        <a
          href={actionHref}
          className="mt-4 px-4 py-2 rounded-lg bg-[#0b63e5] hover:bg-[#094db5] text-white text-xs sm:text-sm font-semibold transition-colors shadow-2xs"
        >
          {actionText}
        </a>
      )}
      {(actionText && onAction && !actionHref) && (
        <button
          onClick={onAction}
          className="mt-4 px-4 py-2 rounded-lg bg-[#0b63e5] hover:bg-[#094db5] text-white text-xs sm:text-sm font-semibold transition-colors shadow-2xs"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
