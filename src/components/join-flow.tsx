"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { GrokMatching, MatchCongrats } from "@/components/match-reveal";
import { OctopusWordmark } from "@/components/octopus";
import { SkillPicker } from "@/components/skill-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MAX_SKILLS, MIN_SKILLS } from "@/lib/skills";
import type { MatchResult } from "@/lib/types";
import { cn } from "@/lib/utils";

export const LONDON_AREAS = [
  "Hackney",
  "Shoreditch",
  "Dalston",
  "Islington",
  "Camden",
  "King's Cross",
  "Kentish Town",
  "Hampstead",
  "Notting Hill",
  "Brixton",
  "Clapham",
  "Peckham",
  "Bermondsey",
  "Deptford",
  "Greenwich",
  "Bethnal Green",
  "Stoke Newington",
  "Walthamstow",
];

const MIN_MATCH_MS = 3600;

export function JoinFlow({
  endpoint,
  initialName = "",
  askEmail,
  header,
  inviterName,
  extraBody,
}: {
  endpoint: string;
  extraBody?: Record<string, string | undefined>;
  initialName?: string;
  askEmail?: boolean;
  header: React.ReactNode;
  inviterName?: string;
}) {
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState("");
  const [area, setArea] = useState("");
  const [note, setNote] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [phase, setPhase] = useState<"form" | "matching" | "done">("form");
  const [result, setResult] = useState<MatchResult | null>(null);

  const ready = skills.length >= MIN_SKILLS && name.trim() && (!askEmail || email.includes("@"));

  async function submit() {
    if (!ready) return;
    setPhase("matching");
    window.scrollTo({ top: 0, behavior: "smooth" });
    const started = Date.now();
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...extraBody, name, email, area, skills, note }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      await new Promise((r) => setTimeout(r, Math.max(0, MIN_MATCH_MS - (Date.now() - started))));
      setResult(data);
      setPhase("done");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
      setPhase("form");
    }
  }

  return (
    <div className="bg-dots relative min-h-[calc(100dvh-var(--journey-h))]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-violet-600/25 via-fuchsia/10 to-transparent" />
      <header className="relative mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" aria-label="Octopus home">
          <OctopusWordmark />
        </Link>
        {phase === "form" && (
          <span className="hidden text-sm text-muted-foreground sm:block">Takes about 60 seconds</span>
        )}
      </header>

      <main className="relative mx-auto max-w-5xl px-4 pb-36 sm:px-6">
        {phase === "matching" && <GrokMatching skills={skills} />}
        {phase === "done" && result && <MatchCongrats result={result} inviterName={inviterName} />}
        {phase === "form" && (
          <div className="flex flex-col gap-8 pt-4">
            {header}

            <section className="grid gap-3 sm:grid-cols-3">
              <Field label="Your name">
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jess Morgan"
                  className="h-11 rounded-xl bg-rail text-base"
                  autoComplete="name"
                />
              </Field>
              {askEmail && (
                <Field label="Email">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@gmail.com"
                    className="h-11 rounded-xl bg-rail text-base"
                    autoComplete="email"
                  />
                </Field>
              )}
              <Field label="Your corner of London">
                <select
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="h-11 w-full rounded-xl border border-input bg-rail px-3 text-base outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <option value="">Pick a neighbourhood</option>
                  {LONDON_AREAS.map((a) => (
                    <option key={a}>{a}</option>
                  ))}
                </select>
              </Field>
            </section>

            <Field label="One line for Grok Bot to remember (optional)">
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={280}
                placeholder="Looking for a weekend padel game in Hackney"
                className="min-h-20 rounded-xl bg-rail text-base"
              />
            </Field>

            <section className="space-y-4">
              <div>
                <h2 className="font-display text-2xl font-black sm:text-3xl">Your 8 social skills</h2>
                <p className="text-muted-foreground">
                  Things you&rsquo;d happily do with new people. Pick {MIN_SKILLS} to {MAX_SKILLS}.
                </p>
              </div>
              <SkillPicker value={skills} onChange={setSkills} />
            </section>
          </div>
        )}
      </main>

      {phase === "form" && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-white/5 bg-rail/90 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3 sm:px-6">
            <div className="flex flex-1 gap-1" aria-hidden>
              {Array.from({ length: MAX_SKILLS }).map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "h-2 flex-1 rounded-full transition-colors",
                    i < skills.length ? "bg-gradient-to-r from-violet-400 to-fuchsia" : "bg-white/10",
                  )}
                />
              ))}
            </div>
            <Button
              size="lg"
              onClick={submit}
              disabled={!ready}
              className="h-12 rounded-xl px-5 font-display text-base font-black shadow-[0_5px_0_#3c45a5] active:translate-y-0.5 sm:px-7"
            >
              {phase === "form" ? (
                <>
                  Find my tribe <ArrowRight />
                </>
              ) : (
                <Loader2 className="animate-spin" />
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-bold tracking-wide text-muted-foreground uppercase">{label}</span>
      {children}
    </label>
  );
}
