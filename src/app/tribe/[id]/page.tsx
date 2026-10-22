"use client";

import { Suspense, use, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  Hash,
  LayoutDashboard,
  MapPin,
  Menu,
  SendHorizontal,
  Sparkles,
  UserPlus,
  Users,
  Volume2,
} from "lucide-react";
import { toast } from "sonner";
import { GrokBadge } from "@/components/match-reveal";
import { MemberAvatar } from "@/components/member-avatar";
import { Octopus } from "@/components/octopus";
import { SkillChip } from "@/components/skill-chip";
import { Lost, Splash } from "@/components/states";
import { InviteDialog } from "@/components/invite-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { meetupsFor } from "@/lib/meetups";
import type { Community, Member, Message, Tribe } from "@/lib/types";
import { cn } from "@/lib/utils";

type Data = {
  tribe: Tribe;
  members: Member[];
  community: Community;
  otherTribes: { id: string; name: string; emoji: string; color: string }[];
  viaInvite: number;
};

type Channel = "general" | "meetups" | "grow";

const NAME_COLORS = ["#f47fff", "#7dd3fc", "#fbbf24", "#86efac", "#fda4af", "#c4b5fd", "#fdba74"];

export default function TribePage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<Splash />}>
      <TribeSpace params={params} />
    </Suspense>
  );
}

