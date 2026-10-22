# Octopus 🐙

Grow a community by crafting **mini tribes**: small groups of people who share real social skills and then invite their friends in. It's a flywheel for the whole tribe.

Built for a Grok hackathon. The Grok bots are **front-end demos backed by fake data**. There is no real LLM call.

## The flow

1. **CRM upload** (`/dashboard` → `#crm-members`): the community manager drops in a CSV or pastes emails. Each member gets a personal link.
2. **8 social skills form** (`/join/[memberId]`): members pick up to 8 social skills (Padel, Chess, Fashion Design, Supper Clubs…). Job titles like "Coding" or "LinkedIn networking" are rejected. The octopus lights up one arm per skill.
3. **Grok matches**: shared skills become a tribe. The member sees "Congrats! We found you +10 on your tribe!"
4. **Tribe space** (`/tribe/[tribeId]?me=[memberId]`): a Discord-style space where members chat (people only, no bot), see meetups and grow the tribe.
5. **Invite link** (`/invite/[tribeId]?ref=[memberId]`): friends join straight into the inviter's tribe.

### Grok bots (community manager only)

- **Grok Matchmaker** (`#matchmaker`): run a batch match and watch the tribes form.
- **Grok Mod** (`#mod-flags`): flags for spam, harassment, self-promo and flaky RSVPs, with Remove / Mute / Warn / Dismiss actions.
- **Grok Growth** (`#daily-growth`): a daily report with new members, invite rate, K-factor, a 14-day chart and the top tribes.

## Demo journey bar

Every page has a bar across the top with one tab per stage, plus Prev/Next buttons, so you can walk judges through the full story:

1. 📥 Upload CRM → `/dashboard?tab=crm`
2. 🐙 8 social skills → `/join/demo-jess`
3. 🧠 Grok matches → `/match` (replayable "+10" reveal, doesn't change any data)
4. 💬 Tribe space → `/tribe/padel-pack?me=amara`
5. 🌱 Invite new users → `/invite/padel-pack?ref=amara`
6. 🚩 Grok mod flags → `/dashboard?tab=mod-flags`
7. 📈 Daily growth → `/dashboard?tab=daily-growth`

## Try it

- `/join/demo-jess`: fill in the form as Jess and pick **Padel** to get "+10".
- `/dashboard`: use **✨ Use sample London list** to import 12 fake Londoners.
- Reset the demo data with the ↺ button at the bottom of the dashboard sidebar.

## Run locally

```bash
npm install
npm run dev   # http://localhost:4317
```

## Deploy to Netlify

Connect the repo in Netlify. It detects Next.js, and `netlify.toml` sets `npm run build` as the build command. On Netlify the demo data lives in memory, so it can reset when a function cold-starts. That's fine for a hackathon demo, and you can always use the ↺ reset button.

Stack: Next.js 16 (App Router), TypeScript, Tailwind v4 and shadcn/ui (Base UI). Data lives in memory and is saved to `.data/db.json`, seeded with fake London members. Portraits come from Unsplash.
