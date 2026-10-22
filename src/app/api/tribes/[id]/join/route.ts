import { nanoid } from "nanoid";
import { bad } from "@/lib/api";
import { getDb, saveDb } from "@/lib/db";
import { joinViaInvite } from "@/lib/matching";
import { notifyGrokBot } from "@/lib/grok-bot";
import { createMemory, writeMemory } from "@/lib/memory";
import { MAX_SKILLS, MIN_SKILLS, normalizeSkill, validateSkill } from "@/lib/skills";
import type { Member } from "@/lib/types";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Ctx) {
  const { id } = await params;
  const db = getDb();
  const tribe = db.tribes.find((t) => t.id === id);
  if (!tribe) return bad("Tribe not found.", 404);

  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim().slice(0, 60) : "";
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!name) return bad("What should the tribe call you?");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return bad("That email doesn't look right.");

  const raw: unknown = body?.skills;
  if (!Array.isArray(raw)) return bad("Pick some social skills first.");
  const skills = [...new Set(raw.map((s) => normalizeSkill(String(s))))].slice(0, MAX_SKILLS);
  if (skills.length < MIN_SKILLS) return bad(`Pick at least ${MIN_SKILLS} social skills.`);
  const invalid = skills.find((s) => validateSkill(s));
  if (invalid) return bad(`"${invalid}": ${validateSkill(invalid)}`);

  const ref = typeof body?.ref === "string" && tribe.memberIds.includes(body.ref) ? body.ref : tribe.memberIds[0];

  let member = db.members.find((m) => m.email.toLowerCase() === email);
  if (!member) {
    member = {
      id: nanoid(10),
      name,
      email,
      area: typeof body?.area === "string" && body.area.trim() ? body.area.trim().slice(0, 40) : "London",
      status: "joined",
      skills,
      tribeIds: [],
      invitedBy: ref,
      online: true,
      createdAt: Date.now(),
      joinedAt: Date.now(),
      memory: undefined,
    } satisfies Member;
    member.memory = createMemory(member, db.tribes);
    db.members.push(member);
  } else {
    member.name = name;
    member.skills = skills;
    member.status = "joined";
    member.online = true;
    member.invitedBy ??= ref;
    member.joinedAt ??= Date.now();
  }

  const result = joinViaInvite(db, member, tribe);
  const note = typeof body?.note === "string" ? body.note : undefined;
  writeMemory(member, db.tribes, note);
  saveDb();
  const grok = await notifyGrokBot(db, member, "match");
  return Response.json(grok ? { ...result, grok } : result);
}
