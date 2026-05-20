import { useEffect, useState } from "react";
import type { FsNode } from "./fs";

type LinkNode = Extract<FsNode, { kind: "link" }>;

const HOME_LINKS: LinkNode[] = [
  { kind: "link", name: "LogOS", url: "https://bylogos.io", screenshot: "/logos-page.png" },
  { kind: "link", name: "Indies", url: "https://indies.la", screenshot: "/indies.la.png" },
  { kind: "link", name: "CV", url: "https://vargastorres.cv", screenshot: "/iconcv.png" },
];

export function BrowserView({
  url,
  link,
  onNavigate,
}: {
  url: string;
  link?: LinkNode | null;
  onNavigate: (url: string, link?: LinkNode) => void;
}) {
  const [input, setInput] = useState(url);
  useEffect(() => setInput(url), [url]);

  return (
    <>
      <div className="urlbar">
        <span className="urlbar-btn">◀</span>
        <span className="urlbar-btn">▶</span>
        <span className="urlbar-btn">⟳</span>
        <input
          className="urlbar-input urlbar-input-editable"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter") onNavigate(input);
          }}
        />
      </div>
      <div className="window-body browser-body">
        {link ? <LinkPage link={link} /> : <HomePage onPick={l => onNavigate(l.url, l)} />}
      </div>
    </>
  );
}

function HomePage({ onPick }: { onPick: (l: LinkNode) => void }) {
  return (
    <div className="bw-home">
      <div className="bw-home-title">cv.local — start</div>
      <div className="bw-tile-grid">
        {HOME_LINKS.map(l => (
          <div className="bw-tile" key={l.name} onClick={() => onPick(l)}>
            <Preview link={l} />
            <div className="bw-tile-label">
              <span>{l.name}</span>
              <span className="bw-tile-url">{l.url}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LinkPage({ link }: { link: LinkNode }) {
  const open = () => window.open(link.url, "_blank", "noopener,noreferrer");
  return (
    <div className="bw-screen" onClick={open} title={`open ${link.url}`}>
      <Preview link={link} fill />
    </div>
  );
}

function Preview({ link, fill = false }: { link: LinkNode; fill?: boolean }) {
  if (link.screenshot) {
    return (
      <img
        className={fill ? "bw-screen-img" : "bw-tile-img"}
        src={link.screenshot}
        alt={link.name}
        draggable={false}
      />
    );
  }
  if (link.logoAscii) {
    return (
      <pre className={fill ? "bw-fallback-ascii bw-fallback-ascii-big" : "bw-fallback-ascii"}>
        {link.logoAscii}
      </pre>
    );
  }
  if (link.logoSlug) {
    return (
      <img
        className={fill ? "bw-fallback-logo bw-fallback-logo-big" : "bw-fallback-logo"}
        src={`https://cdn.simpleicons.org/${link.logoSlug}`}
        alt={link.name}
        draggable={false}
      />
    );
  }
  return (
    <div className={fill ? "bw-fallback-text bw-fallback-text-big" : "bw-fallback-text"}>
      {link.logoText ?? link.name}
    </div>
  );
}
