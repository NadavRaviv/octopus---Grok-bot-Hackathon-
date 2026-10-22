"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Hash, LayoutDashboard, Menu, RotateCcw, Users } from "lucide-react";
import { toast } from "sonner";
import { BOTS, BotAvatar, type BotKind } from "@/components/dashboard/bot";
import { CrmPanel } from "@/components/dashboard/crm";
import { DailyGrowth } from "@/components/dashboard/daily-growth";
import { Matchmaker } from "@/components/dashboard/matchmaker";
import { ModFlags } from "@/components/dashboard/mod-flags";
import { Overview, type DashChannel } from "@/components/dashboard/overview";
import { Octopus } from "@/components/octopus";
import { Lost, Splash } from "@/components/states";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { Snapshot } from "@/lib/api";
import { FLAGS } from "@/lib/grok-bots";
import { cn } from "@/lib/utils";

const TITLES: Record<DashChannel, string> = {
  overview: "overview",
  crm: "crm-members",
  matchmaker: "matchmaker",
  "mod-flags": "mod-flags",
  "daily-growth": "daily-growth",
};

export default function DashboardPage() {
  return (
    <Suspense fallback={<Splash />}>
      <Dashboard />
    </Suspense>
  );
}

function Dashboard() {
  const router = useRouter();
  const tab = useSearchParams().get("tab");
  const channel: DashChannel = tab && tab in TITLES ? (tab as DashChannel) : "overview";
  const [state, setState] = useState<Snapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resolved, setResolved] = useState<Record<string, string>>({});
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch("/api/state", { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error("Couldn't load your community");
        return r.json();
      })
      .then((d) => alive && setState(d))
      .catch((e) => alive && setError(e instanceof Error ? e.message : "Couldn't load your community"));
    return () => {
      alive = false;
    };
  }, []);

  if (error && !state) return <Lost message={error} />;
  if (!state) return <Splash />;

  const openFlags = FLAGS.filter((f) => !resolved[f.id]).length;
  const go = (c: DashChannel) => {
    router.replace(c === "overview" ? "/dashboard" : `/dashboard?tab=${c}`, { scroll: false });
    setNavOpen(false);
  };

  async function reset() {
    const r = await fetch("/api/reset", { method: "POST" });
    setState(await r.json());
    setResolved({});
    toast.success("Demo data reset to the original London crew");
  }

  const sidebar = (
    <div className="flex size-full flex-col bg-panel">
      <div className="flex h-12 shrink-0 items-center gap-2 border-b border-black/30 px-4 font-display font-black shadow-sm">
        {state.community.name}
        <span className="ml-auto rounded bg-online/20 px-1.5 text-[10px] font-bold text-green-300">CM</span>
      </div>
      <div className="scrollbar-thin flex-1 space-y-4 overflow-y-auto p-2">
        <Group label="Community">
          <ChannelBtn active={channel === "overview"} onClick={() => go("overview")} icon={<LayoutDashboard className="size-5" />}>
            overview
          </ChannelBtn>
          <ChannelBtn
            active={channel === "crm"}
            onClick={() => go("crm")}
            icon={<Users className="size-5" />}
            badge={state.stats.invited ? String(state.stats.invited) : undefined}
            badgeClass="bg-white/15"
          >
            crm-members
          </ChannelBtn>
        </Group>
        <Group label="Grok bots">
          {(["match", "mod", "growth"] as BotKind[]).map((k) => {
            const c = BOTS[k].channel as DashChannel;
            return (
              <ChannelBtn
                key={k}
                active={channel === c}
                onClick={() => go(c)}
                icon={<BotAvatar kind={k} className="size-5 text-[10px]" />}
                badge={k === "mod" && openFlags ? String(openFlags) : k === "match" && state.stats.unmatched ? String(state.stats.unmatched) : undefined}
                badgeClass={k === "mod" ? "bg-destructive" : "bg-blurple"}
              >
                {c}
              </ChannelBtn>
            );
          })}
        </Group>
        <Group label={`Mini tribes · ${state.tribes.length}`}>
          {state.tribes.map((t) => (
            <Link
              key={t.id}
              href={`/tribe/${t.id}`}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[15px] text-muted-foreground hover:bg-white/5 hover:text-foreground"
            >
              <span className="flex size-5 items-center justify-center rounded text-xs" style={{ background: t.color }}>
                {t.emoji}
              </span>
              <span className="truncate">{t.name}</span>
              <span className="ml-auto text-xs opacity-60">{t.memberIds.length}</span>
            </Link>
          ))}
        </Group>
      </div>
      <div className="flex h-14 shrink-0 items-center gap-2 bg-[#232428] px-2">
        <Octopus className="size-9" animated={false} />
        <div className="min-w-0 flex-1 leading-tight">
          <p className="text-sm font-semibold">{state.community.managerName}</p>
          <p className="text-xs text-muted-foreground">Community manager</p>
        </div>
        <Tooltip>
          <TooltipTrigger render={<Button variant="ghost" size="icon-sm" onClick={reset} aria-label="Reset demo data" />}>
            <RotateCcw />
          </TooltipTrigger>
          <TooltipContent>Reset demo data</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );

  const isChat = channel === "matchmaker";

  return (
    <div className="flex h-[calc(100dvh-var(--journey-h))] overflow-hidden bg-chat">
      <nav className="scrollbar-thin hidden w-[72px] shrink-0 flex-col items-center gap-2 overflow-y-auto bg-rail py-3 sm:flex">
        <Link href="/" className="flex size-12 items-center justify-center rounded-2xl bg-blurple" aria-label="Octopus home">
          <Octopus className="size-10" animated={false} />
        </Link>
        <span className="h-0.5 w-8 rounded-full bg-white/10" />
        {state.tribes.map((t) => (
          <Tooltip key={t.id}>
            <TooltipTrigger
              render={
                <Link
                  href={`/tribe/${t.id}`}
                  className="flex size-12 items-center justify-center rounded-[24px] bg-chat text-2xl transition-all hover:rounded-2xl"
                  aria-label={t.name}
                />
              }
            >
              {t.emoji}
            </TooltipTrigger>
            <TooltipContent side="right">{t.name}</TooltipContent>
          </Tooltip>
        ))}
      </nav>
      <div className="hidden w-60 shrink-0 md:flex">{sidebar}</div>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-12 shrink-0 items-center gap-2 border-b border-black/30 px-3 shadow-sm">
          <Button variant="ghost" size="icon-sm" className="md:hidden" onClick={() => setNavOpen(true)} aria-label="Channels">
            <Menu />
          </Button>
          <Hash className="size-5 text-muted-foreground" />
          <h1 className="font-semibold">{TITLES[channel]}</h1>
          <span className="ml-auto hidden text-xs text-muted-foreground sm:block">
            Demo bots · all data is fake London folk
          </span>
        </header>
        <div className={cn("min-h-0 flex-1", isChat ? "" : "scrollbar-thin overflow-y-auto")}>
          <div className={cn(isChat || channel === "mod-flags" || channel === "daily-growth" ? "h-full" : "mx-auto max-w-6xl")}>
            {channel === "overview" && <Overview state={state} openFlags={openFlags} go={go} />}
            {channel === "crm" && <CrmPanel state={state} onState={setState} />}
            {channel === "matchmaker" && <Matchmaker state={state} onState={setState} />}
            {channel === "mod-flags" && (
              <ModFlags state={state} resolved={resolved} onResolve={(id, a) => setResolved((r) => ({ ...r, [id]: a }))} />
            )}
            {channel === "daily-growth" && <DailyGrowth state={state} />}
          </div>
        </div>
      </main>

      <Dialog open={navOpen} onOpenChange={setNavOpen}>
        <DialogContent className="h-[80dvh] gap-0 overflow-hidden p-0 sm:max-w-xs" showCloseButton={false}>
          <DialogTitle className="sr-only">Channels</DialogTitle>
          {sidebar}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="px-2 pb-1 text-[11px] font-bold tracking-wide text-muted-foreground uppercase">{label}</p>
      {children}
    </div>
  );
}

function ChannelBtn({
  active,
  onClick,
  icon,
  badge,
  badgeClass,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  badge?: string;
  badgeClass?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[15px] transition",
        active ? "bg-accent text-white" : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
      )}
    >
      <span className="opacity-80">{icon}</span>
      <span className="truncate">{children}</span>
      {badge && (
        <span className={cn("ml-auto rounded-full px-1.5 text-[11px] font-bold text-white", badgeClass)}>{badge}</span>
      )}
    </button>
  );
}
