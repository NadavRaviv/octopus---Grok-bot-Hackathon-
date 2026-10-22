"use client";

import { useEffect, useState } from "react";
import { RotateCcw } from "lucide-react";
import { GrokMatching, MatchCongrats } from "@/components/match-reveal";
import { Lost, Splash } from "@/components/states";
import { Button } from "@/components/ui/button";
import type { MatchResult, Member, Tribe } from "@/lib/types";

const DEMO_TRIBE = "padel-pack";
const DEMO_SKILLS = ["Padel", "Supper Clubs", "Karaoke", "Natural Wine", "Thrifting", "Yoga", "Live Gigs", "Coffee Crawls"];

export default function MatchDemo() {
  const [result, setResult] = useState<MatchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [run, setRun] = useState(0);

  useEffect(() => {
    let alive = true;
    Promise.all([
      fetch(`/api/tribes/${DEMO_TRIBE}`).then((r) => r.json()),
      fetch(`/api/members/demo-jess`).then((r) => r.json()),
    ])
      .then(([t, m]: [{ tribe: Tribe; members: Member[] }, { member: Member }]) => {
        if (!alive) return;
        if (!t.tribe || !m.member) throw new Error("Demo data is missing. Reset it from the dashboard.");
        const me = { ...m.member, skills: DEMO_SKILLS };
        const mates = t.members
          .filter((x) => x.id !== me.id)
          .map((x) => ({ ...x, shared: x.skills.filter((s) => me.skills.includes(s)) }))
          .sort((a, b) => b.shared.length - a.shared.length);
        setResult({ member: me, tribe: t.tribe, mates });
      })
      .catch((e) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 3600);
    return () => clearTimeout(t);
  }, [run]);

  if (error) return <Lost message={error} />;
  if (!result) return <Splash />;

  return (
    <div className="bg-dots relative min-h-[calc(100dvh-var(--journey-h))]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-violet-600/25 via-fuchsia/10 to-transparent" />
      <main className="relative mx-auto max-w-5xl px-4 pb-16 sm:px-6">
        {revealed ? (
          <>
            <MatchCongrats key={run} result={result} enterHref={`/tribe/${DEMO_TRIBE}?me=amara`} />
            <div className="flex justify-center">
              <Button
                variant="ghost"
                className="text-muted-foreground"
                onClick={() => {
                  setRevealed(false);
                  setRun((n) => n + 1);
                }}
              >
                <RotateCcw /> Replay the Grok match
              </Button>
            </div>
          </>
        ) : (
          <GrokMatching skills={result.member.skills} />
        )}
      </main>
    </div>
  );
}
