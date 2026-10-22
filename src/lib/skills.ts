export type SkillCategory = {
  id: string;
  label: string;
  emoji: string;
  crew: string;
  skills: { name: string; emoji: string }[];
};

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    id: "sport",
    label: "Sport & movement",
    emoji: "🎾",
    crew: "Pack",
    skills: [
      { name: "Tennis", emoji: "🎾" },
      { name: "Padel", emoji: "🏓" },
      { name: "Running", emoji: "🏃" },
      { name: "Bouldering", emoji: "🧗" },
      { name: "Yoga", emoji: "🧘" },
      { name: "Five-a-side", emoji: "⚽" },
      { name: "Cycling", emoji: "🚴" },
      { name: "Wild Swimming", emoji: "🏊" },
      { name: "Skateboarding", emoji: "🛹" },
      { name: "Boxing", emoji: "🥊" },
    ],
  },
  {
    id: "games",
    label: "Games & brain stuff",
    emoji: "♟️",
    crew: "Club",
    skills: [
      { name: "Chess", emoji: "♟️" },
      { name: "Board Games", emoji: "🎲" },
      { name: "Poker", emoji: "🃏" },
      { name: "D&D", emoji: "🐉" },
      { name: "Pub Quiz", emoji: "🧠" },
      { name: "Mahjong", emoji: "🀄" },
      { name: "Video Games", emoji: "🎮" },
    ],
  },
  {
    id: "creative",
    label: "Make things",
    emoji: "🎨",
    crew: "Collective",
    skills: [
      { name: "Film Photography", emoji: "📷" },
      { name: "Life Drawing", emoji: "✏️" },
      { name: "Pottery", emoji: "🏺" },
      { name: "Fashion Design", emoji: "🧵" },
      { name: "Knitting", emoji: "🧶" },
      { name: "Improv", emoji: "🎭" },
      { name: "Zine Making", emoji: "📰" },
    ],
  },
  {
    id: "music",
    label: "Music & nights out",
    emoji: "🎧",
    crew: "Crew",
    skills: [
      { name: "DJing", emoji: "🎧" },
      { name: "Vinyl Digging", emoji: "💿" },
      { name: "Karaoke", emoji: "🎤" },
      { name: "Live Gigs", emoji: "🎸" },
      { name: "Salsa", emoji: "💃" },
      { name: "Choir", emoji: "🎶" },
    ],
  },
  {
    id: "food",
    label: "Food & drink",
    emoji: "🍜",
    crew: "Supper Club",
    skills: [
      { name: "Supper Clubs", emoji: "🍝" },
      { name: "Coffee Crawls", emoji: "☕" },
      { name: "Natural Wine", emoji: "🍷" },
      { name: "Baking", emoji: "🥐" },
      { name: "Ramen Hunting", emoji: "🍜" },
      { name: "Street Food", emoji: "🌮" },
    ],
  },
  {
    id: "explore",
    label: "Explore London",
    emoji: "🌿",
    crew: "Squad",
    skills: [
      { name: "Hiking", emoji: "🥾" },
      { name: "Gardening", emoji: "🌱" },
      { name: "Thrifting", emoji: "🛍️" },
      { name: "Museum Hopping", emoji: "🏛️" },
      { name: "Book Club", emoji: "📚" },
      { name: "Volunteering", emoji: "🤝" },
    ],
  },
];

export const MAX_SKILLS = 8;
export const MIN_SKILLS = 3;

const ALL_SKILLS = SKILL_CATEGORIES.flatMap((c) =>
  c.skills.map((s) => ({ ...s, category: c })),
);

export function normalizeSkill(raw: string): string {
  const clean = raw.trim().replace(/\s+/g, " ");
  const known = ALL_SKILLS.find(
    (s) => s.name.toLowerCase() === clean.toLowerCase(),
  );
  if (known) return known.name;
  return clean
    .split(" ")
    .map((w) => (w.length > 2 ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

export function skillMeta(name: string) {
  const known = ALL_SKILLS.find(
    (s) => s.name.toLowerCase() === name.toLowerCase(),
  );
  return {
    emoji: known?.emoji ?? "✨",
    crew: known?.category.crew ?? "Tribe",
    category: known?.category.id ?? "custom",
  };
}

// Octopus tribes are about hanging out, not job titles.
const WORK_WORDS = [
  "dev",
  "developer",
  "engineer",
  "engineering",
  "coding",
  "programming",
  "javascript",
  "typescript",
  "python",
  "react",
  "frontend",
  "backend",
  "full stack",
  "fullstack",
  "marketing",
  "sales",
  "product manager",
  "product management",
  "networking",
  "linkedin",
  "startup",
  "startups",
  "founder",
  "investing",
  "finance",
  "accounting",
  "consulting",
  "seo",
  "saas",
  "b2b",
  "excel",
  "data science",
  "recruiting",
  "growth hacking",
  "crypto",
  "ux",
  "ui",
  "devops",
  "ai",
  "ml",
];

export function validateSkill(raw: string): string | null {
  const s = raw.trim().toLowerCase();
  if (s.length < 2) return "Give it a few more letters.";
  if (s.length > 28) return "Keep it short and snappy (28 chars max).";
  const words = s.split(/[^a-z&+]+/).filter(Boolean);
  const hit = WORK_WORDS.find((w) =>
    w.includes(" ") ? s.includes(w) : words.includes(w),
  );
  if (hit)
    return "That sounds like a job, not a hangout. Try something you'd do with mates on a Saturday.";
  return null;
}
