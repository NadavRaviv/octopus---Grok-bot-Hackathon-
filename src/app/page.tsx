import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { BotAvatar } from "@/components/dashboard/bot";
import { MemberAvatar } from "@/components/member-avatar";
import { Octopus, OctopusWordmark } from "@/components/octopus";
import { SkillChip } from "@/components/skill-chip";
import { Button } from "@/components/ui/button";
import { seedPeople } from "@/lib/seed";

const FLOATERS = [
  { id: "amara", skill: "Padel", pos: "left-[2%] top-[8%]", rot: "-rotate-6" },
  { id: "kwame", skill: "DJing", pos: "right-[3%] top-[4%]", rot: "rotate-6" },
  { id: "hana", skill: "Chess", pos: "left-[0%] bottom-[14%]", rot: "rotate-3" },
  { id: "maya", skill: "Film Photography", pos: "right-[0%] bottom-[18%]", rot: "-rotate-3" },
  { id: "freya", skill: "Supper Clubs", pos: "left-[16%] -bottom-[4%]", rot: "-rotate-2" },
  { id: "jamal", skill: "Skateboarding", pos: "right-[14%] -bottom-[6%]", rot: "rotate-2" },
];

const STEPS = [
  { emoji: "📥", title: "Upload your CRM", body: "Drop in a CSV of member emails. Everyone gets a personal link." },
  { emoji: "🐙", title: "8 social skills", body: "Members pick 8 things they love doing with people. Padel, yes. “We're both devs”, no." },
  { emoji: "🧠", title: "Grok matches", body: "Grok finds shared skills and groups people into mini tribes." },
  { emoji: "💬", title: "Your Tribe space", body: "A cosy Discord-style space to chat and plan meetups." },
  { emoji: "🌱", title: "Tribes invite tribes", body: "Members bring friends straight into their tribe. The flywheel spins." },
];

export default function Home() {
  const people = new Map(seedPeople().map((m) => [m.id, m]));

  return (
    <div className="bg-dots relative min-h-dvh overflow-x-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[640px] bg-gradient-to-b from-blurple/30 via-fuchsia/10 to-transparent" />
      <header className="relative mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <OctopusWordmark />
        <nav className="flex items-center gap-2">
          <Button variant="ghost" render={<Link href="/join/demo-jess" />} nativeButton={false} className="hidden sm:inline-flex">
            Member view
          </Button>
          <Button render={<Link href="/dashboard" />} nativeButton={false} className="rounded-full px-4">
            CM dashboard
          </Button>
        </nav>
      </header>

      <main className="relative">
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pt-6 pb-20 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:pt-14">
          <div className="space-y-6 text-center lg:text-left">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-sm text-muted-foreground ring-1 ring-white/10">
              <Sparkles className="size-4 text-sun" /> Matchmaking by Grok
            </span>
            <h1 className="font-display text-5xl leading-[0.95] font-black tracking-tight sm:text-7xl">
              Grow your community, <span className="text-gradient">one mini tribe</span> at a time.
            </h1>
            <p className="mx-auto max-w-xl text-lg text-muted-foreground lg:mx-0">
              Octopus turns your member list into small tribes of people who share real social skills. Then those
              tribes invite their friends, and your whole community grows.
            </p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
              <Button
                size="lg"
                render={<Link href="/dashboard" />}
                nativeButton={false}
                className="h-14 rounded-2xl px-7 font-display text-lg font-black shadow-[0_6px_0_#3c45a5] active:translate-y-1"
              >
                I&rsquo;m a community manager <ArrowRight />
              </Button>
              <Button
                size="lg"
                variant="secondary"
                render={<Link href="/join/demo-jess" />}
                nativeButton={false}
                className="h-14 rounded-2xl px-7 font-display text-lg font-black shadow-[0_6px_0_#1a1b1e] active:translate-y-1"
              >
                🐙 Try the 8-skills form
              </Button>
            </div>
          </div>

          <div className="relative mx-auto aspect-square w-full max-w-[520px]">
            <div className="absolute inset-[12%] rounded-full bg-gradient-to-br from-violet-500/40 to-fuchsia/30 blur-3xl" />
            <Octopus className="absolute inset-[18%]" mood="happy" title="Octopus, the mascot, waving" />
            {FLOATERS.map((f) => {
              const p = people.get(f.id);
              if (!p) return null;
              return (
                <div
                  key={f.id}
                  className={`absolute ${f.pos} ${f.rot} flex items-center gap-2 rounded-2xl bg-panel/95 p-1.5 pr-3 shadow-[0_6px_0_rgb(0_0_0/0.3)] ring-2 ring-white/90`}
                >
                  <MemberAvatar name={p.name} src={p.avatar} className="size-9" />
                  <div className="leading-tight">
                    <p className="text-xs font-bold">{p.name.split(" ")[0]}</p>
                    <p className="text-[11px] text-muted-foreground">{p.area}</p>
                  </div>
                  <SkillChip skill={f.skill} highlight className="ml-1 hidden sm:inline-flex" />
                </div>
              );
            })}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
          <h2 className="mb-6 text-center font-display text-3xl font-black sm:text-4xl">The tribe flywheel</h2>
          <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {STEPS.map((s, i) => (
              <li key={s.title} className="rounded-3xl bg-panel p-5 ring-1 ring-white/5">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-chat text-2xl shadow-[0_4px_0_#1a1b1e]">
                  {s.emoji}
                </span>
                <p className="mt-4 text-xs font-bold tracking-wide text-fuchsia">STEP {i + 1}</p>
                <h3 className="font-display text-lg font-black">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
          <div className="grid gap-4 rounded-[32px] bg-panel p-6 ring-1 ring-white/5 sm:p-10 lg:grid-cols-[1fr_1.2fr]">
            <div className="space-y-3">
              <h2 className="font-display text-3xl font-black sm:text-4xl">Three Grok bots on your team</h2>
              <p className="text-muted-foreground">
                Your members chat with each other. The bots work behind the scenes for you, the community manager.
              </p>
              <Button render={<Link href="/dashboard" />} nativeButton={false} className="mt-2 rounded-xl">
                Meet them in the dashboard <ArrowRight />
              </Button>
            </div>
            <div className="grid gap-3">
              {(
                [
                  ["match", "Grok Matchmaker", "Reads everyone's 8 arms and forms tribes around shared social skills."],
                  ["mod", "Grok Mod", "Flags spam, harassment and LinkedIn-style pitches before they kill the vibe."],
                  ["growth", "Grok Growth", "Sends you a daily report: new members, invite rate, K-factor, MVP tribes."],
                ] as const
              ).map(([k, name, body]) => (
                <div key={k} className="flex items-start gap-3 rounded-2xl bg-chat p-4">
                  <BotAvatar kind={k} />
                  <div>
                    <p className="font-semibold">
                      {name} <span className="ml-1 rounded bg-blurple px-1 text-[10px] font-bold">BOT</span>
                    </p>
                    <p className="text-sm text-muted-foreground">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="relative border-t border-white/5 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 text-sm text-muted-foreground sm:flex-row sm:px-6">
          <span className="flex items-center gap-2">
            <Octopus className="size-6" animated={false} /> Octopus · made in London for the Grok hackathon
          </span>
          <span>Demo data only. Photos from Unsplash.</span>
        </div>
      </footer>
    </div>
  );
}
