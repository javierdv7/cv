import { useEffect, useState } from "react";

const HOLD_MS = 2400;
const FADE_MS = 700;

const ASCII_CV = String.raw`
 ██████╗██╗   ██╗
██╔════╝██║   ██║
██║     ██║   ██║
██║     ╚██╗ ██╔╝
╚██████╗ ╚████╔╝
 ╚═════╝  ╚═══╝
`;

export function Logo({ onDone }: { onDone: () => void }) {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setFading(true), HOLD_MS);
    const t2 = setTimeout(onDone, HOLD_MS + FADE_MS);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onDone]);

  return (
    <div className={`logo ${fading ? "logo-fade-out" : ""}`}>
      <pre className="logo-ascii">{ASCII_CV}</pre>
      <div className="logo-name">javier vargas</div>
    </div>
  );
}
