import type { DB, Member, Message, Tribe } from "./types";

const img = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=256&h=256&fit=crop&crop=faces&auto=format&q=80`;

const W = [
  "1494790108377-be9c29b29330",
  "1438761681033-6461ffad8d80",
  "1534528741775-53994a69daeb",
  "1544005313-94ddf0286df2",
  "1517841905240-472988babdf9",
  "1524504388940-b1c1722653e1",
  "1488426862026-3ee34a7d66df",
  "1531123897727-8f129e1688ce",
  "1529626455594-4ff0802cfb7e",
  "1508214751196-bcfd4ca60f91",
  "1580489944761-15a19d654956",
  "1567532939604-b6b5b0db2604",
  "1499952127939-9bbf5af6c51c",
  "1526510747491-58f928ec870f",
  "1485893086445-ed75865251e0",
  "1554151228-14d9def656e4",
  "1546961329-78bef0414d7c",
].map(img);

const M = [
  "1507003211169-0a1dd7228f2d",
  "1500648767791-00dcc994a43e",
  "1506794778202-cad84cf45f1d",
  "1539571696357-5a69c17a67c6",
  "1504257432389-52343af06ae3",
  "1492562080023-ab3db95bfbce",
  "1531427186611-ecfd6d936c79",
  "1522075469751-3a6694fb2f61",
  "1519085360753-af0119f7cbe7",
  "1502823403499-6ccfcf4fb453",
  "1472099645785-5658abf4ff4e",
  "1463453091185-61582044d556",
  "1527980965255-d3b416303d12",
  "1544723795-3fb6469f5b39",
  "1535713875002-d1d0cf377fde",
  "1599566150163-29194dcaad36",
  "1570295999919-56ceb5ecca61",
  "1552058544-f2b08422138a",
  "1489424731084-a5d8b219a5bb",
].map(img);

type Row = [
  id: string,
  name: string,
  area: string,
  age: number,
  avatar: string,
  skills: string[],
  invitedBy?: string,
];

const JOINED: Row[] = [
  ["amara", "Amara Okafor", "Hackney", 27, W[0], ["Padel", "Supper Clubs", "Salsa", "Natural Wine", "Running", "Karaoke", "Thrifting", "Yoga"]],
  ["leo", "Leo Hartley", "Shoreditch", 29, M[0], ["Padel", "Chess", "Cycling", "Coffee Crawls", "Live Gigs"], "amara"],
  ["priya", "Priya Shah", "Islington", 26, W[1], ["Padel", "Supper Clubs", "Book Club", "Baking", "Yoga", "Museum Hopping"], "amara"],
  ["tom", "Tom Bennett", "Clapham", 31, M[1], ["Padel", "Five-a-side", "Pub Quiz", "Cycling"]],
  ["zainab", "Zainab Ali", "Walthamstow", 24, W[2], ["Padel", "Boxing", "Street Food", "Karaoke", "Thrifting"], "amara"],
  ["kwame", "Kwame Mensah", "Peckham", 28, M[2], ["Padel", "DJing", "Five-a-side", "Vinyl Digging"], "tom"],
  ["isla", "Isla Murphy", "Camden", 25, W[3], ["Padel", "Wild Swimming", "Live Gigs", "Hiking"]],
  ["rohan", "Rohan Mehta", "King's Cross", 30, M[3], ["Padel", "Poker", "Ramen Hunting", "Cycling"], "leo"],
  ["chloe", "Chloe Dubois", "Notting Hill", 27, W[4], ["Padel", "Natural Wine", "Pottery", "Yoga"], "priya"],
  ["jamal", "Jamal Reid", "Brixton", 26, M[4], ["Padel", "Skateboarding", "DJing", "Street Food"], "kwame"],
  ["oliver", "Oliver Quinn", "Peckham", 33, M[5], ["Chess", "Board Games", "Coffee Crawls", "Book Club"]],
  ["hana", "Hana Kim", "Bermondsey", 25, W[5], ["Chess", "Mahjong", "Ramen Hunting", "Film Photography"], "oliver"],
  ["yusuf", "Yusuf Demir", "Stoke Newington", 28, M[6], ["Chess", "Poker", "Boxing", "Street Food"]],
  ["sofia", "Sofia Rossi", "Dalston", 29, W[6], ["Chess", "D&D", "Natural Wine", "Improv"], "hana"],
  ["freya", "Freya Lindqvist", "Hackney", 30, W[7], ["Supper Clubs", "Baking", "Gardening", "Wild Swimming"]],
  ["ethan", "Ethan Clarke", "Greenwich", 32, M[7], ["Supper Clubs", "Natural Wine", "Running", "Hiking"], "freya"],
  ["aisha", "Aisha Rahman", "Bethnal Green", 26, W[8], ["Supper Clubs", "Street Food", "Thrifting", "Zine Making"], "freya"],
  ["noah", "Noah Adeyemi", "Deptford", 27, M[8], ["Supper Clubs", "Vinyl Digging", "Live Gigs", "Coffee Crawls"]],
  ["ruby", "Ruby Chen", "Kentish Town", 24, W[9], ["Supper Clubs", "Film Photography", "Museum Hopping", "Knitting"], "aisha"],
  ["finn", "Finn O'Connor", "Hampstead", 28, M[9], ["Film Photography", "Hiking", "Cycling", "Live Gigs"]],
  ["maya", "Maya Patel", "Shoreditch", 23, W[10], ["Film Photography", "Thrifting", "Fashion Design", "Karaoke"], "finn"],
  ["theo", "Theo Williams", "Camden", 29, M[10], ["Film Photography", "Skateboarding", "Zine Making", "Vinyl Digging"]],
  ["marcus", "Marcus Lewis", "Brixton", 30, M[11], ["Bouldering", "Salsa", "Running", "Coffee Crawls"]],
  ["lily", "Lily Evans", "Clapham", 25, W[11], ["Bouldering", "Pottery", "Salsa", "Baking"]],
  ["kai", "Kai Nakamura", "Bermondsey", 27, M[12], ["Bouldering", "DJing", "Ramen Hunting", "Video Games"]],
  ["grace", "Grace Thompson", "Islington", 28, W[12], ["Salsa", "Book Club", "Bouldering", "Choir"]],
  ["daniel", "Daniel Osei", "Walthamstow", 31, M[13], ["Running", "Five-a-side", "DJing", "Pub Quiz"]],
  ["poppy", "Poppy Walsh", "Stoke Newington", 24, W[13], ["Pottery", "Natural Wine", "Running", "Life Drawing"]],
  ["arjun", "Arjun Kapoor", "Dalston", 26, M[14], ["DJing", "Vinyl Digging", "Running", "Video Games"]],
  ["nia", "Nia Campbell", "Peckham", 27, W[14], ["Pottery", "Life Drawing", "Karaoke", "Gardening"]],
];

const INVITED: [string, string, string, string][] = [
  ["demo-jess", "Jess Morgan", "jess.morgan@gmail.com", W[15]],
  ["sam", "Sam Ito", "sam.ito@icloud.com", M[15]],
  ["ben", "Ben Carter", "ben.carter@outlook.com", M[16]],
  ["elif", "Elif Yilmaz", "elif.y@gmail.com", W[16]],
  ["harry", "Harry Dawson", "harry.dawson@hey.com", M[17]],
  ["olu", "Olu Bakare", "olu.bakare@gmail.com", M[18]],
];

const DAY = 86_400_000;

function emailFor(name: string, i: number) {
  const domains = ["gmail.com", "icloud.com", "outlook.com", "hey.com", "proton.me"];
  const slug = name.toLowerCase().replace(/[^a-z ]/g, "").replace(" ", ".");
  return `${slug}@${domains[i % domains.length]}`;
}

type TribeSeed = {
  id: string;
  name: string;
  skill: string;
  emoji: string;
  tagline: string;
  color: string;
  members: string[];
  chat: [string, string][];
};

const TRIBES: TribeSeed[] = [
  {
    id: "padel-pack",
    name: "Hackney Padel Pack",
    skill: "Padel",
    emoji: "🏓",
    tagline: "Thursday doubles at Padium, pints after. All levels, zero ego.",
    color: "#f472b6",
    members: ["amara", "leo", "priya", "tom", "zainab", "kwame", "isla", "rohan", "chloe", "jamal"],
    chat: [
      ["leo", "Morning padel people 🎾 who else is still sore from Sunday?"],
      ["amara", "Courts booked for Thursday 7pm at Padium Canary Wharf, 2 slots left!"],
      ["jamal", "I'm in. Bringing my mate Kwame's spare racket for whoever needs one"],
      ["isla", "Can someone teach me the glass wall thing without me eating the glass"],
      ["tom", "Rule one: let it bounce. Rule two: pints at The Gun after"],
      ["priya", "Who's up for a Sunday social round + brunch at E5 Bakehouse?"],
    ],
  },
  {
    id: "chess-club",
    name: "Peckham Chess Club",
    skill: "Chess",
    emoji: "♟️",
    tagline: "Blitz, banter and Bussey Building rooftop games.",
    color: "#a78bfa",
    members: ["oliver", "hana", "yusuf", "leo", "sofia"],
    chat: [
      ["yusuf", "Rooftop blitz this Saturday? Bring a board if you have one"],
      ["oliver", "Bringing 3 boards to Frank's. Loser buys the next round 🍻"],
      ["hana", "I've been studying the London System, prepare yourselves"],
      ["sofia", "That's the most London thing I've ever heard"],
    ],
  },
  {
    id: "supper-club",
    name: "Sunday Supper Club",
    skill: "Supper Clubs",
    emoji: "🍝",
    tagline: "One host, one theme, six strangers turned regulars.",
    color: "#fbbf24",
    members: ["freya", "ethan", "aisha", "priya", "noah", "ruby", "amara"],
    chat: [
      ["aisha", "Hiii supper people! So happy this group exists"],
      ["freya", "Theme for the 3rd: Swedish fika gone wrong. My flat in London Fields, 7pm"],
      ["noah", "I'll bring records + a natty orange wine"],
      ["ruby", "I'll document it on film 📷"],
    ],
  },
  {
    id: "film-walkers",
    name: "Film Photo Walkers",
    skill: "Film Photography",
    emoji: "📷",
    tagline: "36 exposures, one route, monthly darkroom nights.",
    color: "#34d399",
    members: ["finn", "maya", "theo", "ruby", "hana"],
    chat: [
      ["finn", "Next walk: Regent's Canal from Camden Lock to Broadway Market?"],
      ["theo", "Portra 400 or bust"],
      ["maya", "I'm bringing my half-frame, double the shots double the fun"],
    ],
  },
];

export function seedPeople() {
  return JOINED.map(([id, name, area, , avatar]) => ({ id, name, area, avatar }));
}

export function buildSeed(): DB {
  const now = Date.now();
  const members: Member[] = JOINED.map(([id, name, area, age, avatar, skills, invitedBy], i) => ({
    id,
    name,
    email: emailFor(name, i),
    avatar,
    area,
    age,
    status: "joined",
    skills,
    tribeIds: [],
    invitedBy,
    online: i % 3 !== 2,
    createdAt: now - (40 - i) * DAY,
    joinedAt: now - (38 - i) * DAY,
  }));

  for (const [id, name, email, avatar] of INVITED) {
    members.push({
      id,
      name,
      email,
      avatar,
      area: "London",
      status: "invited",
      skills: [],
      tribeIds: [],
      online: false,
      createdAt: now - 2 * DAY,
    });
  }

  const tribes: Tribe[] = TRIBES.map((t, ti) => {
    const messages: Message[] = t.chat.map(([authorId, text], i) => ({
      id: `${t.id}-m${i}`,
      authorId,
      text,
      createdAt: now - (t.chat.length - i) * 47 * 60_000 - ti * DAY,
    }));
    for (const mid of t.members) {
      members.find((m) => m.id === mid)?.tribeIds.push(t.id);
    }
    return {
      id: t.id,
      name: t.name,
      skill: t.skill,
      emoji: t.emoji,
      tagline: t.tagline,
      color: t.color,
      memberIds: [...t.members],
      messages,
      createdAt: now - (20 - ti * 3) * DAY,
    };
  });

  return {
    community: { name: "Shoreditch Social", managerName: "Ava" },
    members,
    tribes,
  };
}
