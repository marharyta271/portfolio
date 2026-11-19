# Marharyta Dolha — portfolio site

A plain static site: three HTML pages plus a 404 page, one stylesheet, one small JavaScript file and the images and videos. There's no build step, no framework and no dependencies. It's hosted on Vercel at https://marthamakes.com.

```
index.html          Home (intro + "More about me" panel, projects, contact list)
arrivee.html        Arrivée case study
mealcraft.html      MealCraft case study
404.html            "Page not found", shown by Vercel at any missing address (links start with /)
css/site.css        Hover/focus states, motion, About panel, phone/tablet layout
js/site.js          Clock, carousels, tabs, videos, About panel, fade-ins, copy email
assets/             Images and videos
assets/og/          Link preview images (1200×630) for LinkedIn, WhatsApp, etc.
favicon.*, icon-*, apple-touch-icon.png, site.webmanifest   Browser and app icons (mm. logo)
vercel.json         Clean URLs: marthamakes.com/arrivee and /mealcraft
sitemap.xml, robots.txt   For Google Search Console: the three pages to index
```

This code is now the master copy: the design canvas isn't re-exported any more.

## Preview locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Notes

- **Colours ("Paper"):** background `#F7F6F2`, text and lines `#1B1915`, body `#3A3732`, labels `#67635C`, thin lines `#DDD9D0`. Case study accents and card colours are unchanged.
- **Styling** is still mostly inline (exported from the design canvas). `css/site.css` adds what inline styles can't do. Rules that must beat an inline style use `!important`. Breakpoints: ≤1100px (small laptop/tablet), ≤760px (phone), ≤420px (small phone).
- **Fonts** load from Google Fonts: Inter, JetBrains Mono, Source Serif 4 and Instrument Serif.
- **Motion** (slides, fade-ins, smooth scrolling, page cross-fade, autoplaying videos and carousels) switches off when "reduce motion" is on.
- **Analytics:** Vercel Web Analytics, loaded by the two `/_vercel/insights` script lines in each page's `<head>`. Vercel only serves that script on deployed sites, so it shows a 404 when you preview locally. Visits appear in the project's Analytics tab on Vercel.
- **Links between pages** use `arrivee.html` etc. so the site also works locally; on Vercel those redirect to the clean URLs.
- **Not on the site yet:** the CV download.
