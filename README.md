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
- **Deploy target:** AWS Amplify (Hosting + Gen 2 backend)

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
  Photos.tsx          /photos gallery + viewer
  gallery.ts          Manifest type, CDN URLs, public fetch
  admin/              admin.vargastorres.cv: login, upload, delete
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

## photos

`vargastorres.cv/photos` is a bare photo + video gallery: top bar (back to
cv, instagram) and a justified-row grid, nothing else. Click opens a
full-screen viewer (←/→/esc, swipe); deep links via `/photos#<id>`.

Content is managed at **`admin.vargastorres.cv`** (same build; the app
switches on hostname, and Amplify only loads there). Sign in with Cognito,
drop photos/videos, delete with a two-step `x`.

```
browser (admin)                         AWS (amplify/)
  photo → canvas → webp 900/2400  ──►   S3 gallery/<id>-sm|lg|v
  video → WebCodecs → mp4 ≤1920         S3 gallery/manifest.json
  GPS/EXIF dropped by re-encoding       Cognito (group "admins")
                                        CloudFront → public reads
```

- Processing runs in the admin's browser (`src/admin/process.ts`,
  mediabunny for video): no servers, and originals never leave the machine.
- Only the `admins` group can write/delete in S3; the bucket is private and
  the public reads through CloudFront.
- The manifest is `no-cache`, so uploads and deletes show immediately.
  Media caches for a day, so a deleted file's direct URL can linger ≤24h.
- New admin: `scripts/aws-setup.sh admin someone@example.com`.
- Local dev against the real backend:
  `npx ampx generate outputs --app-id <id> --branch main`, then
  `bun dev` and open `http://localhost:3000/admin`. Without it a stub
  `amplify_outputs.json` is written and the gallery is just empty.

## mobile

Looks identical to desktop. On phones the body is rotated 90° via CSS
so the layout always reads landscape regardless of how the device is
held. Drag uses pointer events and converts coordinates back into the
rotated frame so window dragging works on touch.

## deploy (AWS Amplify)

Amplify Hosting builds `main` on every push (`amplify.yml`): the backend
phase deploys `amplify/` (Cognito, S3, CloudFront) with `ampx
pipeline-deploy`, then the frontend phase runs `bun run build`. Headers
live in `customHttp.yml`; the SPA rewrite and www → apex redirect are app
rules set by the setup script.

First-time setup, in order (`scripts/aws-setup.sh`):

1. `bootstrap` — CDK bootstrap for sa-east-1
2. `app` — service role, Amplify app (GitHub), `main` branch, first deploy
3. `admin` — admin login; Cognito emails a temporary password
4. `domain` — attaches `vargastorres.cv`, `www`, `admin` and prints the DNS
   records to add in Cloudflare (**DNS only**, grey cloud)

`netlify.toml` / `render.yaml` are from the previous hosts and can go once
the Render service is retired.

## license

Personal portfolio. All rights reserved.
