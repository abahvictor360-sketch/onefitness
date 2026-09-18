# onefitness

Marketing site for **onefitness** — tailored training programs, balanced meal guidance and live events.

Built as a zero-build static site: hand-written HTML, CSS and vanilla JS. No bundler, no dependencies.

## Structure

```
index.html            # home (hero, how it works, meals, programs, events, FAQ, CTA)
about.html            # /about  story, values, coaches, method
contact.html          # /contact  enquiry form, studio details, hours, visiting, FAQ
assets/css/styles.css # design tokens + all layout/responsive rules
assets/js/main.js     # nav drawer, scroll reveals, meal switcher, form validation
assets/img/           # photography
```

`cleanUrls` in `vercel.json` serves these at `/about` and `/contact`. Each page carries its own copy
of the header and footer, since the site has no build step to share partials; edit all three when the
navigation changes.

## Contact form

The form validates on the client (per-field messages, focus moved to the first problem) but has no
backend. `FORM_ENDPOINT` at the top of the contact-form block in `assets/js/main.js` is `null`, so a
valid submission only confirms locally and points the visitor at the mailto link. Set it to a real
endpoint (Vercel function, Formspree, or similar) and the same handler POSTs the fields as JSON.

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
