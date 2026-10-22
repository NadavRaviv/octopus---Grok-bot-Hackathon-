"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { ArrowRight, Sparkles } from "lucide-react";
import { MemoryCard } from "@/components/memory-card";
import { MemberAvatar } from "@/components/member-avatar";
import { Octopus } from "@/components/octopus";
import { SkillChip } from "@/components/skill-chip";
import { Button } from "@/components/ui/button";
import { skillMeta } from "@/lib/skills";
import type { MatchResult } from "@/lib/types";
import { cn } from "@/lib/utils";

export function GrokBadge({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span className="flex size-5 items-center justify-center rounded-md bg-white font-display text-[11px] font-black text-black">
        G
      </span>
      <span className="font-semibold">Grok</span>
      <span className="rounded bg-blurple px-1 text-[10px] leading-4 font-bold text-white">BOT</span>
    </span>
  );
}

export function GrokMatching({ skills }: { skills: string[] }) {
  const lines = [
    "Reading your 8 arms…",
    "Saving this to Grok Bot memory…",
    "Scanning Londoners in your community…",
    `Looking for ${skills[0] ?? "kindred"} people near you…`,
    "Checking surprising overlaps…",
    "Naming your tribe…",
  ];
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => Math.min(n + 1, lines.length - 1)), 700);
    return () => clearInterval(t);
  }, [lines.length]);

  return (
    <div className="flex flex-col items-center gap-8 py-10 text-center" aria-live="polite">
      <div className="relative size-72">
        <div className="absolute inset-6 animate-[spin_9s_linear_infinite] rounded-full border-2 border-dashed border-blurple/40" />
        <div className="absolute inset-0 animate-[spin_14s_linear_infinite_reverse]">
          {skills.slice(0, 8).map((s, idx) => {
            const a = (idx / Math.min(skills.length, 8)) * Math.PI * 2;
            return (
              <span
                key={s}
                className="absolute flex size-11 items-center justify-center rounded-full bg-panel text-xl shadow-[0_4px_0_#1a1b1e] ring-2 ring-white/10"
                style={{ left: `calc(50% + ${Math.cos(a) * 128}px - 22px)`, top: `calc(50% + ${Math.sin(a) * 128}px - 22px)` }}
                title={s}
              >
                {skillMeta(s).emoji}
              </span>
            );
          })}
        </div>
        <Octopus className="absolute inset-14" mood="wink" />
      </div>
      <div className="space-y-2">
        <GrokBadge className="justify-center text-sm text-muted-foreground" />
        <p key={i} className="pop-in font-display text-2xl font-extrabold">
          {lines[i]}
        </p>
      </div>
    </div>
  );
}

function burst() {
  const colors = ["#a78bfa", "#eb459e", "#fee75c", "#57f287", "#5865f2"];
  confetti({ particleCount: 140, spread: 90, origin: { y: 0.35 }, colors, scalar: 1.1 });
  setTimeout(() => confetti({ particleCount: 80, angle: 60, spread: 70, origin: { x: 0, y: 0.6 }, colors }), 250);
  setTimeout(() => confetti({ particleCount: 80, angle: 120, spread: 70, origin: { x: 1, y: 0.6 }, colors }), 400);
}

