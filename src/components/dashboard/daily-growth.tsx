"use client";

import { useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import type { Snapshot } from "@/lib/api";
import { TRIBE_LEADERBOARD, growthSeries } from "@/lib/grok-bots";
import { cn } from "@/lib/utils";
import { BotMessage, Embed } from "./bot";

export function DailyGrowth({ state }: { state: Snapshot }) {
  const series = useMemo(() => growthSeries(14), []);
  const [hover, setHover] = useState<number | null>(null);
  const y = series.at(-1)!;
  const prev = series.at(-2)!;
  const week = series.slice(-7).reduce((n, d) => n + d.newMembers, 0);
  const lastWeek = series.slice(0, 7).reduce((n, d) => n + d.newMembers, 0);
  const k = (y.viaInvite / Math.max(1, y.newMembers - y.viaInvite) + 0.6).toFixed(2);
  const max = Math.max(...series.map((d) => d.newMembers));
  const tribes = new Map(state.tribes.map((t) => [t.id, t]));
  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
  const sel = series[hover ?? series.length - 1];

  return (
    <div className="scrollbar-thin h-full overflow-y-auto py-4">
      <div className="px-4 pb-4">
        <h2 className="font-display text-3xl font-black">#daily-growth</h2>
        <p className="text-muted-foreground">
          Every morning at 08:00, Grok sends you the numbers that matter for the flywheel. Matching uses the
          member memory saved from the join form: skills, chat summary, source, and tribes.
        </p>
      </div>

      <BotMessage kind="growth" time="Today at 08:00">
        <p>
          Good morning {state.community.managerName} ☀️ Here&rsquo;s your report for <b>{today}</b>.
        </p>
        <Embed color="#23a55a" title={`📈 ${state.community.name} · last 24 hours`}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Kpi label="New members" value={y.newMembers} delta={pct(y.newMembers, prev.newMembers)} />
            <Kpi
              label="Via tribe invites"
              value={`${y.viaInvite}`}
              sub={`${Math.round((y.viaInvite / y.newMembers) * 100)}% of joins`}
              delta={pct(y.viaInvite, prev.viaInvite)}
            />
            <Kpi label="Invites sent" value={y.invitesSent} delta={pct(y.invitesSent, prev.invitesSent)} />
            <Kpi label="K-factor" value={k} sub="> 1 means viral" delta={8} />
          </div>

          <div className="mt-5">
            <div className="mb-2 flex items-baseline justify-between text-xs text-muted-foreground">
              <span>New members · last 14 days</span>
              <span>
                <b className="text-white">{sel.label}</b>: {sel.newMembers} joined · {sel.viaInvite} via invite
              </span>
            </div>
            <div className="flex h-36 items-end gap-1.5" onMouseLeave={() => setHover(null)}>
              {series.map((d, i) => (
                <button
                  key={d.label}
                  type="button"
                  onMouseEnter={() => setHover(i)}
                  onFocus={() => setHover(i)}
                  aria-label={`${d.label}: ${d.newMembers} new members, ${d.viaInvite} via invite`}
                  className={cn(
                    "group flex flex-1 flex-col justify-end overflow-hidden rounded-t-md transition",
                    hover !== null && hover !== i && "opacity-50",
                  )}
                  style={{ height: `${(d.newMembers / max) * 100}%` }}
                >
                  <span className="block w-full bg-[#4e5058]" style={{ flex: d.newMembers - d.viaInvite }} />
                  <span className="block w-full bg-gradient-to-t from-online to-emerald-300" style={{ flex: d.viaInvite }} />
                </button>
              ))}
            </div>
            <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-sm bg-online" /> Joined via a tribe invite
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-sm bg-[#4e5058]" /> Joined from CRM
              </span>
            </div>
          </div>
        </Embed>

        <Embed color="#fee75c" title="🏆 Flywheel MVPs">
          <ol className="space-y-2">
            {TRIBE_LEADERBOARD.map((row, i) => {
              const t = tribes.get(row.tribeId);
              if (!t) return null;
              return (
                <li key={row.tribeId} className="flex items-center gap-3 text-sm">
                  <span className="w-4 font-display font-black text-muted-foreground">{i + 1}</span>
                  <span className="flex size-7 items-center justify-center rounded-lg" style={{ background: t.color }}>
                    {t.emoji}
                  </span>
                  <span className="flex-1 truncate font-medium">{t.name}</span>
                  <span className="text-muted-foreground">{row.invites} invites</span>
                  <span className="w-16 text-right font-semibold text-green-300">{row.delta} today</span>
                </li>
              );
            })}
          </ol>
        </Embed>

        <Embed color="#a78bfa" title="🧠 What Grok noticed">
          <ul className="list-disc space-y-1.5 pl-5 text-sm">
            <li>
              This week: <b>{week}</b> new members vs {lastWeek} last week (
              <span className="text-green-300">+{Math.round(((week - lastWeek) / lastWeek) * 100)}%</span>). Invites now
              drive more than half of all joins.
            </li>
            <li>
              <b>Hackney Padel Pack</b> converts 29% of invites. Their bring-a-friend Thursday is the best growth ritual
              you have. Copy it to other tribes.
            </li>
            <li>
              <b>{state.stats.unmatched}</b> member{state.stats.unmatched === 1 ? " is" : "s are"} still waiting for a
              tribe. Bouldering and Running look ready to become new tribes.
            </li>
            <li>
              <b>{state.stats.invited}</b> CRM invites haven&rsquo;t opened their skills form. A nudge on Saturday morning
              usually gets about 30% of them in.
            </li>
          </ul>
        </Embed>
      </BotMessage>

      <BotMessage kind="growth" time="Yesterday at 08:00" className="opacity-70">
        <p>
          Good morning {state.community.managerName} ☀️ {prev.newMembers} new members yesterday, {prev.viaInvite} via
          tribe invites. Chess Club hit its first bring-a-friend night. 🐙
        </p>
      </BotMessage>
    </div>
  );
}

function pct(a: number, b: number) {
  return Math.round(((a - b) / Math.max(1, b)) * 100);
}

function Kpi({ label, value, sub, delta }: { label: string; value: React.ReactNode; sub?: string; delta: number }) {
  const up = delta >= 0;
  return (
    <div className="rounded-lg bg-black/20 p-3">
      <p className="text-xs font-bold text-white/70">{label}</p>
      <p className="font-display text-2xl font-black">{value}</p>
      <p className={cn("flex items-center gap-0.5 text-xs font-semibold", up ? "text-green-300" : "text-red-300")}>
        {up ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
        {Math.abs(delta)}% vs yesterday
      </p>
      {sub && <p className="text-[11px] text-muted-foreground">{sub}</p>}
    </div>
  );
}
