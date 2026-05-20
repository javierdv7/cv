# cv — javier vargas

CV rendered as a tiny desktop OS in the browser.

Boots like a Raspberry Pi (streaming `dmesg` + `systemd` log), shows the
CV ASCII logo + name, then fades into a draggable windowed desktop with
an Ubuntu-style dark top bar, left dock, app icons, file explorer,
markdown notepad, embedded browser, terminal, PDF preview, and pinned
Now-Playing + Currently-Playing-Game widgets.

Theme: black + `#e16e09`.

## stack

- **Runtime/bundler:** [Bun](https://bun.sh) 1.3+
- **UI:** React 19 + TypeScript
- **Server (dev):** Bun.serve with HMR
- **Deploy target:** Netlify (static)

## scripts

```bash
bun install             # deps
bun dev                 # dev server  → http://localhost:3000  (HMR)
bun run build           # static build → ./dist
bun run preview         # serve ./dist locally
bun start               # NODE_ENV=production server
```

`bun run build` bundles `src/index.html` with `bun build`, then copies
everything under `public/` into `dist/` so absolute paths like
`/cv.pdf`, `/iconcv.png`, `/skyward-sword.png`, etc. resolve at runtime.

## layout

```
src/
  index.html          entry HTML (favicon, viewport)
  index.ts            dev server + static routes
  frontend.tsx        React root + landscape orientation lock
  App.tsx             Boot → Logo → Desktop phases
  Boot.tsx            Streaming kernel log
  Logo.tsx            ASCII CV + "javier vargas"
  Desktop.tsx         Windowing system, dock, icon grid
  TopBar.tsx          Ubuntu-style top bar + clock
  Dock.tsx            Left-side app dock
  FileExplorer.tsx    Browsable folders with breadcrumbs
  BrowserView.tsx     URL bar + screenshot tiles + link page
  Markdown.tsx        Tiny markdown renderer (h1-3, ul, link, bold, code)
  Widgets.tsx         Pinned widget container
  NowPlaying.tsx      Shuffles a hardcoded Spotify playlist
  GameWidget.tsx      Hardcoded "currently playing" game card
  Marquee.tsx         Overflow-aware scrolling text
  tracks.ts           Hardcoded music list (from Spotify playlist)
  fs.ts               Virtual filesystem (about.md, contact.md, …)
  bootLines.ts        Fake dmesg log content
  icons.tsx           Inline SVG icon components
  index.css           All styles (theme + components + landscape rotate)
public/
  cv.pdf              Résumé (served at /cv.pdf)
  iconcv.png          Favicon + CV thumbnail
  wallpaper.png       Desktop wallpaper
  indies.la.png       Browser tile screenshot
  logos-page.png      Browser tile screenshot
  skyward-sword.png   Game widget cover
  _redirects          SPA fallback for Netlify
```

## content sources

- `about.md`, `contact.md`, `interests.md`, `skills.md` — derived from
  `public/cv.pdf`. Markdown is rendered in-app; links are clickable.
- Music playlist hardcoded in `src/tracks.ts`, sourced from
  `https://open.spotify.com/playlist/2H8XDLZ2YawlGYAdTWRmqe`.
- Currently-playing game is hardcoded in `src/GameWidget.tsx`.

## mobile

Looks identical to desktop. On phones the body is rotated 90° via CSS
so the layout always reads landscape regardless of how the device is
held. Drag uses pointer events and converts coordinates back into the
rotated frame so window dragging works on touch.

## deploy (Netlify)

1. Push to GitHub.
2. New site from Git → pick repo.
3. `netlify.toml` already sets:
   - `BUN_VERSION = 1.3.4`
   - build command: `bun install && bun run build`
   - publish dir: `dist`
   - headers for `/cv.pdf` (inline PDF)
   - SPA `/* → /index.html` redirect

No env vars required.

## license

Personal portfolio. All rights reserved.
