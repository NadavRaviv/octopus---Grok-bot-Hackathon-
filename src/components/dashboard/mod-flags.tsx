"use client";

import { useState } from "react";
import { toast } from "sonner";
import { MemberAvatar } from "@/components/member-avatar";
import { Button } from "@/components/ui/button";
import type { Snapshot } from "@/lib/api";
import { FLAGS, type Severity } from "@/lib/grok-bots";
import { cn } from "@/lib/utils";
import { BotMessage, Embed, EmbedField } from "./bot";

const SEV: Record<Severity, { label: string; color: string; cls: string }> = {
  high: { label: "High", color: "#f23f43", cls: "bg-red-500/20 text-red-200" },
  medium: { label: "Medium", color: "#f0b232", cls: "bg-amber-500/20 text-amber-200" },
  low: { label: "Low", color: "#80848e", cls: "bg-white/10 text-muted-foreground" },
};

export function ModFlags({ state, resolved, onResolve }: {
  state: Snapshot;
  resolved: Record<string, string>;
  onResolve: (id: string, action: string) => void;
}) {
  const [filter, setFilter] = useState<"open" | "resolved">("open");
  const byId = new Map(state.members.map((m) => [m.id, m]));
  const tribes = new Map(state.tribes.map((t) => [t.id, t]));
  const list = FLAGS.filter((f) => (filter === "open" ? !resolved[f.id] : resolved[f.id]));
  const open = FLAGS.filter((f) => !resolved[f.id]).length;

  function act(id: string, action: string, name: string) {
    onResolve(id, action);
    toast.success(`${action}: ${name}. Grok will tell the tribe what happened (nicely).`);
  }

  return (
    <div className="scrollbar-thin h-full overflow-y-auto py-4">
      <div className="px-4 pb-4">
        <h2 className="font-display text-3xl font-black">#mod-flags</h2>
        <p className="text-muted-foreground">
          Grok watches every tribe chat and member report, and flags anything that breaks the vibe. You make the call.
        </p>
        <div className="mt-3 flex gap-1">
          {(["open", "resolved"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium capitalize",
                filter === f ? "bg-accent text-white" : "text-muted-foreground hover:bg-white/5",
              )}
            >
              {f} <span className="ml-1 text-xs opacity-60">{f === "open" ? open : FLAGS.length - open}</span>
            </button>
          ))}
        </div>
      </div>

      <BotMessage kind="mod" time="Today at 08:00">
        <p>
          {open > 0 ? (
            <>
              🚩 <b>{open} flag{open === 1 ? "" : "s"}</b> need your eyes today. Overall health is good: 98.6% of messages
              in the last 24h were friendly.
            </>
          ) : (
            <>All clear ✨ Nothing needs your attention. Your tribes are being lovely.</>
          )}
        </p>
      </BotMessage>

      {list.length === 0 && filter === "resolved" && (
        <p className="px-18 py-6 text-sm text-muted-foreground">Nothing resolved yet.</p>
      )}

      {list.map((f) => {
        const m = byId.get(f.memberId);
        const t = tribes.get(f.tribeId);
        if (!m) return null;
        const sev = SEV[f.severity];
        return (
          <BotMessage key={f.id} kind="mod" time={`${f.hoursAgo}h ago`}>
            <Embed
              color={sev.color}
              title={
                <span className="flex flex-wrap items-center gap-2">
                  <span className={cn("rounded px-1.5 py-0.5 text-xs font-bold uppercase", sev.cls)}>{sev.label}</span>
                  {f.category}
                </span>
              }
              footer={`${f.reports} member report${f.reports === 1 ? "" : "s"} · Grok confidence ${f.confidence}%`}
            >
              <div className="flex items-start gap-3">
                <MemberAvatar name={m.name} src={m.avatar} className="size-10" />
                <div className="min-w-0 flex-1 space-y-2">
                  <p className="text-sm">
                    <b>{m.name}</b>
                    <span className="text-muted-foreground"> in {t ? `${t.emoji} ${t.name}` : "a tribe"}</span>
                  </p>
                  <p className="text-sm">{f.summary}</p>
                  <blockquote className="border-l-4 border-white/15 pl-3 text-sm text-muted-foreground italic">
                    {f.evidence}
                  </blockquote>
                  <div className="grid grid-cols-2 gap-3">
                    <EmbedField label="Suggested action" value={f.suggestion} />
                    <EmbedField
                      label="Confidence"
                      value={
                        <span className="mt-1 block h-1.5 w-full overflow-hidden rounded-full bg-black/30">
                          <span className="block h-full rounded-full" style={{ width: `${f.confidence}%`, background: sev.color }} />
                        </span>
                      }
                    />
                  </div>
                </div>
              </div>
              {resolved[f.id] ? (
                <p className="mt-3 text-sm font-semibold text-green-300">✓ {resolved[f.id]}</p>
              ) : (
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button size="sm" variant="destructive" onClick={() => act(f.id, f.suggestion, m.name)}>
                    {f.suggestion}
                  </Button>
                  {f.suggestion !== "Warn" && (
                    <Button size="sm" variant="secondary" onClick={() => act(f.id, "Warned", m.name)}>
                      Warn
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => act(f.id, "Dismissed", m.name)}>
                    Dismiss
                  </Button>
                </div>
              )}
            </Embed>
          </BotMessage>
        );
      })}
    </div>
  );
}
