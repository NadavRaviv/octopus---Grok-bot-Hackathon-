import "server-only";
import type { DB, Member } from "./types";

function person(db: DB, member: Member) {
  const tribes = member.tribeIds
    .map((id) => db.tribes.find((tribe) => tribe.id === id)?.name)
    .filter((name): name is string => Boolean(name));
  return {
    name: member.name,
    discord: member.memory?.discordName ?? member.email.split("@")[0] ?? "",
    skills: member.skills,
    chatSummary: member.memory?.chatSummary ?? "",
    source: member.memory?.source ?? (member.invitedBy ? "tribe_invite" : "crm"),
    tribes,
    area: member.area ?? "",
  };
}

export function communityPayload(
  db: DB,
  joiner: Member | null,
  action: "sync" | "match" | "chat",
  message?: string,
) {
  const joinerRecord = joiner ? person(db, joiner) : null;
  if (joinerRecord && message?.trim()) {
    joinerRecord.chatSummary = [joinerRecord.chatSummary, `Latest request: ${message.trim()}`]
      .filter(Boolean)
      .join(" ");
  }
  return {
    action: message?.trim() ? "match" : action,
    message: message ?? "",
    requestedAt: new Date().toISOString(),
    joiner: joinerRecord,
    tribes: db.tribes.map((tribe) => ({
      name: tribe.name,
      skill: tribe.skill,
      tagline: tribe.tagline,
      members: tribe.memberIds
        .map((id) => db.members.find((member) => member.id === id)?.name)
        .filter((name): name is string => Boolean(name)),
    })),
    members: db.members.map((member) => person(db, member)),
  };
}

export async function notifyGrokBot(
  db: DB,
  joiner: Member | null,
  action: "sync" | "match" | "chat",
  message?: string,
) {
  const url = process.env.GROK_BOT_WEBHOOK_URL;
  const key = process.env.GROK_BOT_WEBHOOK_KEY;
  if (!url || !key) return null;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify(communityPayload(db, joiner, action, message)),
      signal: AbortSignal.timeout(8000),
    });
    return { sent: res.ok, status: res.status };
  } catch {
    return { sent: false, status: 0 };
  }
}
