import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from "react";

export function Marquee({ children, className }: { children: ReactNode; className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLSpanElement>(null);
  const [scroll, setScroll] = useState<{ dist: number; dur: number } | null>(null);

  useEffect(() => {
    const measure = () => {
      const c = containerRef.current;
      const e = contentRef.current;
      if (!c || !e) return;
      const cw = c.clientWidth;
      const ew = e.scrollWidth;
      if (ew > cw + 2) {
        const dist = ew - cw + 40;
        setScroll({ dist, dur: Math.max(6, dist / 30) });
      } else {
        setScroll(null);
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    if (contentRef.current) ro.observe(contentRef.current);
    return () => ro.disconnect();
  }, [children]);

  const style: CSSProperties | undefined = scroll
    ? ({
        ["--mq-dist" as string]: `-${scroll.dist}px`,
        ["--mq-dur" as string]: `${scroll.dur}s`,
      } as CSSProperties)
    : undefined;

  return (
    <div ref={containerRef} className={`marquee ${className ?? ""}`}>
      <span
        ref={contentRef}
        className={`marquee-inner ${scroll ? "marquee-anim" : ""}`}
        style={style}
      >
        {children}
      </span>
    </div>
  );
}
