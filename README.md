# Marharyta Dolha — portfolio site

A plain static site: three HTML pages, one stylesheet, one small JavaScript file and the images and videos. There's no build step, no framework and no dependencies. It's hosted on Vercel at https://marthamakes.com.

```
index.html          Home (intro + "More about me" panel, projects, contact list + form)
arrivee.html        Arrivée case study
mealcraft.html      MealCraft case study
css/site.css        Hover/focus states, motion, About panel, contact form, phone/tablet layout
js/site.js          Clock, carousels, tabs, videos, About panel, fade-ins, copy email, contact form
assets/             Images and videos
assets/og/          Link preview images (1200×630) for LinkedIn, WhatsApp, etc.
favicon.*, icon-*, apple-touch-icon.png, site.webmanifest   Browser and app icons (mm. logo)
vercel.json         Clean URLs: marthamakes.com/arrivee and /mealcraft
```

This code is now the master copy: the design canvas isn't re-exported any more.

## Preview locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Contact form (Formspree)

The form sends messages through Formspree. The endpoint is one constant at the very top of `js/site.js`:

```js
var FORMSPREE_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID';
```

1. Create a form at https://formspree.io that delivers to marharytadolha@gmail.com.
2. Paste its endpoint (looks like `https://formspree.io/f/abcdwxyz`) in place of the placeholder.
3. Commit and redeploy, then send yourself a test message from the live site.

Until the real endpoint is in, the form shows its error message, which includes the email address. If a test on the live site shows the error, check the form's settings in Formspree (for example reCAPTCHA, which can block messages sent this way).

## Notes

- **Colours ("Paper"):** background `#F7F6F2`, text and lines `#1B1915`, body `#3A3732`, labels `#67635C`, thin lines `#DDD9D0`. Case study accents and card colours are unchanged.
- **Styling** is still mostly inline (exported from the design canvas). `css/site.css` adds what inline styles can't do. Rules that must beat an inline style use `!important`. Breakpoints: ≤1100px (small laptop/tablet), ≤760px (phone), ≤420px (small phone).
- **Fonts** load from Google Fonts: Inter, JetBrains Mono, Source Serif 4 and Instrument Serif.
- **Motion** (slides, fade-ins, smooth scrolling, page cross-fade, autoplaying videos and carousels) switches off when "reduce motion" is on.
- **Links between pages** use `arrivee.html` etc. so the site also works locally; on Vercel those redirect to the clean URLs.
- **Not on the site yet:** the CV download.
