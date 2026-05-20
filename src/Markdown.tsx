import type { ReactNode } from "react";

const INLINE_RE =
  /(!\[([^\]]*)\]\(([^)]+)\)|\*\*([^*]+)\*\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\)|https?:\/\/[^\s)]+|[\w.+-]+@[\w.-]+\.[a-zA-Z]{2,})/g;

type Options = { onLink?: (url: string, label?: string) => void };

function makeLinkHandler(href: string, opts: Options): React.MouseEventHandler<HTMLAnchorElement> | undefined {
  if (!opts.onLink) return undefined;
  if (href.startsWith("mailto:") || href.startsWith("tel:")) return undefined;
  return e => {
    e.preventDefault();
    opts.onLink!(href);
  };
}

function inline(text: string, prefix = "x", opts: Options = {}): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  const re = new RegExp(INLINE_RE.source, "g");
  while ((m = re.exec(text))) {
    const off = m.index;
    if (off > last) out.push(text.slice(last, off));
    const key = `${prefix}-${off}`;
    if (m[2] != null && m[3] != null) {
      // image ![alt](src)
      out.push(<img key={key} className="md-img" src={m[3]} alt={m[2]} loading="lazy" />);
    } else if (m[4] != null) {
      out.push(<strong key={key}>{m[4]}</strong>);
    } else if (m[5] != null) {
      out.push(
        <code key={key} className="md-code">
          {m[5]}
        </code>,
      );
    } else if (m[6] != null && m[7] != null) {
      const href = m[7];
      out.push(
        <a key={key} href={href} target="_blank" rel="noreferrer noopener" onClick={makeLinkHandler(href, opts)}>
          {m[6]}
        </a>,
      );
    } else {
      const url = m[0];
      const isMail = url.includes("@") && !url.startsWith("http");
      const href = isMail ? `mailto:${url}` : url;
      out.push(
        <a key={key} href={href} target="_blank" rel="noreferrer noopener" onClick={makeLinkHandler(href, opts)}>
          {url}
        </a>,
      );
    }
    last = off + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function Markdown({ text, onLink }: { text: string; onLink?: (url: string, label?: string) => void }) {
  const opts: Options = { onLink };
  const lines = text.split("\n");
  const blocks: ReactNode[] = [];
  let listBuf: string[] = [];
  let k = 0;
  const flushList = () => {
    if (listBuf.length) {
      const items = listBuf.slice();
      blocks.push(
        <ul key={`ul-${k++}`} className="md-ul">
          {items.map((l, i) => (
            <li key={i}>{inline(l, `li-${k}-${i}`, opts)}</li>
          ))}
        </ul>,
      );
      listBuf = [];
    }
  };
  for (const line of lines) {
    if (line.startsWith("# ")) {
      flushList();
      blocks.push(
        <h1 key={k++} className="md-h1">
          {inline(line.slice(2), `h1-${k}`, opts)}
        </h1>,
      );
    } else if (line.startsWith("## ")) {
      flushList();
      blocks.push(
        <h2 key={k++} className="md-h2">
          {inline(line.slice(3), `h2-${k}`, opts)}
        </h2>,
      );
    } else if (line.startsWith("### ")) {
      flushList();
      blocks.push(
        <h3 key={k++} className="md-h3">
          {inline(line.slice(4), `h3-${k}`, opts)}
        </h3>,
      );
    } else if (line.startsWith("> ")) {
      flushList();
      blocks.push(
        <blockquote key={k++} className="md-bq">
          {inline(line.slice(2), `bq-${k}`, opts)}
        </blockquote>,
      );
    } else if (line.startsWith("---")) {
      flushList();
      blocks.push(<hr key={k++} className="md-hr" />);
    } else if (line.startsWith("- ")) {
      listBuf.push(line.slice(2));
    } else if (line.trim() === "") {
      flushList();
      blocks.push(<div key={k++} className="md-gap" />);
    } else {
      flushList();
      blocks.push(
        <p key={k++} className="md-p">
          {inline(line, `p-${k}`, opts)}
        </p>,
      );
    }
  }
  flushList();
  return <div className="md">{blocks}</div>;
}
