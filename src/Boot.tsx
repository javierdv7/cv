import { useCallback, useEffect, useRef, useState } from "react";
import { BOOT_LINES } from "./bootLines";
import { Logo } from "./Logo";
import { Desktop } from "./Desktop";

type Phase = "booting" | "cleared" | "logo" | "desktop";

export function Boot() {
  const [lines, setLines] = useState<string[]>([]);
  const [phase, setPhase] = useState<Phase>("booting");
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    let i = 0;
    const tick = () => {
      if (cancelled) return;
      if (i >= BOOT_LINES.length) {
        setTimeout(() => {
          if (cancelled) return;
          setPhase("cleared");
          setTimeout(() => !cancelled && setPhase("logo"), 700);
        }, 500);
        return;
      }
      const line = BOOT_LINES[i];
      i++;
      setLines(prev => [...prev, line]);
      const delay = line.startsWith("[ OK ]")
        ? 80 + Math.random() * 60
        : 15 + Math.random() * 45;
      setTimeout(tick, delay);
    };
    tick();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  const goDesktop = useCallback(() => setPhase("desktop"), []);

  if (phase === "desktop") return <Desktop />;
  if (phase === "logo") return <Logo onDone={goDesktop} />;
  if (phase === "cleared") return <div className="terminal" />;

  return (
    <div className="terminal" ref={scrollRef}>
      {lines.map((l, idx) => (
        <div key={idx} className={lineClass(l)}>
          {l || " "}
        </div>
      ))}
      <span className="cursor">▊</span>
    </div>
  );
}

function lineClass(line: string): string {
  if (line.startsWith("[ OK ]")) return "ok";
  if (line.startsWith("[")) return "kern";
  return "user";
}
