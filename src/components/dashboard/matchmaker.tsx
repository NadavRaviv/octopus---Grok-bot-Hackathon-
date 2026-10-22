"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Loader2, Play } from "lucide-react";
import { toast } from "sonner";
import { AvatarStack } from "@/components/member-avatar";
import { SkillChip } from "@/components/skill-chip";
import { Button } from "@/components/ui/button";
import type { Snapshot } from "@/lib/api";
import { matchmakerScript } from "@/lib/grok-bots";
import { BotMessage, Embed, EmbedField } from "./bot";

type Placement = {
  memberId: string;
  name: string;
  tribeId: string;
  tribeName: string;
  plus: number;
  shared: string[];
  isNew: boolean;
};

type Run = { id: number; steps: string[]; placements: Placement[]; unmatched: string[]; done: boolean; at: string };

const nowLabel = () => `Today at ${new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;

export function Matchmaker({ state, onState }: { state: Snapshot; onState: (s: Snapshot) => void }) {
  const [runs, setRuns] = useState<Run[]>([]);
  const [running, setRunning] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);
  const byId = new Map(state.members.map((m) => [m.id, m]));
  const waiting = state.members.filter((m) => m.status === "joined" && m.tribeIds.length === 0);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [runs]);

  async function run() {
    setRunning(true);
    const id = Date.now();
    const intro = [
      `/match run · scanning ${state.stats.joined} members and ${state.tribes.length} tribes`,
      `${waiting.length} member${waiting.length === 1 ? "" : "s"} still need a tribe`,
    ];
    setRuns((r) => [...r, { id, steps: [intro[0]], placements: [], unmatched: [], done: false, at: nowLabel() }]);
    await wait(600);
    setRuns((r) => r.map((x) => (x.id === id ? { ...x, steps: intro } : x)));
    try {
      const res = await fetch("/api/match", { method: "POST" });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      for (const p of d.placements as Placement[]) {
        for (const line of matchmakerScript(p.name.split(" ")[0], p.tribeName, p.shared, p.plus)) {
          await wait(260);
          setRuns((r) => r.map((x) => (x.id === id ? { ...x, steps: [...x.steps, line] } : x)));
        }
        setRuns((r) => r.map((x) => (x.id === id ? { ...x, placements: [...x.placements, p] } : x)));
      }
      await wait(300);
      setRuns((r) => r.map((x) => (x.id === id ? { ...x, unmatched: d.unmatched, done: true } : x)));
      onState(d.state);
      if (d.placements.length) toast.success(`Grok placed ${d.placements.length} people into tribes 🐙`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Matching failed");
      setRuns((r) => r.map((x) => (x.id === id ? { ...x, done: true } : x)));
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="scrollbar-thin flex-1 overflow-y-auto py-4">
        <ChannelIntro />
        {state.tribes
          .slice()
          .sort((a, b) => a.createdAt - b.createdAt)
          .map((t) => {
            const people = t.memberIds.map((id) => byId.get(id)).filter((m) => m !== undefined);
            const skills = new Map<string, number>();
            people.forEach((p) => p.skills.forEach((s) => s !== t.skill && skills.set(s, (skills.get(s) ?? 0) + 1)));
            const bonus = [...skills.entries()].sort((a, b) => b[1] - a[1]).slice(0, 2);
            return (
              <BotMessage
                key={t.id}
                kind="match"
                time={new Date(t.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
              >
                <p>
                  New tribe formed around <b>{t.skill}</b> 🎉
                </p>
                <Embed
                  color={t.color}
                  title={
                    <Link href={`/tribe/${t.id}`} className="hover:underline">
                      {t.emoji} {t.name}
                    </Link>
                  }
                  footer={t.tagline}
                >
                  <div className="grid gap-3 sm:grid-cols-3">
                    <EmbedField label="Members" value={people.length} />
                    <EmbedField label="Anchor skill" value={<SkillChip skill={t.skill} highlight />} />
                    <EmbedField
                      label="Surprise overlaps"
                      value={bonus.length ? bonus.map(([s, n]) => `${s} ×${n}`).join(", ") : "—"}
                    />
                  </div>
                  <AvatarStack people={people} max={8} className="mt-3" size="size-7" />
                </Embed>
              </BotMessage>
            );
          })}

        {runs.map((r) => (
          <BotMessage key={r.id} kind="match" time={r.at}>
            <Embed color="#a78bfa" title={r.done ? "Matching complete" : "Matching in progress…"}>
              <ol className="space-y-1 font-mono text-[13px] text-muted-foreground">
                {r.steps.map((s, i) => (
                  <li key={i} className="pop-in">
                    <span className="text-violet-300">›</span> {s}
                  </li>
                ))}
                {!r.done && (
                  <li className="flex items-center gap-2 text-violet-300">
                    <Loader2 className="size-3 animate-spin" /> thinking
                  </li>
                )}
              </ol>
            </Embed>
            {r.placements.map((p) => {
              const t = state.tribes.find((x) => x.id === p.tribeId);
              return (
                <Embed
                  key={p.memberId}
                  color={t?.color ?? "#a78bfa"}
                  className="pop-in"
                  title={
                    <span>
                      {p.name} → {t?.emoji} {p.tribeName}{" "}
                      <span className="ml-1 rounded bg-sun px-1.5 text-sm font-black text-black">+{p.plus}</span>
                      {p.isNew && <span className="ml-2 rounded bg-online px-1.5 text-xs font-bold">NEW TRIBE</span>}
                    </span>
                  }
                >
                  <div className="flex flex-wrap gap-1">
                    {p.shared.map((s) => (
                      <SkillChip key={s} skill={s} highlight />
                    ))}
                  </div>
                  {byId.get(p.memberId)?.memory?.chatSummary && (
                    <p className="text-sm text-muted-foreground">
                      Memory: {byId.get(p.memberId)?.memory?.chatSummary}
                    </p>
                  )}
                </Embed>
              );
            })}
            {r.done && r.placements.length === 0 && (
              <p className="text-muted-foreground">Everyone who filled in their skills already has a tribe. Nice. 🐙</p>
            )}
            {r.unmatched.length > 0 && (
              <p className="text-sm text-muted-foreground">
                No match yet for {r.unmatched.join(", ")}. I&rsquo;ll keep watching for new members.
              </p>
            )}
          </BotMessage>
        ))}
        <div ref={bottom} />
      </div>

      <div className="shrink-0 px-4 pb-5">
        <div className="flex items-center gap-3 rounded-lg bg-[#383a40] p-2 pl-4">
          <span className="font-mono text-sm text-muted-foreground">
            /match run <span className="hidden sm:inline">· {waiting.length} waiting for a tribe</span>
          </span>
          <Button onClick={run} disabled={running} className="ml-auto">
            {running ? <Loader2 className="animate-spin" /> : <Play />} Run Grok matchmaking
          </Button>
        </div>
      </div>
    </div>
  );
}

function ChannelIntro() {
  return (
    <div className="px-4 pb-4">
      <h2 className="font-display text-3xl font-black">#matchmaker</h2>
      <p className="text-muted-foreground">
        Grok matches from memory saved on the join form: skills, a chat summary, where they came from, and the
        tribes they already joined. Run a batch below, or open a tribe to see why the latest person landed there.
      </p>
    </div>
  );
}

function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