function TribeSpace({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const meId = useSearchParams().get("me");
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [channel, setChannel] = useState<Channel>("general");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);

  const load = useCallback(
    () =>
      fetch(`/api/tribes/${id}`, { cache: "no-store" })
        .then(async (r) => {
          const d = await r.json();
          if (!r.ok) throw new Error(d.error);
          setData(d);
        })
        .catch((e) => setError(e instanceof Error ? e.message : "Couldn't load this tribe")),
    [id],
  );

  useEffect(() => {
    const first = setTimeout(load, 0);
    const t = setInterval(load, 5000);
    return () => {
      clearTimeout(first);
      clearInterval(t);
    };
  }, [load]);

  if (error && !data) return <Lost message={error} />;
  if (!data) return <Splash />;

  const { tribe, members, otherTribes, community } = data;
  const me = members.find((m) => m.id === meId) ?? null;
  const qs = me ? `?me=${me.id}` : "";

  const channels = (
    <ChannelSidebar
      tribe={tribe}
      me={me}
      channel={channel}
      members={members}
      onChannel={(c) => {
        setChannel(c);
        setNavOpen(false);
      }}
      onInvite={() => setInviteOpen(true)}
    />
  );

  return (
    <div className="flex h-[calc(100dvh-var(--journey-h))] overflow-hidden bg-chat">
      <ServerRail tribes={otherTribes} activeId={tribe.id} qs={qs} />
      <div className="hidden w-60 shrink-0 md:flex">{channels}</div>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-12 shrink-0 items-center gap-2 border-b border-black/30 px-3 shadow-sm">
          <Button variant="ghost" size="icon-sm" className="md:hidden" onClick={() => setNavOpen(true)} aria-label="Channels">
            <Menu />
          </Button>
          {channel === "meetups" ? (
            <CalendarDays className="size-5 text-muted-foreground" />
          ) : channel === "grow" ? (
            <Sparkles className="size-5 text-muted-foreground" />
          ) : (
            <Hash className="size-5 text-muted-foreground" />
          )}
          <h1 className="font-semibold">{channel === "grow" ? "grow-the-tribe" : channel}</h1>
          <span className="mx-2 hidden h-5 w-px bg-white/10 sm:block" />
          <p className="hidden truncate text-sm text-muted-foreground sm:block">{tribe.tagline}</p>
          <div className="ml-auto flex items-center gap-1">
            <Button size="sm" className="rounded-md" onClick={() => setInviteOpen(true)}>
              <UserPlus /> <span className="hidden sm:inline">Invite</span>
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="lg:hidden"
              onClick={() => setMembersOpen(true)}
              aria-label="Members"
            >
              <Users />
            </Button>
          </div>
        </header>

        <div className="flex min-h-0 flex-1">
          <div className="flex min-w-0 flex-1 flex-col">
            {channel === "general" && (
              <Chat tribe={tribe} members={members} me={me} onSent={load} community={community} />
            )}
            {channel === "meetups" && <Meetups tribe={tribe} members={members} onInvite={() => setInviteOpen(true)} />}
            {channel === "grow" && (
              <Grow tribe={tribe} members={members} viaInvite={data.viaInvite} onInvite={() => setInviteOpen(true)} />
            )}
          </div>
          <aside className="scrollbar-thin hidden w-60 shrink-0 overflow-y-auto bg-panel lg:block">
            <MemberList members={members} me={me} tribe={tribe} />
          </aside>
        </div>
      </main>

      <InviteDialog open={inviteOpen} onOpenChange={setInviteOpen} tribe={tribe} me={me} members={members} />

      <Dialog open={navOpen} onOpenChange={setNavOpen}>
        <DialogContent className="h-[80dvh] gap-0 overflow-hidden p-0 sm:max-w-xs" showCloseButton={false}>
          <DialogTitle className="sr-only">Channels</DialogTitle>
          {channels}
        </DialogContent>
      </Dialog>
      <Dialog open={membersOpen} onOpenChange={setMembersOpen}>
        <DialogContent className="scrollbar-thin max-h-[80dvh] overflow-y-auto bg-panel p-0 sm:max-w-xs">
          <DialogTitle className="sr-only">Members</DialogTitle>
          <MemberList members={members} me={me} tribe={tribe} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ServerRail({
  tribes,
  activeId,
  qs,
}: {
  tribes: Data["otherTribes"];
  activeId: string;
  qs: string;
}) {
  return (
    <nav className="scrollbar-thin hidden w-[72px] shrink-0 flex-col items-center gap-2 overflow-y-auto bg-rail py-3 sm:flex" aria-label="Tribes">
      <RailItem label="Octopus home" href="/">
        <span className="flex size-12 items-center justify-center rounded-[24px] bg-blurple transition-all group-hover:rounded-2xl">
          <Octopus className="size-10" animated={false} />
        </span>
      </RailItem>
      <span className="h-0.5 w-8 rounded-full bg-white/10" />
      {tribes.map((t) => {
        const active = t.id === activeId;
        return (
          <RailItem key={t.id} label={t.name} href={`/tribe/${t.id}${qs}`} active={active}>
            <span
              className={cn(
                "flex size-12 items-center justify-center text-2xl transition-all",
                active ? "rounded-2xl" : "rounded-[24px] group-hover:rounded-2xl",
              )}
              style={{ background: active ? t.color : "#313338" }}
            >
              {t.emoji}
            </span>
          </RailItem>
        );
      })}
      <span className="h-0.5 w-8 rounded-full bg-white/10" />
      <RailItem label="Community manager dashboard" href="/dashboard">
        <span className="flex size-12 items-center justify-center rounded-[24px] bg-chat text-online transition-all group-hover:rounded-2xl group-hover:bg-online group-hover:text-white">
          <LayoutDashboard className="size-5" />
        </span>
      </RailItem>
    </nav>
  );
}

function RailItem({
  href,
  label,
  active,
  children,
}: {
  href: string;
  label: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger render={<Link href={href} aria-label={label} className="group relative flex w-full justify-center" />}>
        <span
          className={cn(
            "absolute top-1/2 left-0 w-1 -translate-y-1/2 rounded-r-full bg-white transition-all",
            active ? "h-10" : "h-0 group-hover:h-5",
          )}
        />
        {children}
      </TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}

function ChannelSidebar({
  tribe,
  me,
  members,
  channel,
  onChannel,
  onInvite,
}: {
  tribe: Tribe;
  me: Member | null;
  members: Member[];
  channel: Channel;
  onChannel: (c: Channel) => void;
  onInvite: () => void;
}) {
  const online = members.filter((m) => m.online);
  const items: { id: Channel; label: string; icon: React.ReactNode }[] = [
    { id: "general", label: "general", icon: <Hash className="size-5" /> },
    { id: "meetups", label: "meetups", icon: <CalendarDays className="size-5" /> },
    { id: "grow", label: "grow-the-tribe", icon: <Sparkles className="size-5" /> },
  ];
  return (
    <div className="flex size-full flex-col bg-panel">
      <div
        className="relative h-28 shrink-0 overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${tribe.color}, #2b2d31 90%)` }}
      >
        <span className="absolute -right-3 -bottom-6 text-[96px] opacity-40 select-none" aria-hidden>
          {tribe.emoji}
        </span>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-3">
          <p className="truncate font-display text-lg font-black drop-shadow">{tribe.name}</p>
          <p className="text-xs text-white/80">
            {members.length} members · {tribe.skill}
          </p>
        </div>
      </div>

      <div className="scrollbar-thin flex-1 space-y-4 overflow-y-auto p-2">
        <button
          onClick={onInvite}
          className="flex w-full items-center gap-2 rounded-md bg-blurple/15 px-2 py-2 text-left text-sm font-semibold text-indigo-200 ring-1 ring-blurple/40 hover:bg-blurple/25"
        >
          <UserPlus className="size-4" /> Invite friends to grow the tribe
        </button>
        <div>
          <p className="px-2 pb-1 text-[11px] font-bold tracking-wide text-muted-foreground uppercase">Text channels</p>
          {items.map((c) => (
            <button
              key={c.id}
              onClick={() => onChannel(c.id)}
              className={cn(
                "flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-[15px] transition",
                channel === c.id ? "bg-accent text-white" : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
              )}
            >
              <span className="opacity-70">{c.icon}</span>
              {c.label}
            </button>
          ))}
        </div>
        <div>
          <p className="px-2 pb-1 text-[11px] font-bold tracking-wide text-muted-foreground uppercase">Voice</p>
          <div className="flex items-center gap-1.5 px-2 py-1.5 text-[15px] text-muted-foreground">
            <Volume2 className="size-5 opacity-70" /> hangout
          </div>
          <div className="space-y-1 pl-8">
            {online.slice(0, 3).map((m) => (
              <div key={m.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                <MemberAvatar name={m.name} src={m.avatar} className="size-5" />
                {m.name.split(" ")[0]}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex h-14 shrink-0 items-center gap-2 bg-[#232428] px-2">
        {me ? (
          <>
            <MemberAvatar name={me.name} src={me.avatar} online className="size-8" ringClassName="ring-[#232428]" />
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-semibold">{me.name}</p>
              <p className="truncate text-xs text-muted-foreground">{me.skills.slice(0, 2).join(" · ")}</p>
            </div>
          </>
        ) : (
          <>
            <Octopus className="size-8" animated={false} />
            <div className="min-w-0 leading-tight">
              <p className="text-sm font-semibold">Community manager</p>
              <p className="text-xs text-muted-foreground">Viewing as observer</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function formatTime(ts: number) {
  const d = new Date(ts);
  const now = new Date();
  const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  if (d.toDateString() === now.toDateString()) return `Today at ${time}`;
  const y = new Date(now);
  y.setDate(now.getDate() - 1);
  if (d.toDateString() === y.toDateString()) return `Yesterday at ${time}`;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }) + ` at ${time}`;
}

function Chat({
  tribe,
  members,
  me,
  onSent,
  community,
}: {
  tribe: Tribe;
  members: Member[];
  me: Member | null;
  onSent: () => void;
  community: Community;
}) {
  const [text, setText] = useState("");
  const [ask, setAsk] = useState("");
  const [sending, setSending] = useState(false);
  const [asking, setAsking] = useState(false);
  const [pending, setPending] = useState<Message[]>([]);
  const bottom = useRef<HTMLDivElement>(null);
  const byId = useMemo(() => new Map(members.map((m) => [m.id, m])), [members]);
  const colorOf = (id: string) => NAME_COLORS[members.findIndex((m) => m.id === id) % NAME_COLORS.length];

  const messages = useMemo(() => {
    const ids = new Set(tribe.messages.map((m) => m.id));
    return [...tribe.messages, ...pending.filter((p) => !ids.has(p.id))];
  }, [tribe.messages, pending]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!me || !text.trim() || sending) return;
    const optimistic: Message = { id: `tmp-${Date.now()}`, authorId: me.id, text: text.trim(), createdAt: Date.now() };
    setPending((p) => [...p, optimistic]);
    setText("");
    setSending(true);
    try {
      const r = await fetch(`/api/tribes/${tribe.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authorId: me.id, text: optimistic.text }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setPending((p) => [...p.filter((m) => m.id !== optimistic.id), ...d.messages]);
      onSent();
    } catch (err) {
      setPending((p) => p.filter((m) => m.id !== optimistic.id));
      toast.error(err instanceof Error ? err.message : "Message failed");
    } finally {
      setSending(false);
    }
  }

  async function askGrok(e: React.FormEvent) {
    e.preventDefault();
    if (!me || !ask.trim() || asking) return;
    const question = ask.trim();
    setAsk("");
    setAsking(true);
    try {
      const r = await fetch(`/api/tribes/${tribe.id}/grok`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authorId: me.id, text: question }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      onSent();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Grok Bot did not start");
    } finally {
      setAsking(false);
    }
  }

  return (
    <>
      <div className="scrollbar-thin flex-1 overflow-y-auto">
        <div className="px-4 pt-8 pb-4">
          <span
            className="mb-3 flex size-16 items-center justify-center rounded-full text-3xl"
            style={{ background: tribe.color }}
          >
            {tribe.emoji}
          </span>
          <h2 className="font-display text-3xl font-black">Welcome to {tribe.name}!</h2>
          <p className="text-muted-foreground">
            A mini tribe of {community.name} for people who love <b className="text-foreground">{tribe.skill}</b>.
            Say hi, plan a meetup, bring a friend.
          </p>
        </div>
        <ol className="pb-4">
          {messages.map((m, i) => {
            const author = byId.get(m.authorId);
            const name = author?.name ?? "Someone";
            if (m.kind === "join") {
              return (
                <li key={m.id} className="mt-3 flex items-center gap-4 px-4 py-0.5 hover:bg-black/10">
                  <span className="flex w-10 shrink-0 justify-center text-online" aria-hidden>
                    <ArrowRight className="size-4" />
                  </span>
                  <p className="text-[15px] text-muted-foreground">
                    <span className="font-semibold text-foreground">{name}</span> joined the tribe
                    {m.text && <span className="text-muted-foreground"> · {m.text}</span>}
                    <span className="ml-2 text-xs">{formatTime(m.createdAt)}</span>
                  </p>
                </li>
              );
            }
            if (m.kind === "grok") {
              return (
                <li key={m.id} className="mt-4 flex gap-4 px-4 py-0.5 hover:bg-black/10">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-sm font-black text-black">
                    G
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-baseline gap-2">
                      <GrokBadge className="text-sm" />
                      <span className="text-xs text-muted-foreground">{formatTime(m.createdAt)}</span>
                    </p>
                    <p className="text-[15px] leading-relaxed break-words whitespace-pre-wrap text-[#dbdee1]">{m.text}</p>
                  </div>
                </li>
              );
            }
            const prev = messages[i - 1];
            const grouped =
              prev && prev.kind !== "join" && prev.authorId === m.authorId && m.createdAt - prev.createdAt < 5 * 60_000;
            return (
              <li
                key={m.id}
                className={cn(
                  "group relative flex gap-4 px-4 hover:bg-black/10",
                  grouped ? "py-0.5" : "mt-4 py-0.5",
                  m.id.startsWith("tmp-") && "opacity-60",
                )}
              >
                <div className="w-10 shrink-0">
                  {!grouped && <MemberAvatar name={name} src={author?.avatar} className="size-10" />}
                </div>
                <div className="min-w-0 flex-1">
                  {!grouped && (
                    <p className="flex items-baseline gap-2">
                      <span className="font-semibold" style={{ color: colorOf(m.authorId) }}>
                        {name}
                      </span>
                      <span className="text-xs text-muted-foreground">{formatTime(m.createdAt)}</span>
                    </p>
                  )}
                  <p className="text-[15px] leading-relaxed break-words whitespace-pre-wrap text-[#dbdee1]">{m.text}</p>
                </div>
              </li>
            );
          })}
        </ol>
        <div ref={bottom} />
      </div>
      <GrokMemoryBar tribe={tribe} members={members} />
      {me && (
        <form onSubmit={askGrok} className="shrink-0 px-4 pb-2">
          <div className="flex items-center gap-2 rounded-lg bg-panel px-4 ring-1 ring-white/10">
            <span className="text-xs font-bold tracking-wide text-muted-foreground uppercase">Ask Grok</span>
            <input
              value={ask}
              onChange={(e) => setAsk(e.target.value)}
              placeholder="Ask for another recommendation"
              className="h-10 flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted-foreground/70"
              aria-label="Ask Grok"
            />
            <Button type="submit" size="icon-sm" variant="ghost" disabled={!ask.trim() || asking} aria-label="Send to Grok">
              <Sparkles />
            </Button>
          </div>
        </form>
      )}
      <form onSubmit={send} className="shrink-0 px-4 pb-5">
        {me ? (
          <div className="flex items-center gap-2 rounded-lg bg-[#383a40] px-4">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={`Message #general as ${me.name.split(" ")[0]}`}
              className="h-11 flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted-foreground/70"
              aria-label="Message"
            />
            <Button type="submit" size="icon-sm" variant="ghost" disabled={!text.trim()} aria-label="Send">
              <SendHorizontal />
            </Button>
          </div>
        ) : (
          <div className="rounded-lg bg-[#383a40] px-4 py-3 text-sm text-muted-foreground">
            You&rsquo;re viewing as the community manager. Members chat here once they join.
          </div>
        )}
      </form>
    </>
  );
}

function GrokMemoryBar({ tribe, members }: { tribe: Tribe; members: Member[] }) {
  const byId = new Map(members.map((m) => [m.id, m]));
  const placed = [...tribe.messages].reverse().find((m) => m.kind === "join");
  const person = (placed && byId.get(placed.authorId)) || members.find((m) => m.memory?.chatSummary);
  if (!person) return null;
  const summary = person.memory?.chatSummary;

  return (
    <div className="mx-4 mb-2 rounded-lg bg-panel px-3 py-2 ring-1 ring-white/10">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <GrokBadge className="text-xs text-muted-foreground" />
        <span className="text-sm font-semibold">{person.name}</span>
        {placed?.text && <span className="text-xs text-muted-foreground">{placed.text}</span>}
      </div>
      {summary && <p className="mt-1 text-sm text-[#dbdee1]">Remembers: {summary}</p>}
    </div>
  );
}

function MemberList({ members, me, tribe }: { members: Member[]; me: Member | null; tribe: Tribe }) {
  const online = members.filter((m) => m.online || m.id === me?.id);
  const offline = members.filter((m) => !online.includes(m));
  const skillCounts = useMemo(() => {
    const c = new Map<string, number>();
    members.forEach((m) => m.skills.forEach((s) => c.set(s, (c.get(s) ?? 0) + 1)));
    return [...c.entries()].filter(([, n]) => n > 1).sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [members]);

  const row = (m: Member, isOnline: boolean) => {
    const shared = me && m.id !== me.id ? m.skills.filter((s) => me.skills.includes(s)) : [];
    return (
      <Tooltip key={m.id}>
        <TooltipTrigger
          render={
            <div
              className={cn(
                "flex cursor-default items-center gap-3 rounded-md px-2 py-1.5 hover:bg-white/5",
                !isOnline && "opacity-40 hover:opacity-100",
              )}
            />
          }
        >
          <MemberAvatar name={m.name} src={m.avatar} online={isOnline} className="size-8" />
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-medium">
              {m.name}
              {m.id === me?.id && <span className="ml-1 text-xs text-muted-foreground">(you)</span>}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {m.memory?.chatSummary || (m.invitedBy ? "🌱 joined via invite" : m.area)}
            </p>
          </div>
        </TooltipTrigger>
        <TooltipContent side="left" className="max-w-56">
          <p className="mb-1 font-semibold">{m.name} · {m.area}</p>
          <p className="text-xs opacity-80">{m.skills.join(" · ")}</p>
          {m.memory?.chatSummary && <p className="mt-1 text-xs">Grok remembers: {m.memory.chatSummary}</p>}
          {shared.length > 0 && <p className="mt-1 text-xs">🐙 You share {shared.join(", ")}</p>}
        </TooltipContent>
      </Tooltip>
    );
  };

  return (
    <div className="space-y-5 p-3">
      <section>
        <p className="px-2 pb-1 text-[11px] font-bold tracking-wide text-muted-foreground uppercase">
          Online — {online.length}
        </p>
        {online.map((m) => row(m, true))}
      </section>
      {offline.length > 0 && (
        <section>
          <p className="px-2 pb-1 text-[11px] font-bold tracking-wide text-muted-foreground uppercase">
            Offline — {offline.length}
          </p>
          {offline.map((m) => row(m, false))}
        </section>
      )}
      {skillCounts.length > 0 && (
        <section className="px-2">
          <p className="pb-2 text-[11px] font-bold tracking-wide text-muted-foreground uppercase">Tribe overlaps</p>
          <div className="flex flex-wrap gap-1">
            {skillCounts.map(([s, n]) => (
              <span key={s} className="inline-flex items-center gap-0.5">
                <SkillChip skill={s} highlight={s === tribe.skill} className="text-[11px]" />
                <span className="text-[10px] text-muted-foreground">×{n}</span>
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Meetups({ tribe, members, onInvite }: { tribe: Tribe; members: Member[]; onInvite: () => void }) {
  const meetups = useMemo(() => meetupsFor(tribe.skill, members.length), [tribe.skill, members.length]);
  const [going, setGoing] = useState<Record<string, boolean>>({});
  return (
    <div className="scrollbar-thin flex-1 overflow-y-auto p-4 sm:p-6">
      <div className="mb-5 flex items-center gap-3">
        <Octopus className="size-14" mood="wink" />
        <div>
          <h2 className="font-display text-2xl font-black">Upcoming meetups</h2>
          <p className="text-sm text-muted-foreground">Picked from what your tribe has in common.</p>
        </div>
      </div>
      <div className="grid gap-3 xl:grid-cols-2">
        {meetups.map((m, i) => {
          const isGoing = going[m.id];
          const faces = members.slice(i * 2, i * 2 + 4);
          return (
            <article key={m.id} className="overflow-hidden rounded-xl bg-panel ring-1 ring-white/5">
              <div className="h-2" style={{ background: tribe.color }} />
              <div className="space-y-3 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex w-14 shrink-0 flex-col items-center rounded-lg bg-rail py-1.5">
                    <span className="text-[11px] font-bold text-fuchsia uppercase">
                      {m.when.toLocaleDateString("en-GB", { weekday: "short" })}
                    </span>
                    <span className="font-display text-2xl leading-none font-black">{m.when.getDate()}</span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold">{m.title}</h3>
                    <p className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="size-3.5" /> {m.venue}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {m.when.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} (London time)
                    </p>
                  </div>
                </div>
                {m.bringAFriend && (
                  <p className="rounded-lg bg-sun/10 px-3 py-2 text-sm text-yellow-100 ring-1 ring-sun/30">
                    🌱 Bring-a-friend night: every plus-one gets a tribe invite.
                  </p>
                )}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {faces.map((f) => (
                        <MemberAvatar key={f.id} name={f.name} src={f.avatar} className="size-7 rounded-full ring-2 ring-panel" />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">{m.going + (isGoing ? 1 : 0)} going</span>
                  </div>
                  <div className="flex gap-2">
                    {m.bringAFriend && (
                      <Button size="sm" variant="secondary" onClick={onInvite}>
                        <UserPlus /> Plus-one
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant={isGoing ? "secondary" : "default"}
                      onClick={() => {
                        setGoing((g) => ({ ...g, [m.id]: !isGoing }));
                        if (!isGoing) toast.success(`You're going to ${m.title} 🐙`);
                      }}
                    >
                      {isGoing ? "✓ Going" : "I'm in"}
                    </Button>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function Grow({
  tribe,
  members,
  viaInvite,
  onInvite,
}: {
  tribe: Tribe;
  members: Member[];
  viaInvite: number;
  onInvite: () => void;
}) {
  const inviters = useMemo(() => {
    const c = new Map<string, number>();
    members.forEach((m) => m.invitedBy && c.set(m.invitedBy, (c.get(m.invitedBy) ?? 0) + 1));
    return [...c.entries()]
      .map(([id, n]) => ({ m: members.find((x) => x.id === id), n }))
      .filter((x): x is { m: Member; n: number } => Boolean(x.m))
      .sort((a, b) => b.n - a.n);
  }, [members]);
  const goal = Math.ceil((members.length + 1) / 5) * 5 + 5;

  return (
    <div className="scrollbar-thin flex-1 overflow-y-auto p-4 sm:p-6">
      <div className="mx-auto max-w-2xl space-y-5">
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blurple to-fuchsia p-6">
          <Octopus className="absolute -right-6 -bottom-8 size-40 opacity-90" mood="party" />
          <p className="text-sm font-bold text-white/80 uppercase">The flywheel</p>
          <h2 className="max-w-sm font-display text-3xl font-black">
            {members.length} → {goal} Londoners
          </h2>
          <p className="max-w-sm text-white/85">
            Every friend you bring joins {tribe.name} <i>and</i> gets matched into new tribes, which invite more
            friends.
          </p>
          <div className="mt-4 h-3 max-w-sm overflow-hidden rounded-full bg-black/25">
            <div className="h-full rounded-full bg-sun" style={{ width: `${(members.length / goal) * 100}%` }} />
          </div>
          <Button
            onClick={onInvite}
            className="mt-4 h-11 rounded-xl bg-white px-5 font-display font-black text-black hover:bg-white/90"
          >
            <UserPlus /> Invite a friend
          </Button>
        </section>

        <section className="grid grid-cols-3 gap-3">
          {[
            ["Members", members.length],
            ["Joined via invite", viaInvite],
            ["Invite rate", `${Math.round((viaInvite / Math.max(1, members.length)) * 100)}%`],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl bg-panel p-4 ring-1 ring-white/5">
              <p className="font-display text-3xl font-black">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </section>

        <section className="rounded-xl bg-panel p-4 ring-1 ring-white/5">
          <h3 className="mb-3 font-display text-lg font-black">🏆 Top recruiters</h3>
          {inviters.length === 0 ? (
            <p className="text-sm text-muted-foreground">No invites yet. Be the first tentacle to reach out.</p>
          ) : (
            <ol className="space-y-2">
              {inviters.map(({ m, n }, i) => (
                <li key={m.id} className="flex items-center gap-3">
                  <span className="w-5 text-center font-display font-black text-muted-foreground">{i + 1}</span>
                  <MemberAvatar name={m.name} src={m.avatar} className="size-8" />
                  <span className="flex-1 font-medium">{m.name}</span>
                  <span className="rounded-full bg-online/15 px-2 py-0.5 text-sm font-semibold text-green-300">
                    +{n} friend{n > 1 ? "s" : ""}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </div>
  );
}
