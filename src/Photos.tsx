import { useCallback, useEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
import { fetchManifest, isVideo, lg, mp4, sm, type Item as Photo } from "./gallery";

/** Depth of the fade at each edge, as a share of the visible area. */
const FADE_BAND = 0.3;

/**
 * Scroll-linked fade: tiles melt out of the black page as they scroll in from
 * either edge and back into it as they leave, in both directions. One
 * rAF-throttled pass per scroll frame.
 */
function useScrollFade(ref: RefObject<HTMLDivElement | null>, count: number) {
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const bar = root.querySelector<HTMLElement>(".ph-bar");
    let frame = 0;

    const update = () => {
      frame = 0;
      const box = root.getBoundingClientRect();
      const top = box.top + (bar?.offsetHeight ?? 0);
      const bottom = box.bottom;
      const band = (bottom - top) * FADE_BAND;
      root.querySelectorAll<HTMLElement>(".ph-tile").forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.bottom < top - band || r.top > bottom + band) return;
        // How far the tile has made it into view past its entering edge:
        // coming up from below it's its top edge, leaving at the top its
        // bottom edge. Fully visible once that edge is a band deep.
        const t = Math.min(1, Math.max(0, Math.min(r.bottom - top, bottom - r.top) / band));
        // smoothstep: soft at both ends of the band
        el.style.opacity = String(t * t * (3 - 2 * t));
      });
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    root.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      root.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [ref, count]);
}

/** Fresh random order on every visit (Fisher–Yates). */
function shuffle<T>(xs: T[]): T[] {
  const a = xs.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function Photos() {
  const [items, setItems] = useState<Photo[]>([]);
  const [open, setOpen] = useState<string | null>(() => location.hash.slice(1) || null);

  useEffect(() => {
    fetchManifest().then(items => setItems(shuffle(items)));
  }, []);

  useEffect(() => {
    document.title = "javier vargas — photos";
  }, []);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  useScrollFade(scrollRef, items.length);

  const show = useCallback((id: string | null) => {
    setOpen(id);
    history.replaceState(null, "", id ? `#${id}` : location.pathname);
  }, []);

  const idx = open ? items.findIndex(p => p.id === open) : -1;
  const current = idx >= 0 ? items[idx] : undefined;

  return (
    <>
      <div className="photos" ref={scrollRef}>
        <header className="ph-bar">
          <a className="ph-bar-item" href="/">◀ cv</a>
          <span className="ph-bar-path">~/photos</span>
          <a className="ph-bar-item" href="https://instagram.com/jdavidv7" target="_blank" rel="noreferrer">
            @jdavidv7
          </a>
        </header>

        <main className="ph-grid">
          {items.map(p => (
            <Tile key={p.id} p={p} active={!current} onOpen={() => show(p.id)} />
          ))}
        </main>
      </div>

      {current && (
        <Viewer
          p={current}
          total={items.length}
          neighbors={[items[idx - 1], items[idx + 1]]}
          onClose={() => show(null)}
          onStep={d => {
            const next = items[(idx + d + items.length) % items.length];
            if (next) show(next.id);
          }}
        />
      )}
    </>
  );
}

/**
 * Each tile only mounts its media while within about one screen of the
 * visible area, fades in when it actually scrolls into view and fades out
 * as it leaves. Videos loop muted while on screen.
 */
function Tile({ p, active, onOpen }: { p: Photo; active: boolean; onOpen: () => void }) {
  const [near, setNear] = useState(false);
  const [seen, setSeen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [playing, setPlaying] = useState(false);
  const tileRef = useRef<HTMLButtonElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const r = p.w / p.h;

  useEffect(() => {
    const el = tileRef.current;
    // The gallery scrolls inside .photos, not the window.
    const root = el?.closest(".photos") ?? null;
    if (!el) return;
    const nearIo = new IntersectionObserver(([e]) => e && setNear(e.isIntersecting), {
      root,
      rootMargin: "100% 0px",
    });
    const seenIo = new IntersectionObserver(([e]) => e && setSeen(e.isIntersecting), {
      root,
      threshold: 0.1,
    });
    nearIo.observe(el);
    seenIo.observe(el);
    return () => {
      nearIo.disconnect();
      seenIo.disconnect();
    };
  }, []);

  // Media unmounts when far away; start fresh when it comes back.
  useEffect(() => {
    if (!near) {
      setLoaded(false);
      setPlaying(false);
    }
  }, [near]);

  // Play only while on screen, and never behind the full-screen viewer.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (seen && active) v.play().catch(() => {});
    else v.pause();
  }, [seen, active, near]);

  return (
    <button
      ref={tileRef}
      className={`ph-tile ${seen ? "ph-seen" : ""}`}
      style={{ "--r": r } as CSSProperties}
      onClick={onOpen}
      aria-label={`open ${isVideo(p) ? "video" : "photo"} ${p.title}`}
    >
      <i style={{ paddingBottom: `${100 / r}%` }} />
      <span className="ph-tile-bg" style={{ background: p.color }} />
      {near && (
        <img
          src={sm(p)}
          alt={p.title}
          width={p.w}
          height={p.h}
          decoding="async"
          draggable={false}
          className={loaded ? "ph-in" : ""}
          onLoad={() => setLoaded(true)}
        />
      )}
      {near && isVideo(p) && (
        <video
          ref={videoRef}
          className={`ph-tile-video ${playing ? "ph-in" : ""}`}
          src={mp4(p)}
          muted
          loop
          playsInline
          disablePictureInPicture
          preload="auto"
          onPlaying={() => setPlaying(true)}
        />
      )}
      {isVideo(p) && !playing && <span className="ph-badge" aria-hidden="true">▶</span>}
    </button>
  );
}

