"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Check, Copy, Download, FileUp, Loader2, Search, Upload } from "lucide-react";
import { toast } from "sonner";
import { MemberAvatar } from "@/components/member-avatar";
import { SkillChip } from "@/components/skill-chip";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Snapshot } from "@/lib/api";
import { sourceLabel } from "@/lib/memory";
import { cn } from "@/lib/utils";

type Filter = "all" | "invited" | "joined" | "unmatched";

export function CrmPanel({ state, onState }: { state: Snapshot; onState: (s: Snapshot) => void }) {
  const [text, setText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [drag, setDrag] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [fresh, setFresh] = useState<Set<string>>(new Set());
  const fileRef = useRef<HTMLInputElement>(null);

  const tribeName = useMemo(() => new Map(state.tribes.map((t) => [t.id, t])), [state.tribes]);

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return [...state.members]
      .sort((a, b) => b.createdAt - a.createdAt)
      .filter((m) =>
        filter === "all"
          ? true
          : filter === "unmatched"
            ? m.status === "joined" && m.tribeIds.length === 0
            : m.status === filter,
      )
      .filter((m) => !term || m.name.toLowerCase().includes(term) || m.email.includes(term));
  }, [state.members, filter, q]);

  async function upload(payload: string) {
    if (!payload.trim()) return;
    setUploading(true);
    const before = new Set(state.members.map((m) => m.id));
    try {
      const r = await fetch("/api/crm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: payload }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      onState(d.state);
      setFresh(new Set(d.state.members.filter((m: { id: string }) => !before.has(m.id)).map((m: { id: string }) => m.id)));
      setText("");
      setFilter("all");
      toast.success(
        `${d.added} Londoner${d.added === 1 ? "" : "s"} added and invited 🐙` +
          (d.duplicates ? ` · ${d.duplicates} already in your CRM` : ""),
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function readFile(file: File) {
    upload(await file.text());
  }

  async function useSample() {
    const r = await fetch("/sample-crm.csv");
    upload(await r.text());
  }

  function copyLink(id: string) {
    const url = `${window.location.origin}/join/${id}`;
    navigator.clipboard.writeText(url).catch(() => {});
    setCopied(id);
    toast.success("Skills-form link copied");
    setTimeout(() => setCopied(null), 1500);
  }

  const counts = {
    all: state.members.length,
    invited: state.stats.invited,
    joined: state.stats.joined,
    unmatched: state.stats.unmatched,
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div>
        <div>
          <h2 className="font-display text-3xl font-black">CRM</h2>
          <p className="text-muted-foreground">
            Upload your member list. Everyone gets a personal link to fill in their 8 social skills. Each join
            saves the memory Grok matches on.
          </p>
        </div>
      </div>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            const f = e.dataTransfer.files[0];
            if (f) readFile(f);
          }}
          className={cn(
            "flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-8 text-center transition",
            drag ? "border-blurple bg-blurple/10" : "border-white/10 bg-panel",
          )}
        >
          <span className="flex size-14 items-center justify-center rounded-2xl bg-blurple/20 text-blurple">
            {uploading ? <Loader2 className="size-7 animate-spin" /> : <FileUp className="size-7" />}
          </span>
          <div>
            <p className="font-display text-lg font-black">Drop your CRM export here</p>
            <p className="text-sm text-muted-foreground">CSV with an email column. Names are optional.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <Button onClick={() => fileRef.current?.click()} disabled={uploading}>
              <Upload /> Choose CSV
            </Button>
            <Button variant="secondary" onClick={useSample} disabled={uploading}>
              ✨ Use sample London list
            </Button>
            <Button
              variant="ghost"
              render={<a href="/sample-crm.csv" download />}
              nativeButton={false}
              className="text-muted-foreground"
            >
              <Download /> Template
            </Button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.txt,text/csv"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) readFile(f);
              e.target.value = "";
            }}
          />
        </div>

        <div className="flex flex-col gap-2 rounded-2xl bg-panel p-4">
          <label htmlFor="paste" className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
            Or paste emails
          </label>
          <Textarea
            id="paste"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={"Imogen Hale, imogen.hale@gmail.com\ntariq.hussain@icloud.com"}
            className="min-h-28 flex-1 resize-none bg-rail font-mono text-sm"
          />
          <Button onClick={() => upload(text)} disabled={!text.trim() || uploading} className="self-end">
            {uploading ? <Loader2 className="animate-spin" /> : <Upload />} Import & invite
          </Button>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl bg-panel ring-1 ring-white/5">
        <div className="flex flex-col gap-3 border-b border-white/5 p-3 sm:flex-row sm:items-center">
          <div className="flex gap-1 overflow-x-auto">
            {(Object.keys(counts) as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "shrink-0 rounded-md px-3 py-1.5 text-sm font-medium capitalize transition",
                  filter === f ? "bg-accent text-white" : "text-muted-foreground hover:bg-white/5",
                )}
              >
                {f} <span className="ml-1 text-xs opacity-60">{counts[f]}</span>
              </button>
            ))}
          </div>
          <div className="relative sm:ml-auto sm:w-64">
            <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name or email"
              className="h-9 w-full rounded-md bg-rail pr-3 pl-8 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blurple"
            />
          </div>
        </div>

        {rows.length === 0 ? (
          <p className="p-10 text-center text-muted-foreground">
            {filter === "unmatched" ? "Everyone who joined is in a tribe. 🐙" : "No members match that search."}
          </p>
        ) : (
          <ul className="divide-y divide-white/5">
            {rows.map((m) => (
              <li
                key={m.id}
                className={cn(
                  "flex flex-col gap-3 p-3 sm:flex-row sm:items-center",
                  fresh.has(m.id) && "pop-in bg-blurple/[0.07]",
                )}
              >
                <div className="flex min-w-0 items-center gap-3 sm:w-64">
                  <MemberAvatar name={m.name} src={m.avatar} className="size-9" />
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {m.name}
                      {fresh.has(m.id) && (
                        <span className="ml-2 rounded bg-blurple px-1 text-[10px] font-bold">NEW</span>
                      )}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{m.email}</p>
                    {m.memory?.chatSummary && (
                      <p className="line-clamp-2 text-xs text-muted-foreground">{m.memory.chatSummary}</p>
                    )}
                  </div>
                </div>
                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                    {sourceLabel(m.memory?.source ?? (m.invitedBy ? "tribe_invite" : "crm"))}
                  </span>
                  {m.status === "invited" ? (
                    <span className="rounded-full bg-sun/15 px-2 py-0.5 text-xs font-semibold text-yellow-200">
                      ✉️ Invited · waiting for skills
                    </span>
                  ) : (
                    <>
                      {m.tribeIds.length === 0 && (
                        <span className="rounded-full bg-orange-500/15 px-2 py-0.5 text-xs font-semibold text-orange-200">
                          Needs a tribe
                        </span>
                      )}
                      {m.tribeIds.map((tid) => {
                        const t = tribeName.get(tid);
                        return t ? (
                          <Link
                            key={tid}
                            href={`/tribe/${tid}?me=${m.id}`}
                            className="rounded-full px-2 py-0.5 text-xs font-semibold text-black hover:brightness-110"
                            style={{ background: t.color }}
                          >
                            {t.emoji} {t.name}
                          </Link>
                        ) : null;
                      })}
                      {m.skills.slice(0, 3).map((s) => (
                        <SkillChip key={s} skill={s} className="hidden xl:inline-flex" />
                      ))}
                    </>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="secondary" onClick={() => copyLink(m.id)}>
                    {copied === m.id ? <Check /> : <Copy />} Link
                  </Button>
                  <Button size="sm" variant="ghost" render={<Link href={`/join/${m.id}`} />} nativeButton={false}>
                    Open form
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
