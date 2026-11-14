# GRAVEBOUND
**Interactive 3D sanctuary for unfinished projects.**
Walk a Minecraft-style builder through a city where every abandoned project is a building under construction.
Inspect it, understand why it stalled, and decide whether to **restart, continue, change, repurpose or archive** it.

## Run
```
npm install
npm run dev        # development
npm run build      # production build (Vercel: root dir `app`, output `dist`, vercel.json included)
```

## Controls
WASD / arrows walk · Left-drag or Q/E turn · wheel zoom · F / Enter interact · on-screen pad on mobile.
The character has a walk cycle and an idle animation (breathing, looking around, blinking).

## First visit: welcome guide (6 languages)
A guide opens automatically the first time the site is visited: what GRAVEBOUND is, the controls and a quick start.
Switch between English, Español, Français, 日本語, हिन्दी and Deutsch (your choice is remembered). Reopen it any time with the **?** button in the top-right.

## Time of day
The clock (top-right) has four clearly different looks: **Morning** (peach sky, golden low sun), **Noon** (deep blue sky, bright overhead sun),
**Evening** (purple-orange sunset) and **Night** (stars, moon, lit windows and lamps). Pause it, or jump to the next time of day with the skip button.

## Architect sign-in
Right of the clock: **Sign in / Register pass**. Demo accounts live in your browser; passwords are never stored, only a salted SHA-256 hash.
The signed-in **Architect dossier** shows your streak, projects revived, towers rebuilt and skills, plus drag-and-drop *Exit Gate* (sign out) and *Demolition Matrix* (reset city to the demo state).

## Navigation bar (everything opens as a pop-up)
| Item | What it does |
|---|---|
| **My City** | Searchable / filterable archive of every project (cards or list) |
| **New Project** | Manual design with live stage preview, or import from a public GitHub repo |
| **Time Machine** | Temporal decay simulator (+1 month … +2 years); windows dim and moss grows in the world |
| **Activity** | Full project timeline + 26-week GitHub-style activity heatmap |
| **Rankings** | Revival leaderboard (all-time / this month) + "My project potential" |
| **Builders' Square** | Co-build hub: drag join requests into Accept / Decline slots, open your projects, apply to community projects |
| **City Deed** | Export / import JSON, load demo projects, demolish all |
| **Shop (coin button)** | Outfits, appearance, cosmetics, following pets and plaza structures. Everyone starts with 300 coins |

## Problem-statement features
Project archive · description & history · current status · reason for abandonment · what is done vs unfinished ·
revival paths (with a suggested path and starter steps) · project timeline · easy revisit (Revisit nudge, Rankings, Time Machine).

## The city
Each project is a plot. Its building follows progress: Junkyard (0-24%) → Foundation (25-49%) → Build (50-79%) → Final (80%+).
Neglect dims the windows and grows moss and vines. Landmarks in the plaza open the same pop-ups as the nav bar.
Eight demo projects are included (City Deed → Load demo projects).

## Coins
Start with 300. Earn: finish a task +5, found a project +10, resurrect a project +25, accept a co-builder +15.
"Refill test coins" in the Shop tops the balance up to 300 for testing.

## Data
Everything is stored in the browser (localStorage). Use City Deed to back up or move your city.

## Stack
React 19 · TypeScript · Vite · Framer Motion · CSS 3D transforms (no WebGL dependency).
