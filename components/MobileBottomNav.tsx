"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n/client";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { t } = useI18n();

  const navItems = [
    {
      href: "/builder",
      label: t("common.builder"),
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <path d="M9 9h6v6H9z" />
        </svg>
      ),
      active: pathname === "/builder",
    },
    {
      href: "/prebuilds",
      label: t("common.prebuilds"),
      badge: "DZ",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      ),
      active: pathname.startsWith("/prebuilds"),
    },
    {
      href: "/deals",
      label: t("common.deals"),
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
      active: pathname.startsWith("/deals"),
    },
    {
      href: "/category/gpu",
      label: t("common.components"),
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
        </svg>
      ),
      active: pathname.startsWith("/category"),
    },
    {
      href: "/guides",
      label: t("common.guides"),
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      ),
      active: pathname.startsWith("/guides"),
    },
  ];

  return (
    <nav
      aria-label={t("nav.mobile")}
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#11111c] border-t border-white/10 safe-area-bottom shadow-[0_-4px_20px_rgba(0,0,0,0.4)] no-print"
    >
      <div className="grid grid-cols-5 h-14 items-center px-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={item.active ? "page" : undefined}
            className={`flex flex-col items-center justify-center gap-1 py-1 px-1 text-center transition-colors relative touch-manipulation ${
              item.active
                ? "text-[#5db2e8] font-bold"
                : "text-slate-400 active:text-slate-200"
            }`}
          >
            <div className="relative">
              {item.icon}
              {item.badge && (
                <span className="absolute -top-1.5 -right-2 text-[8px] font-black uppercase px-1 rounded bg-emerald-500 text-white leading-tight">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] tracking-tight leading-none truncate max-w-[64px]">
              {item.label}
            </span>
            {item.active && (
              /* Solid tab, no glow: the glow read as neon glass next to the
                 flat surfaces used everywhere else. */
              <span className="absolute bottom-0 w-7 h-[3px] rounded-t-full bg-[#5db2e8]" />
            )}
          </Link>
        ))}
      </div>
    </nav>
  );
}
