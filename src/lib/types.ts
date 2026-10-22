export type MemberStatus = "invited" | "joined";

export type MemorySource = "crm" | "self" | "tribe_invite";

/** What Grok Bot is asked to remember about one person. Skills and tribes stay on the member. */
export type MemberMemory = {
  discordName: string;
  chatSummary: string;
  source: MemorySource;
  lastActiveAt: number;
};

export type Member = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  area?: string;
  age?: number;
  status: MemberStatus;
  skills: string[];
  tribeIds: string[];
  invitedBy?: string;
  online?: boolean;
  createdAt: number;
  joinedAt?: number;
  memory?: MemberMemory;
};

export type Message = {
  id: string;
  authorId: string;
  /** "join" renders as a Discord-style system line instead of a chat bubble. */
  kind?: "join" | "grok";
  text: string;
  createdAt: number;
};

export type Tribe = {
  id: string;
  name: string;
  skill: string;
  emoji: string;
  tagline: string;
  color: string;
  memberIds: string[];
  messages: Message[];
  createdAt: number;
};

export type Community = {
  name: string;
  managerName: string;
};

export type DB = {
  community: Community;
  members: Member[];
  tribes: Tribe[];
};

export type MatchResult = {
  member: Member;
  tribe: Tribe | null;
  mates: (Member & { shared: string[] })[];
};
