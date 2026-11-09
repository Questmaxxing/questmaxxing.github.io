# Questmax

Make a trip of it. A mobile-friendly trip planner, starting with Malawi.

Plain HTML, CSS and JavaScript. No build step, no framework, no server, no paid services.

## What's in here

| Path | What it does |
| --- | --- |
| `index.html` | The site. Open it or host it anywhere static. |
| `css/styles.css` | All styling, including dark mode and print. |
| `js/data/malawi.js` | The Malawi catalogue: places, activities, providers, prices, travel assumptions. |
| `js/planner.js` | Planning rules. Knows nothing about Malawi; reads everything from the data file. |
| `js/app.js` | Screens: home, planner, itinerary, explore, saved, how it works. |
| `js/config.js` | Where "Report a problem" goes. |
| `preview.html` | Copy of the page body used for the Claude artifact preview. Not needed for hosting. |

## Run it locally

```bash
python3 -m http.server 8765
```

Then open http://localhost:8765.

## Put it online for free

Any of these work. Pick one.

**GitHub Pages**
1. Create a public repo, push this folder.
2. Settings → Pages → Deploy from branch → `main` / root.
3. Live at `https://<you>.github.io/<repo>/`.

**Netlify Drop**: drag this folder onto https://app.netlify.com/drop.

**Cloudflare Pages**: connect the repo, no build command, output directory `/`.

Custom domain (e.g. questmax.app) costs a few dollars a year. Everything else is free.

## Get problem reports to you

Out of the box, reports are saved on the traveller's device and they can copy them.
To receive them:

- **Email**: set `reportEmail` in `js/config.js`.
- **Form inbox (free)**: create a form at https://formspree.io, paste its URL into `reportEndpoint`.

## Before you launch: check the data

Every listing in `js/data/malawi.js` starts as `status: "unverified"` with `lastChecked: null`.
The app shows these as "Not checked yet". When you confirm one (phone, email, official site):

```js
status: "checked", lastChecked: "2026-11-20",
source: { label: "Phone call with operator", note: "Confirmed prices for 2027" }
```

Priorities: park fees, lodge price bands, the Ilala ferry, provider websites, and anything flagged `needsCheck: true`.

## Add a country

1. Copy `js/data/malawi.js` to `js/data/<country>.js` and fill it in (same shape).
2. Add a `<script>` tag for it in `index.html`.
3. Remove it from `QM_COMING_SOON`.
4. The app currently opens Malawi directly (`const dest = DESTS.malawi` in `app.js`). Switching on a second country means wiring the destination picker in step 1 of the planner to that choice. The planner itself needs no changes.

## Later: AI help

The "Anything else?" box reads notes with simple keyword rules and shows what it picked up.
To use an AI model instead, put a small serverless function in front of it (Cloudflare Workers
and Netlify Functions both have free tiers) so the API key never reaches the browser, and keep
the AI to understanding preferences and explaining choices. The itinerary still comes from
`planner.js` and the checked data.
