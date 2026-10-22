"use client";

import { useState } from "react";
import { Check, Plus, X } from "lucide-react";
import { Octopus } from "@/components/octopus";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MAX_SKILLS,
  MIN_SKILLS,
  SKILL_CATEGORIES,
  normalizeSkill,
  skillMeta,
  validateSkill,
} from "@/lib/skills";
import { cn } from "@/lib/utils";

const ARM_LABELS = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"];

export function SkillPicker({
  value,
  onChange,
}: {
  value: string[];
  onChange: (skills: string[]) => void;
}) {
  const [category, setCategory] = useState(SKILL_CATEGORIES[0].id);
  const [custom, setCustom] = useState("");
  const [error, setError] = useState<string | null>(null);
  const full = value.length >= MAX_SKILLS;
  const active = SKILL_CATEGORIES.find((c) => c.id === category)!;
  const has = (s: string) => value.some((v) => v.toLowerCase() === s.toLowerCase());

  function toggle(skill: string) {
    setError(null);
    if (has(skill)) onChange(value.filter((v) => v.toLowerCase() !== skill.toLowerCase()));
    else if (!full) onChange([...value, skill]);
    else setError("All 8 arms are busy! Drop one to add another.");
  }

  function addCustom(e: React.FormEvent) {
    e.preventDefault();
    const problem = validateSkill(custom);
    if (problem) return setError(problem);
    const skill = normalizeSkill(custom);
    if (has(skill)) return setError("You already have that one.");
    if (full) return setError("All 8 arms are busy! Drop one to add another.");
    onChange([...value, skill]);
    setCustom("");
    setError(null);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      {/* Octopus meter */}
      <div className="flex flex-col items-center gap-3 rounded-2xl bg-rail/60 p-5 ring-1 ring-white/5 lg:sticky lg:top-6 lg:self-start">
        <Octopus
          litArms={value.length}
          mood={value.length >= MAX_SKILLS ? "party" : value.length >= MIN_SKILLS ? "wink" : "happy"}
          className="size-40"
          title={`${value.length} of 8 arms filled`}
        />
        <div className="text-center">
          <p className="font-display text-3xl font-black">
            {value.length}
            <span className="text-muted-foreground">/8</span>
          </p>
          <p className="text-sm text-muted-foreground">
            {value.length === 0 && "Every arm is one thing you love doing with people."}
            {value.length > 0 && value.length < MIN_SKILLS && `${MIN_SKILLS - value.length} more to unlock matching`}
            {value.length >= MIN_SKILLS && value.length < MAX_SKILLS && "Matching unlocked! Fill all 8 for better tribes."}
            {value.length >= MAX_SKILLS && "Fully armed. Grok is ready 🐙"}
          </p>
        </div>
        <ol className="grid w-full grid-cols-2 gap-1.5">
          {ARM_LABELS.map((label, i) => {
            const skill = value[i];
            return (
              <li key={label}>
                {skill ? (
                  <button
                    type="button"
                    onClick={() => toggle(skill)}
                    className="pop-in group flex w-full items-center gap-1 rounded-lg bg-gradient-to-r from-violet-500/30 to-fuchsia/30 px-2 py-1.5 text-left text-xs font-semibold ring-1 ring-white/10 hover:ring-destructive/60"
                    aria-label={`Remove ${skill}`}
                  >
                    <span aria-hidden>{skillMeta(skill).emoji}</span>
                    <span className="truncate">{skill}</span>
                    <X className="ml-auto size-3 opacity-0 transition group-hover:opacity-100" />
                  </button>
                ) : (
                  <span className="flex w-full items-center rounded-lg border border-dashed border-white/10 px-2 py-1.5 text-xs text-muted-foreground/60">
                    {label} arm
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </div>

      <div className="flex min-w-0 flex-col gap-5">
        {/* Do / don't examples */}
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rounded-xl bg-online/10 p-3 ring-1 ring-online/30">
            <p className="mb-1.5 flex items-center gap-1.5 text-xs font-bold tracking-wide text-green-300 uppercase">
              <Check className="size-3.5" /> Social skills
            </p>
            <p className="text-sm text-green-100/80">
              Tennis · Chess · Fashion design · Karaoke · Supper clubs · Bouldering
            </p>
          </div>
          <div className="rounded-xl bg-destructive/10 p-3 ring-1 ring-destructive/30">
            <p className="mb-1.5 flex items-center gap-1.5 text-xs font-bold tracking-wide text-red-300 uppercase">
              <X className="size-3.5" /> Not social skills
            </p>
            <p className="text-sm text-red-100/80">&ldquo;We&rsquo;re both devs&rdquo; · Marketing · LinkedIn networking · Python</p>
          </div>
        </div>

        {/* Category tabs */}
        <div className="scrollbar-thin -mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="tablist">
          {SKILL_CATEGORIES.map((c) => {
            const count = c.skills.filter((s) => has(s.name)).length;
            return (
              <button
                key={c.id}
                type="button"
                role="tab"
                aria-selected={c.id === category}
                onClick={() => setCategory(c.id)}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold transition",
                  c.id === category
                    ? "bg-blurple text-white shadow-[0_4px_0_#3c45a5]"
                    : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground",
                )}
              >
                <span aria-hidden>{c.emoji}</span>
                {c.label}
                {count > 0 && (
                  <span className="rounded-full bg-white/20 px-1.5 text-[11px] leading-4">{count}</span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-2" role="tabpanel">
          {active.skills.map((s) => {
            const on = has(s.name);
            return (
              <button
                key={s.name}
                type="button"
                onClick={() => toggle(s.name)}
                aria-pressed={on}
                className={cn(
                  "group flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition active:translate-y-0.5",
                  on
                    ? "bg-gradient-to-br from-violet-500 to-fuchsia text-white shadow-[0_4px_0_#7c2d6b]"
                    : "bg-panel text-foreground ring-1 ring-white/8 shadow-[0_4px_0_#1a1b1e] hover:-translate-y-0.5 hover:ring-white/20",
                  full && !on && "opacity-50",
                )}
              >
                <span className="text-lg leading-none transition group-hover:scale-125" aria-hidden>
                  {s.emoji}
                </span>
                {s.name}
                {on && <Check className="size-4" />}
              </button>
            );
          })}
        </div>

        {/* Custom */}
        <form onSubmit={addCustom} className="flex flex-col gap-2">
          <label htmlFor="custom-skill" className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
            Something else? Add your own
          </label>
          <div className="flex gap-2">
            <Input
              id="custom-skill"
              value={custom}
              onChange={(e) => {
                setCustom(e.target.value);
                setError(null);
              }}
              placeholder="e.g. Sea shanties, Roller discos, Crochet…"
              className="h-11 rounded-xl bg-rail text-base"
              aria-invalid={Boolean(error)}
            />
            <Button type="submit" size="lg" className="h-11 rounded-xl px-4" disabled={!custom.trim()}>
              <Plus /> Add
            </Button>
          </div>
          {error && (
            <p className="pop-in flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-red-200" role="alert">
              <span aria-hidden>🐙</span> {error}
            </p>
          )}
          {value.filter((v) => skillMeta(v).category === "custom").length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {value
                .filter((v) => skillMeta(v).category === "custom")
                .map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => toggle(v)}
                    className="flex items-center gap-1.5 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia px-3 py-2 text-sm font-semibold"
                  >
                    ✨ {v} <X className="size-3.5" />
                  </button>
                ))}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
