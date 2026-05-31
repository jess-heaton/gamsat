# GAMSAT Study Hub

A calm, focused GAMSAT prep web app for the **Irish Graduate Entry Medicine (GEM)** pathway — built from a Claude Design prototype into a real Next.js application.

It gives you a periodised 15-week study plan, section-by-section strategy, a reasoning-style practice engine with worked solutions, a GAMSAT-level vocab deck with spaced review, progress analytics — and a **Section II Essay Studio that marks your essays with Claude Opus** against the real ACER rater criteria.

## Features

- **Today** — daily dashboard: streak, level/XP, countdowns to both sittings, this week's tasks, a daily essay prompt and word of the day.
- **Study Plan** — a 15-week periodised plan (Foundations → Build → Essay Peak → Section II → Science Sprint) with key dates and check-off tasks.
- **Sections** — strategy and content for Section I (humanities), II (written communication) and III (science), with a confidence-tracked science checklist.
- **Essay Studio** — timed writing against real, attributed quote sets in the authentic GAMSAT format, a self-rubric, and **AI marking by Claude Opus**: an estimated band, scores on both rater criteria, strengths, improvements, and line-level suggestions.
- **Practice** — GAMSAT-style reasoning MCQs (chem / bio / physics / Section I) with worked solutions and accuracy tracking.
- **Vocab** — a flashcard deck with a study queue; "still learning" cards keep returning, "got it" retires them. Progress persists.
- **Progress** — activity heatmap, readiness gauges, accuracy by subject, science topic confidence, and badges.
- **Appearance** — switch accent, paper tone and heading serif; the choice persists.

All your progress is stored privately in your browser via `localStorage`.

## Tech

- **Next.js 14** (App Router) + **React 18**
- A single server route, `app/api/mark-essay/route.js`, calls the **Anthropic API** with `@anthropic-ai/sdk`. The API key lives server-side only and is never shipped to the browser.

## Running locally

```bash
npm install
cp .env.example .env.local      # then add your Anthropic key
npm run dev                      # http://localhost:3000
```

`.env.local`:

```
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-opus-4-8   # optional override
```

`.env.local` is gitignored — **secrets are never committed.**

## Deploying

Deploys cleanly to **Vercel**: import the repo, then set the `ANTHROPIC_API_KEY` environment variable in the project settings. Essay marking calls Claude from a serverless function, so the key stays private.

## Notes

- Practice questions and Section I passages are **original** reasoning-style content (not reproduced ACER material).
- Essay quote sets are **real, attributed quotations** grouped by theme, mirroring the genuine Section II format. You never have to quote, agree with, or even mention any quote — they exist to spark a response to the shared theme.
- The Claude Opus marking is an AI estimate to guide practice — not an official ACER score. Real essays are marked by three trained human raters.