function Viewer({
  p,
  total,
  neighbors,
  onClose,
  onStep,
}: {
  p: Photo;
  total: number;
  neighbors: (Photo | undefined)[];
  onClose: () => void;
  onStep: (d: 1 | -1) => void;
}) {
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const swipe = useRef<{ x: number; moved: boolean } | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => setLoaded(false), [p.id]);
  useEffect(() => closeRef.current?.focus(), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") onStep(1);
      else if (e.key === "ArrowLeft") onStep(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onStep]);

  // Warm the cache for prev/next.
  useEffect(() => {
    neighbors.forEach(q => {
      if (q) new Image().src = lg(q);
    });
  }, [p.id]);

  return (
    <div className="ph-viewer" role="dialog" aria-modal="true" aria-label={p.title}>
      <div
        className="ph-stage"
        onClick={e => {
          if (swipe.current?.moved) return;
          if (e.target === e.currentTarget) onClose();
        }}
        onPointerDown={e => (swipe.current = { x: e.clientX, moved: false })}
        onPointerUp={e => {
          if (!swipe.current) return;
          const dx = e.clientX - swipe.current.x;
          swipe.current.moved = Math.abs(dx) > 50;
          if (swipe.current.moved) onStep(dx < 0 ? 1 : -1);
        }}
      >
        {isVideo(p) ? (
          <video
            key={p.id}
            className="ph-full ph-in"
            src={mp4(p)}
            poster={lg(p)}
            // Silent, like the grid: no audio, no controls; click to pause.
            muted
            loop
            autoPlay
            playsInline
            disablePictureInPicture
            preload="auto"
            aria-label={p.title}
            onClick={e => {
              if (swipe.current?.moved) return;
              const v = e.currentTarget;
              if (v.paused) v.play().catch(() => {});
              else v.pause();
            }}
            style={{ aspectRatio: `${p.w} / ${p.h}`, background: p.color }}
          />
        ) : (
          <img
            key={p.id}
            className={`ph-full ${loaded ? "ph-in" : ""}`}
            src={lg(p)}
            alt={p.title}
            draggable={false}
            onLoad={() => setLoaded(true)}
            style={{ aspectRatio: `${p.w} / ${p.h}`, background: p.color }}
          />
        )}
        {total > 1 && (
          <>
            <button className="ph-nav ph-nav-prev" onClick={() => onStep(-1)} aria-label="previous">◀</button>
            <button className="ph-nav ph-nav-next" onClick={() => onStep(1)} aria-label="next">▶</button>
          </>
        )}
        <button ref={closeRef} className="ph-close wc wc-close" onClick={onClose} aria-label="close">x</button>
      </div>
    </div>
  );
}