export function MatchCongrats({
  result,
  inviterName,
  enterHref,
}: {
  result: MatchResult;
  inviterName?: string;
  enterHref?: string;
}) {
  const { tribe, mates, member } = result;
  const grok = (result as MatchResult & { grok?: { sent: boolean } }).grok;
  const first = member.name.split(" ")[0];

  useEffect(() => {
    if (tribe && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) burst();
  }, [tribe]);

  if (!tribe) {
    return (
      <div className="pop-in mx-auto flex max-w-lg flex-col items-center gap-5 py-10 text-center">
        <Octopus className="size-40" mood="sleepy" />
        <h1 className="font-display text-4xl font-black">You&rsquo;re a trailblazer, {first} ✨</h1>
        <p className="text-muted-foreground">
          Nobody in the community shares your social skills yet. Grok has saved your 8 arms and will ping you
          the moment someone matches. Invite a friend to speed it up.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {member.skills.map((s) => (
            <SkillChip key={s} skill={s} />
          ))}
        </div>
        <MemoryCard member={member} />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center gap-8 py-6 text-center">
      <div className="pop-in relative">
        <Octopus className="size-44 sm:size-52" mood="party" />
        <span className="absolute -top-2 -right-10 rotate-12 rounded-2xl bg-sun px-3 py-1 font-display text-2xl font-black text-black shadow-[0_5px_0_#a88f1c] ring-4 ring-white sm:-right-16 sm:text-3xl">
          +{mates.length}
        </span>
      </div>

      <div className="pop-in space-y-3" style={{ animationDelay: "120ms" }}>
        <p className="font-display text-lg font-extrabold text-fuchsia">Congrats, {first}!</p>
        <h1 className="font-display text-4xl leading-[1.05] font-black sm:text-6xl">
          We found you <span className="text-gradient">+{mates.length}</span> on your tribe!
        </h1>
        <p className="text-muted-foreground">
          {inviterName
            ? `${inviterName} pulled you in. Now you're part of the flywheel.`
            : `Shared skills point to ${tribe.skill}. Grok Bot writes the recommendation from its memory of every member and tribe.`}
        </p>
      </div>

      <div
        className="pop-in w-full overflow-hidden rounded-2xl bg-panel text-left ring-1 ring-white/10"
        style={{ animationDelay: "240ms" }}
      >
        <div
          className="flex items-center gap-4 p-5"
          style={{ background: `linear-gradient(120deg, ${tribe.color}55, transparent 70%)` }}
        >
          <span
            className="flex size-16 shrink-0 items-center justify-center rounded-2xl text-3xl ring-4 ring-white/80"
            style={{ background: tribe.color }}
          >
            {tribe.emoji}
          </span>
          <div className="min-w-0">
            <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase">Your tribe space</p>
            <h2 className="truncate font-display text-2xl font-black">{tribe.name}</h2>
            <p className="line-clamp-2 text-sm text-muted-foreground">{tribe.tagline}</p>
          </div>
        </div>
        <ul className="grid gap-px bg-white/5 sm:grid-cols-2">
          {mates.slice(0, 10).map((m, i) => (
            <li
              key={m.id}
              className="pop-in flex items-center gap-3 bg-panel p-3"
              style={{ animationDelay: `${350 + i * 70}ms` }}
            >
              <MemberAvatar name={m.name} src={m.avatar} online={m.online} className="size-11" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">
                  {m.name} <span className="text-xs font-normal text-muted-foreground">· {m.area}</span>
                </p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {m.shared.slice(0, 3).map((s) => (
                    <SkillChip key={s} skill={s} highlight />
                  ))}
                  {m.shared.length === 0 && <SkillChip skill={tribe.skill} />}
                </div>
              </div>
            </li>
          ))}
        </ul>
        {mates.length > 10 && (
          <p className="bg-panel p-3 text-center text-sm text-muted-foreground">+{mates.length - 10} more inside</p>
        )}
      </div>

      <MemoryCard
        member={member}
        tribes={[{ id: tribe.id, name: tribe.name, skill: tribe.skill }]}
      />
      {grok && (
        <p className="text-sm text-muted-foreground">
          {grok.sent
            ? "Sent to Grok Bot with the full member list and all tribes. Open Octopus Matchmaker for the recommendation it writes."
            : "Grok Bot did not start. Check the webhook routine is active."}
        </p>
      )}

      <Button
        size="lg"
        className="h-14 rounded-2xl px-8 font-display text-lg font-black shadow-[0_6px_0_#3c45a5] active:translate-y-1 active:shadow-[0_2px_0_#3c45a5]"
        render={<Link href={enterHref ?? `/tribe/${tribe.id}?me=${member.id}`} />}
        nativeButton={false}
      >
        <Sparkles /> Enter your Tribe space <ArrowRight />
      </Button>
    </div>
  );
}
