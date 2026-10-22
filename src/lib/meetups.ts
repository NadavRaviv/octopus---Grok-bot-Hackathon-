import { skillMeta } from "./skills";

const VENUES: Record<string, string[]> = {
  sport: ["Padium, Canary Wharf", "London Fields Courts", "Victoria Park", "The Castle Climbing Centre"],
  games: ["Draughts, Hackney", "Frank's Café rooftop, Peckham", "The Bell, Walthamstow", "Barbican library corner"],
  creative: ["Turning Earth, Hoxton", "Somerset House studios", "Morley College", "Regent's Canal towpath"],
  music: ["Spiritland, King's Cross", "Phonox, Brixton", "Rough Trade East", "The Jazz Café, Camden"],
  food: ["Maltby Street Market", "Broadway Market", "Borough Market", "Mare Street Market"],
  explore: ["Hampstead Heath", "Columbia Road Flower Market", "Tate Modern", "Walthamstow Wetlands"],
  custom: ["Victoria Park", "Spitalfields", "Brockwell Park", "Southbank"],
};

const FORMATS = ["Taster session", "Social round + pints", "Big monthly meetup", "Bring-a-friend night"];

export type Meetup = {
  id: string;
  title: string;
  venue: string;
  when: Date;
  going: number;
  bringAFriend: boolean;
};

export function meetupsFor(skill: string, memberCount: number): Meetup[] {
  const { category } = skillMeta(skill);
  const venues = VENUES[category] ?? VENUES.custom;
  const base = new Date();
  const offsets = [2, 5, 9];
  const hours = [19, 11, 18];
  return offsets.map((d, i) => {
    const when = new Date(base);
    when.setDate(base.getDate() + d);
    when.setHours(hours[i], 30, 0, 0);
    return {
      id: `${skill}-${i}`,
      title: `${skill} · ${FORMATS[(i + skill.length) % FORMATS.length]}`,
      venue: venues[(i + skill.length) % venues.length],
      when,
      going: Math.max(2, Math.round(memberCount * [0.6, 0.4, 0.8][i])),
      bringAFriend: i === 2,
    };
  });
}
