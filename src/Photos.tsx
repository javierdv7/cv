import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { fetchManifest, isVideo, lg, mp4, sm, type Item as Photo } from "./gallery";

export function Photos() {
  const [items, setItems] = useState<Photo[]>([]);
  const [open, setOpen] = useState<string | null>(() => location.hash.slice(1) || null);

  useEffect(() => {
    fetchManifest().then(setItems);
  }, []);

  useEffect(() => {
    document.title = "javier vargas — photos";
  }, []);

  const show = useCallback((id: string | null) => {
    setOpen(id);
    history.replaceState(null, "", id ? `#${id}` : location.pathname);
  }, []);

  const idx = open ? items.findIndex(p => p.id === open) : -1;
  const current = idx >= 0 ? items[idx] : undefined;

  return (
    <>
      <div className="photos">
        <header className="ph-bar">
          <a className="ph-bar-item" href="/">◀ cv</a>
          <span className="ph-bar-path">~/photos</span>
          <a className="ph-bar-item" href="https://instagram.com/jdavidv7" target="_blank" rel="noreferrer">
            @jdavidv7
          </a>
        </header>

        <main className="ph-grid">
          {items.map(p => (
            <Tile key={p.id} p={p} onOpen={() => show(p.id)} />
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

function Tile({ p, onOpen }: { p: Photo; onOpen: () => void }) {
  const [loaded, setLoaded] = useState(false);
  // Videos preview on mouse hover only; the <video> isn't mounted until then.
  const [hover, setHover] = useState(false);
  const [playing, setPlaying] = useState(false);
  const r = p.w / p.h;
  return (
    <button
      className="ph-tile"
      style={{ "--r": r, background: p.color } as CSSProperties}
      onClick={onOpen}
      onPointerEnter={e => isVideo(p) && e.pointerType === "mouse" && setHover(true)}
      onPointerLeave={() => {
        setHover(false);
        setPlaying(false);
      }}
      aria-label={`open ${isVideo(p) ? "video" : "photo"} ${p.title}`}
    >
      <i style={{ paddingBottom: `${100 / r}%` }} />
      <img
        src={sm(p)}
        alt={p.title}
        width={p.w}
        height={p.h}
        loading="lazy"
        decoding="async"
        draggable={false}
        className={loaded ? "ph-in" : ""}
        onLoad={() => setLoaded(true)}
      />
      {hover && (
        <video
          className={`ph-tile-video ${playing ? "ph-in" : ""}`}
          src={mp4(p)}
          muted
          loop
          autoPlay
          playsInline
          onPlaying={() => setPlaying(true)}
        />
      )}
      {isVideo(p) && <span className="ph-badge" aria-hidden="true">▶</span>}
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
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const swipe = useRef<{ x: number; moved: boolean } | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => setLoaded(false), [p.id]);
  useEffect(() => closeRef.current?.focus(), []);

  // Try with sound (opening from a click allows it); if the browser blocks
  // autoplay — e.g. landing on a /photos#id link — fall back to muted.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.play().catch(() => {
      v.muted = true;
      v.play().catch(() => {});
    });
  }, [p.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // A focused <video> uses the arrows to seek.
      if (e.target instanceof HTMLVideoElement && e.key !== "Escape") return;
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
        onPointerDown={e => {
          // Don't treat scrubbing the video's control bar as a swipe.
          const t = e.target as HTMLElement;
          if (t instanceof HTMLVideoElement && e.clientY > t.getBoundingClientRect().bottom - 64) {
            swipe.current = null;
            return;
          }
          swipe.current = { x: e.clientX, moved: false };
        }}
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
            ref={videoRef}
            className="ph-full ph-in"
            src={mp4(p)}
            poster={lg(p)}
            controls
            playsInline
            preload="auto"
            aria-label={p.title}
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
