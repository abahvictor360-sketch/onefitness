# onefitness

Marketing site for **onefitness** — tailored training programs, balanced meal guidance and live events.

Built as a zero-build static site: hand-written HTML, CSS and vanilla JS. No bundler, no dependencies.

## Structure

```
index.html            # single-page site (hero, how it works, meals, programs, events, FAQ, CTA)
assets/css/styles.css # design tokens + all layout/responsive rules
assets/js/main.js     # nav drawer, scroll reveals, meal switcher, form validation
assets/img/           # photography
```

## Run locally

```bash
python3 -m http.server 4173
# open http://localhost:4173
```

## Responsiveness

Fluid type and spacing via `clamp()`, with layout breakpoints at 1080px, 900px, 720px, 560px and 380px.
Verified from 320px phones through 1920px desktops. Honours `prefers-reduced-motion`.

## Deploy

Static output — deployed on Vercel with no build step.

`vercel.json` caches `/assets/img/*` as immutable for a year (replace an image by adding a new
filename, never by overwriting one) while `/assets/css/*` and `/assets/js/*` revalidate on every
request, so a style or script change reaches returning visitors immediately. The `?v=N` query on
the CSS and JS links exists to evict copies cached under the old immutable policy — bump it if a
release ever needs to force a refetch.
