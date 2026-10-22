"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Octopus } from "@/components/octopus";
import { cn } from "@/lib/utils";

export const JOURNEY = [
  { n: 1, label: "Upload CRM", emoji: "📥", href: "/dashboard?tab=crm", match: (p: string, t: string | null) => p === "/dashboard" && t === "crm" },
  { n: 2, label: "8 social skills", emoji: "🐙", href: "/join/demo-jess", match: (p: string) => p.startsWith("/join/") },
  { n: 3, label: "Grok matches", emoji: "🧠", href: "/match", match: (p: string) => p === "/match" },
  { n: 4, label: "Tribe space", emoji: "💬", href: "/tribe/padel-pack?me=amara", match: (p: string) => p.startsWith("/tribe/") },
  { n: 5, label: "Invite new users", emoji: "🌱", href: "/invite/padel-pack?ref=amara", match: (p: string) => p.startsWith("/invite/") },
  { n: 6, label: "Grok mod flags", emoji: "🚩", href: "/dashboard?tab=mod-flags", match: (p: string, t: string | null) => p === "/dashboard" && t === "mod-flags" },
  { n: 7, label: "Daily growth", emoji: "📈", href: "/dashboard?tab=daily-growth", match: (p: string, t: string | null) => p === "/dashboard" && t === "daily-growth" },
];

export function JourneyBar() {
  return (
    <Suspense fallback={<div className="h-(--journey-h) shrink-0 bg-black" />}>
      <Bar />
    </Suspense>
  );
}

function Bar() {
  const pathname = usePathname();
  const tab = useSearchParams().get("tab");
  const active = JOURNEY.findIndex((s) => s.match(pathname, tab));
  const prev = active > 0 ? JOURNEY[active - 1] : null;
  const next = active < JOURNEY.length - 1 ? JOURNEY[active + 1] : null;

  return (
    <nav
      aria-label="Demo journey"
      className="sticky top-0 z-40 flex h-(--journey-h) shrink-0 items-center gap-2 border-b border-white/10 bg-black/95 px-2 backdrop-blur sm:px-3"
    >
      <Link href="/" className="flex shrink-0 items-center gap-1.5 rounded-lg px-1.5 py-1 hover:bg-white/10" aria-label="Octopus home">
        <Octopus className="size-7" animated={false} />
        <span className="hidden font-display font-black lg:inline">octopus</span>
      </Link>
      <span className="hidden h-5 w-px bg-white/15 sm:block" />

      <ol className="scrollbar-thin flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
        {JOURNEY.map((s, i) => {
          const on = i === active;
          const done = active >= 0 && i < active;
          return (
            <li key={s.n} className="flex shrink-0 items-center">
              <Link
                href={s.href}
                aria-current={on ? "step" : undefined}
                className={cn(
                  "flex items-center gap-1.5 rounded-full py-1 pr-3 pl-1 text-[13px] font-semibold whitespace-nowrap transition",
                  on
                    ? "bg-gradient-to-r from-blurple to-fuchsia text-white shadow-[0_3px_0_#3c45a5]"
                    : "text-muted-foreground hover:bg-white/10 hover:text-foreground",
                )}
              >
                <span
                  className={cn(
                    "flex size-6 items-center justify-center rounded-full text-[11px] font-black",
                    on ? "bg-white text-black" : done ? "bg-online text-white" : "bg-white/10",
                  )}
                >
                  {done ? "✓" : s.n}
                </span>
                <span aria-hidden>{s.emoji}</span>
                <span className={cn(!on && "hidden md:inline")}>{s.label}</span>
              </Link>
              {i < JOURNEY.length - 1 && <span className="mx-0.5 hidden text-white/20 xl:inline">›</span>}
            </li>
          );
        })}
      </ol>

      <div className="flex shrink-0 items-center gap-1">
        {prev && (
          <Link
            href={prev.href}
            className="hidden size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-white/10 hover:text-foreground sm:flex"
            aria-label={`Previous step: ${prev.label}`}
          >
            <ChevronLeft className="size-4" />
          </Link>
        )}
        <Link
          href={next?.href ?? JOURNEY[0].href}
          className="flex h-8 items-center gap-1 rounded-lg bg-white px-3 text-[13px] font-bold text-black hover:bg-white/90"
        >
          {active === -1 ? "Start demo" : next ? "Next" : "Restart"}
          <ChevronRight className="size-4" />
        </Link>
      </div>
    </nav>
  );
}
