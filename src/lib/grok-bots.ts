// Scripted demo data for the Grok bots shown to the community manager.

export type Severity = "high" | "medium" | "low";

export type Flag = {
  id: string;
  memberId: string;
  tribeId: string;
  severity: Severity;
  category: string;
  summary: string;
  evidence: string;
  reports: number;
  hoursAgo: number;
  suggestion: "Remove" | "Mute 24h" | "Warn" | "Nudge";
  confidence: number;
};

export const FLAGS: Flag[] = [
  {
    id: "f1",
    memberId: "rohan",
    tribeId: "padel-pack",
    severity: "high",
    category: "Spam / scam",
    summary: "Posted the same crypto “investment group” link in 3 tribes within 10 minutes.",
    evidence: "“Guys 🚀 join my private signals group, 40% weekly returns, link in bio”",
    reports: 4,
    hoursAgo: 1,
    suggestion: "Remove",
    confidence: 96,
  },
  {
    id: "f2",
    memberId: "yusuf",
    tribeId: "chess-club",
    severity: "medium",
    category: "Harassment",
    summary: "Kept messaging Sofia after she asked him to stop. 2 members reported it.",
    evidence: "“come onnn just one more game tonight, why are you ignoring me”",
    reports: 2,
    hoursAgo: 5,
    suggestion: "Mute 24h",
    confidence: 81,
  },
  {
    id: "f3",
    memberId: "tom",
    tribeId: "padel-pack",
    severity: "low",
    category: "Self-promo",
    summary: "Recruiting pitch in #general. Tribes are for hobbies, not LinkedIn.",
    evidence: "“We're hiring senior devs at my startup, DM me your CV 👀”",
    reports: 1,
    hoursAgo: 9,
    suggestion: "Warn",
    confidence: 74,
  },
  {
    id: "f4",
    memberId: "noah",
    tribeId: "supper-club",
    severity: "low",
    category: "Flaky RSVPs",
    summary: "Said “I'm in” to 3 supper clubs in a row and didn't show. The host had cooked for 7.",
    evidence: "3 no-shows · 0 cancellations",
    reports: 1,
    hoursAgo: 20,
    suggestion: "Nudge",
    confidence: 68,
  },
];

export type DayStat = {
  label: string;
  newMembers: number;
  viaInvite: number;
  invitesSent: number;
  activeTribes: number;
  messages: number;
};

export function growthSeries(days = 14): DayStat[] {
  const base = [6, 7, 5, 9, 8, 11, 10, 12, 14, 13, 16, 19, 18, 23];
  const today = new Date();
  return base.slice(-days).map((n, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (days - i));
    return {
      label: d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric" }),
      newMembers: n,
      viaInvite: Math.round(n * (0.35 + i * 0.025)),
      invitesSent: Math.round(n * 2.4 + (i % 3)),
      activeTribes: 3 + Math.floor(i / 3),
      messages: 40 + i * 11 + (i % 2) * 9,
    };
  });
}

export const TRIBE_LEADERBOARD = [
  { tribeId: "padel-pack", invites: 31, joins: 9, delta: "+4" },
  { tribeId: "supper-club", invites: 18, joins: 5, delta: "+2" },
  { tribeId: "chess-club", invites: 12, joins: 3, delta: "+1" },
  { tribeId: "film-walkers", invites: 9, joins: 2, delta: "+1" },
];

export function matchmakerScript(name: string, tribeName: string, shared: string[], plus: number) {
  return [
    `Reading ${name}'s 8 arms…`,
    `Found ${plus} people who share ${shared[0] ?? "a social skill"}`,
    shared.length > 1 ? `Bonus overlap: ${shared.slice(1, 3).join(" & ")}` : "Checking neighbourhood distance…",
    `Placed ${name} in ${tribeName} (+${plus})`,
  ];
}
