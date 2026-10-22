import type { DB, Member, MemberMemory, MemorySource, Tribe } from "./types";

const PRESET_SUMMARIES: Record<string, string> = {
  "demo-jess": "Asked in #general who plays padel on weekends in Hackney.",
};

export function discordHandle(member: Pick<Member, "email" | "id" | "memory">) {
  if (member.memory?.discordName) return member.memory.discordName;
  const local = member.email.split("@")[0] ?? member.id;
  return local.replace(/[^a-z0-9._-]/gi, "").slice(0, 32) || member.id;
}

export function memorySource(member: Member): MemorySource {
  if (member.invitedBy) return "tribe_invite";
  return member.memory?.source === "self" ? "self" : "crm";
}

export function sourceLabel(source: MemorySource) {
  if (source === "tribe_invite") return "Tribe invite";
  if (source === "self") return "Self";
  return "CRM";
}

function clip(text: string, max = 180) {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max - 1)}…` : clean;
}

function latestChat(member: Member, tribes: Tribe[]) {
  let best: { text: string; createdAt: number } | null = null;
  for (const tribe of tribes) {
    for (const message of tribe.messages) {
      if (message.authorId !== member.id || message.kind === "join" || !message.text.trim()) continue;
      if (!best || message.createdAt > best.createdAt) best = { text: message.text, createdAt: message.createdAt };
    }
  }
  return best;
}

export function createMemory(member: Member, tribes: Tribe[], note?: string): MemberMemory {
  const typed = note?.trim();
  const chat = latestChat(member, tribes);
  const chatSummary = clip(typed || PRESET_SUMMARIES[member.id] || (chat ? `Said in a tribe: “${chat.text}”` : ""));
  return {
    discordName: discordHandle(member),
    chatSummary,
    source: memorySource(member),
    lastActiveAt: typed ? Date.now() : (chat?.createdAt ?? member.joinedAt ?? member.createdAt),
  };
}

/** Fill memory for anyone loaded from an older db.json. Returns true when it changed the db. */
export function hydrateMemory(db: DB) {
  let changed = false;
  for (const member of db.members) {
    if (member.memory) continue;
    member.memory = createMemory(member, db.tribes);
    changed = true;
  }
  return changed;
}

export function writeMemory(member: Member, tribes: Tribe[], note?: string) {
  const typed = note?.trim();
  const previous = member.memory;
  const next = createMemory(member, tribes, typed || previous?.chatSummary);
  if (previous?.discordName) next.discordName = previous.discordName;
  if (!typed && previous?.chatSummary) next.chatSummary = previous.chatSummary;
  next.lastActiveAt = Date.now();
  member.memory = next;
  return next;
}

type TribeRef = { id: string; name: string; skill?: string };

function tribeNames(member: Member, tribes: TribeRef[]) {
  const names = member.tribeIds
    .map((id) => tribes.find((tribe) => tribe.id === id)?.name)
    .filter((name): name is string => Boolean(name));
  return names.length ? names.join(", ") : "(none yet)";
}

export function memberUpdatePrompt(member: Member, tribes: TribeRef[] = []) {
  const memory = member.memory;
  const source = memory?.source ?? memorySource(member);
  const active = new Date(memory?.lastActiveAt ?? member.joinedAt ?? member.createdAt).toISOString();
  return `Remember this member and update community-memory.md.

Name: ${member.name}
Discord: ${memory?.discordName ?? discordHandle(member)}
Skills: ${member.skills.length ? member.skills.join(", ") : "(none yet)"}
Chat summary: ${memory?.chatSummary || "(none)"}
Tribes: ${tribeNames(member, tribes)}
Source: ${source}
Last active: ${active}

Match them against the tribes in your memory. Reply with:
1. What you now remember about this person
2. join <existing tribe name> or create <skill>
3. Reason, citing skills and the chat summary
4. A Discord message I can paste`;
}

export function communityMemoryPrompt(members: Member[], tribes: TribeRef[]) {
  const tribeLines = tribes.map((tribe) => `- ${tribe.name}${tribe.skill ? ` (${tribe.skill})` : ""}`).join("\n");
  const people = members
    .map((member) => {
      const memory = member.memory;
      return [
        `Name: ${member.name}`,
        `Discord: ${memory?.discordName ?? discordHandle(member)}`,
        `Skills: ${member.skills.length ? member.skills.join(", ") : "(none yet)"}`,
        `Chat summary: ${memory?.chatSummary || "(none)"}`,
        `Tribes: ${tribeNames(member, tribes)}`,
        `Source: ${memory?.source ?? memorySource(member)}`,
        `Last active: ${new Date(memory?.lastActiveAt ?? member.joinedAt ?? member.createdAt).toISOString()}`,
      ].join("\n");
    })
    .join("\n\n");

  return `Remember every member below and replace community-memory.md with this list.

Tribes:
${tribeLines || "(none yet)"}

Members:
${people}

Confirm how many members you now remember. Do not invent anyone who is not on this list.`;
}
