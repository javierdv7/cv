import { useEffect, useState } from "react";
import { MusicIcon } from "./icons";
import { Marquee } from "./Marquee";
import { TRACKS } from "./tracks";

function fmt(ms: number): string {
  const t = Math.floor(ms / 1000);
  const m = Math.floor(t / 60);
  const s = t % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function pickNext(prev: number): number {
  if (TRACKS.length <= 1) return 0;
  let n = prev;
  while (n === prev) n = Math.floor(Math.random() * TRACKS.length);
  return n;
}

export function NowPlaying() {
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * TRACKS.length));
  const [progress, setProgress] = useState(0);
  const [eq, setEq] = useState<number[]>([0.4, 0.6, 0.3, 0.7, 0.5]);

  useEffect(() => {
    const id = setInterval(() => {
      setProgress(p => {
        const dur = TRACKS[idx].durationMs;
        if (p + 1000 >= dur) {
          setIdx(pickNext);
          return 0;
        }
        return p + 1000;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [idx]);

  useEffect(() => {
    const id = setInterval(() => {
      setEq(prev => prev.map(() => 0.15 + Math.random() * 0.85));
    }, 180);
    return () => clearInterval(id);
  }, []);

  const track = TRACKS[idx];
  const pct = (progress / track.durationMs) * 100;

  return (
    <div className="widget">
      <div className="widget-header">
        <span>currently playing</span>
        <span className="widget-tag">MIX</span>
      </div>
      <div className="widget-body widget-music">
        <div className="ares-row">
          <MusicIcon size={20} />
          <div className="ares-meta">
            <Marquee className="ares-title">{track.title}</Marquee>
            <Marquee className="ares-artist">
              {track.artist}{track.album ? ` · ${track.album}` : ""}
            </Marquee>
          </div>
        </div>
        <div className="ares-eq">
          {eq.map((v, i) => (
            <span key={i} className="ares-bar" style={{ height: `${v * 100}%` }} />
          ))}
        </div>
        <div className="ares-progress">
          <span>{fmt(progress)}</span>
          <div className="ares-bar-track">
            <div className="ares-bar-fill" style={{ width: `${pct}%` }} />
          </div>
          <span>{fmt(track.durationMs)}</span>
        </div>
      </div>
    </div>
  );
}
