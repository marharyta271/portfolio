# Marharyta Dolha — portfolio site

A plain static site: three HTML pages, one small JavaScript file and the images and videos. There's no build step, no framework and no dependencies, so it can go on any static host as-is.

```
index.html        Home (intro, projects, contact)
arrivee.html      Arrivée case study
mealcraft.html    MealCraft case study
js/site.js        Header clock, carousels, tabs, video play/pause (vanilla JS)
assets/           65 images and videos (~14 MB in total, the largest video is ~1.7 MB)
```

## Preview locally

```bash
cd site
python3 -m http.server 8000
# open http://localhost:8000
```

Opening `index.html` straight from disk works too, but a local server is closer to the real thing.

## Deploy (pick one)

- **Netlify:** drag the `site` folder onto https://app.netlify.com/drop
- **Cloudflare Pages / Vercel:** new project, upload the folder or connect a repo; build command none, output directory `/` (or `site`)
- **GitHub Pages:** push the contents of `site` to a repo, then Settings → Pages → deploy from the branch root

A custom domain can be attached on any of these.

## Notes

- **Fonts** load from Google Fonts: Inter, JetBrains Mono, Source Serif 4 and Instrument Serif.
- **Styling** is inline on purpose. The pages were exported from Marharyta's design canvas, so each page matches her design 1:1 on desktop. A short `<style>` block in each page's `<head>` stacks the columns on small screens. It's a stopgap until she designs the phone layout.
- **Videos** are H.264 MP4s, muted and looping, and only play while they're on screen. With "reduce motion" switched on they don't autoplay and the carousels don't auto-advance.
- **Links between pages** are relative (`index.html`, `arrivee.html`, `mealcraft.html`), so the site works from a sub-folder too.
- **Not on the site yet:** the CV download, and separate About and Contact pages. Both are currently sections on the Home page (`#about-me`, `#contact`).
- **Updating:** the site doesn't sync with the design canvas. When she changes a page in the canvas, it needs a fresh export.
