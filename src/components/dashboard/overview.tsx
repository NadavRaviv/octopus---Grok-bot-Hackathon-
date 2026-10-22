"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AvatarStack } from "@/components/member-avatar";
import { Octopus } from "@/components/octopus";
import { Button } from "@/components/ui/button";
import type { Snapshot } from "@/lib/api";
import { growthSeries } from "@/lib/grok-bots";
import { BOTS, BotAvatar, type BotKind } from "./bot";

export type DashChannel = "overview" | "crm" | "matchmaker" | "mod-flags" | "daily-growth";

const STEPS = [
  { n: 1, title: "Upload CRM", body: "Drop in your member emails", emoji: "📥" },
  { n: 2, title: "8 social skills", body: "Each member fills in their arms", emoji: "🐙" },
  { n: 3, title: "Grok matches", body: "Shared skills become tribes", emoji: "🧠" },
  { n: 4, title: "Tribe space", body: "Members chat and meet up", emoji: "💬" },
  { n: 5, title: "Invite friends", body: "New people join the tribe", emoji: "🌱" },
];

export function Overview({
  state,
  openFlags,
  go,
}: {
  state: Snapshot;
  openFlags: number;
  go: (c: DashChannel) => void;
}) {
  const s = state.stats;
  const byId = new Map(state.members.map((m) => [m.id, m]));
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const today = growthSeries(1)[0];

  const cards = [
    { label: "In your CRM", value: s.uploaded, sub: `${s.invited} waiting to fill skills`, go: "crm" as const },
    { label: "Filled their 8 arms", value: s.joined, sub: `${Math.round((s.joined / Math.max(1, s.uploaded)) * 100)}% activation`, go: "crm" as const },
    { label: "In a mini tribe", value: s.inTribe, sub: `${s.unmatched} waiting for a match`, go: "matchmaker" as const },
    { label: "Joined via invites", value: s.viaInvite, sub: "the flywheel at work", go: "daily-growth" as const },
  ];

  const bots: { kind: BotKind; go: DashChannel; line: string; badge?: string }[] = [
    {
      kind: "match",
      go: "matchmaker",
      line: s.unmatched ? `${s.unmatched} members are ready to be matched into tribes.` : "Everyone has a tribe. Nice.",
    },
    {
      kind: "mod",
      go: "mod-flags",
      line: openFlags ? `${openFlags} flags need your review. One is high priority.` : "All clear. No flags today.",
      badge: openFlags ? String(openFlags) : undefined,
    },
    {
      kind: "growth",
      go: "daily-growth",
      line: `${today.newMembers} new members yesterday, ${today.viaInvite} of them via tribe invites.`,
    },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blurple via-violet-600 to-fuchsia p-6 sm:p-8">
        <Octopus className="absolute -right-4 -bottom-10 size-44 sm:size-56" mood="wink" />
        <p className="text-sm font-bold text-white/80">{state.community.name}</p>
        <h2 className="max-w-md font-display text-3xl leading-tight font-black sm:text-4xl">
          {greeting}, {state.community.managerName}. Your tribes grew while you slept.
        </h2>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button onClick={() => go("crm")} className="h-10 rounded-xl bg-white px-4 font-semibold text-black hover:bg-white/90">
            📥 Upload CRM
          </Button>
          <Button onClick={() => go("matchmaker")} className="h-10 rounded-xl bg-black/25 px-4 font-semibold text-white hover:bg-black/35">
            🧠 Run Grok matching
          </Button>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((c) => (
          <button
            key={c.label}
            onClick={() => go(c.go)}
            className="rounded-2xl bg-panel p-4 text-left ring-1 ring-white/5 transition hover:-translate-y-0.5 hover:ring-white/15"
          >
            <p className="font-display text-4xl font-black">{c.value}</p>
            <p className="text-sm font-semibold">{c.label}</p>
            <p className="text-xs text-muted-foreground">{c.sub}</p>
          </button>
        ))}
      </section>

      <section>
        <h3 className="mb-3 font-display text-xl font-black">Your Grok bots</h3>
        <div className="grid gap-3 md:grid-cols-3">
          {bots.map((b) => (
            <button
              key={b.kind}
              onClick={() => go(b.go)}
              className="group flex items-start gap-3 rounded-2xl bg-panel p-4 text-left ring-1 ring-white/5 transition hover:ring-white/15"
            >
              <BotAvatar kind={b.kind} />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 font-semibold" style={{ color: BOTS[b.kind].color }}>
                  {BOTS[b.kind].name}
                  {b.badge && (
                    <span className="rounded-full bg-destructive px-1.5 text-[11px] font-bold text-white">{b.badge}</span>
                  )}
                </p>
                <p className="text-sm text-muted-foreground">{b.line}</p>
                <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-white/70 group-hover:text-white">
                  Open #{BOTS[b.kind].channel} <ArrowRight className="size-3" />
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-3 font-display text-xl font-black">The flywheel</h3>
        <ol className="grid gap-2 sm:grid-cols-5">
          {STEPS.map((st, i) => (
            <li key={st.n} className="relative rounded-2xl bg-panel p-4 ring-1 ring-white/5">
              <span className="text-2xl">{st.emoji}</span>
              <p className="mt-1 text-xs font-bold text-muted-foreground">STEP {st.n}</p>
              <p className="font-semibold">{st.title}</p>
              <p className="text-xs text-muted-foreground">{st.body}</p>
              {i === STEPS.length - 1 && (
                <span className="absolute top-3 right-3 text-xs font-bold text-green-300">↻ back to 3</span>
              )}
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h3 className="mb-3 font-display text-xl font-black">Mini tribes · {state.tribes.length}</h3>
        {state.tribes.length === 0 ? (
          <p className="rounded-2xl bg-panel p-8 text-center text-muted-foreground">
            No tribes yet. Upload your CRM and let members fill in their skills.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {state.tribes.map((t) => {
              const people = t.memberIds.map((id) => byId.get(id)).filter((m) => m !== undefined);
              const invited = people.filter((p) => p.invitedBy).length;
              return (
                <Link
                  key={t.id}
                  href={`/tribe/${t.id}`}
                  className="group overflow-hidden rounded-2xl bg-panel ring-1 ring-white/5 transition hover:-translate-y-0.5 hover:ring-white/15"
                >
                  <div className="relative h-16" style={{ background: `linear-gradient(120deg, ${t.color}, transparent)` }}>
                    <span className="absolute -bottom-5 left-4 flex size-12 items-center justify-center rounded-2xl text-2xl ring-4 ring-panel" style={{ background: t.color }}>
                      {t.emoji}
                    </span>
                  </div>
                  <div className="space-y-2 p-4 pt-7">
                    <p className="truncate font-display text-lg font-black">{t.name}</p>
                    <p className="line-clamp-1 text-sm text-muted-foreground">{t.tagline}</p>
                    <div className="flex items-center justify-between">
                      <AvatarStack people={people} max={5} size="size-7" />
                      <span className="text-xs text-muted-foreground">
                        {people.length} members · <span className="text-green-300">{invited} via invite</span>
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
