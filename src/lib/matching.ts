import "server-only";
import { nanoid } from "nanoid";
import { skillMeta } from "./skills";
import type { DB, MatchResult, Member, Tribe } from "./types";

const COLORS = ["#f472b6", "#a78bfa", "#fbbf24", "#34d399", "#60a5fa", "#fb923c", "#22d3ee"];

const firstName = (m: Member) => m.name.split(" ")[0];

function shared(a: Member, b: Member) {
  const set = new Set(b.skills.map((s) => s.toLowerCase()));
  return a.skills.filter((s) => set.has(s.toLowerCase()));
}

function hasSkill(m: Member, skill: string) {
  return m.skills.some((s) => s.toLowerCase() === skill.toLowerCase());
}

function tribeOverlap(db: DB, me: Member, tribe: Tribe) {
  const skills = new Set(
    tribe.memberIds
      .filter((id) => id !== me.id)
      .flatMap((id) => db.members.find((m) => m.id === id)?.skills ?? [])
      .map((s) => s.toLowerCase()),
  );
  return me.skills.filter((s) => skills.has(s.toLowerCase()));
}

function mostCommonArea(members: Member[]) {
  const counts = new Map<string, number>();
  for (const m of members) {
    if (m.area && m.area !== "London") counts.set(m.area, (counts.get(m.area) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "London";
}

function localIdentity(skill: string, members: Member[]) {
  const { crew } = skillMeta(skill);
  const area = mostCommonArea(members);
  return {
    name: `${area} ${skill} ${crew}`,
    tagline: `First ${skill.toLowerCase()} meetup in ${area}. Pick a date in #meetups.`,
  };
}

function mates(db: DB, me: Member, tribe: Tribe | null) {
  if (!tribe) return [];
  return tribe.memberIds
    .filter((id) => id !== me.id)
    .map((id) => db.members.find((m) => m.id === id))
    .filter((m): m is Member => Boolean(m))
    .map((m) => ({ ...m, shared: shared(me, m) }))
    .sort((a, b) => b.shared.length - a.shared.length);
}

function addToTribe(db: DB, me: Member, tribe: Tribe, note: string) {
  if (tribe.memberIds.includes(me.id)) return;
  tribe.memberIds.push(me.id);
  if (!me.tribeIds.includes(tribe.id)) me.tribeIds.push(tribe.id);
  tribe.messages.push({ id: nanoid(8), authorId: me.id, kind: "join", text: note, createdAt: Date.now() });
}

function createTribe(db: DB, skill: string, people: Member[]): Tribe {
  const identity = localIdentity(skill, people);
  const tribe: Tribe = {
    id: nanoid(8),
    name: identity.name,
    skill,
    emoji: skillMeta(skill).emoji,
    tagline: identity.tagline,
    color: COLORS[db.tribes.length % COLORS.length],
    memberIds: people.map((p) => p.id),
    messages: people.map((p, i) => ({
      id: nanoid(8),
      authorId: p.id,
      kind: "join" as const,
      text: i === 0 ? `Matched on ${skill}` : "",
      createdAt: Date.now() + i,
    })),
    createdAt: Date.now(),
  };
  for (const p of people) if (!p.tribeIds.includes(tribe.id)) p.tribeIds.push(tribe.id);
  db.tribes.push(tribe);
  return tribe;
}

export async function matchMember(db: DB, me: Member): Promise<MatchResult> {
  const others = db.members.filter((m) => m.status === "joined" && m.id !== me.id);

  let best: { skill: string; score: number; overlap: number; tribe?: Tribe; people: Member[] } | null =
    null;

  for (const skill of me.skills) {
    const tribe = db.tribes.find((t) => t.skill.toLowerCase() === skill.toLowerCase());
    const people = others.filter((o) => hasSkill(o, skill));
    const pool = new Set([...people.map((p) => p.id), ...(tribe?.memberIds ?? [])]);
    pool.delete(me.id);
    const overlap = people.reduce((n, p) => n + shared(me, p).length, 0);
    const score = pool.size;
    if (score > 0 && (!best || score > best.score || (score === best.score && overlap > best.overlap))) {
      best = { skill, score, overlap, tribe, people };
    }
  }

  if (!best) return { member: me, tribe: null, mates: [] };

  let tribe: Tribe;
  if (best.tribe) {
    tribe = best.tribe;
    const extra = tribeOverlap(db, me, tribe)
      .filter((s) => s !== tribe.skill)
      .slice(0, 2);
    addToTribe(
      db,
      me,
      tribe,
      `Matched on ${tribe.skill}${extra.length ? ` · also into ${extra.join(" & ")}` : ""}`,
    );
  } else {
    tribe = createTribe(db, best.skill, [me, ...best.people]);
  }

  return { member: me, tribe, mates: mates(db, me, tribe) };
}

export function joinViaInvite(db: DB, me: Member, tribe: Tribe): MatchResult {
  const inviter = me.invitedBy ? db.members.find((m) => m.id === me.invitedBy) : undefined;
  addToTribe(
    db,
    me,
    tribe,
    `${inviter ? `Invited by ${firstName(inviter)} · ` : ""}into ${
      tribeOverlap(db, me, tribe).slice(0, 3).join(", ") || tribe.skill
    }`,
  );
  return { member: me, tribe, mates: mates(db, me, tribe), };
}

export async function runBatchMatch(db: DB) {
  const before = db.tribes.length;
  const pending = db.members.filter(
    (m) => m.status === "joined" && m.tribeIds.length === 0 && m.skills.length > 0,
  );
  const placements: { memberId: string; name: string; tribeId: string; tribeName: string; plus: number; shared: string[]; isNew: boolean }[] = [];
  const unmatched: string[] = [];
  for (const m of pending) {
    if (m.tribeIds.length > 0) continue;
    const isNewBefore = db.tribes.length;
    const r = await matchMember(db, m);
    if (!r.tribe) {
      unmatched.push(m.name);
      continue;
    }
    const sharedSkills = [...new Set(r.mates.flatMap((x) => x.shared))];
    placements.push({
      memberId: m.id,
      name: m.name,
      tribeId: r.tribe.id,
      tribeName: r.tribe.name,
      plus: r.mates.length,
      shared: [r.tribe.skill, ...sharedSkills.filter((s) => s !== r.tribe!.skill)].slice(0, 3),
      isNew: db.tribes.length > isNewBefore,
    });
  }
  return { created: db.tribes.slice(before), placements, unmatched, pending: pending.length };
}
