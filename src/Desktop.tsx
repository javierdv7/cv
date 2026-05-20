import { useRef, useState, type ReactNode, type PointerEvent as ReactPointerEvent } from "react";
import { TopBar } from "./TopBar";
import { Dock } from "./Dock";
import { Widgets } from "./Widgets";
import { FileExplorer } from "./FileExplorer";
import { BrowserView } from "./BrowserView";
import { findFile, type FsNode } from "./fs";
import { Markdown } from "./Markdown";
import {
  BrowserIcon,
  FolderIcon,
  NotepadIcon,
  PdfIcon,
  TerminalIcon,
} from "./icons";

type LinkNode = Extract<FsNode, { kind: "link" }>;
type FileNode = Extract<FsNode, { kind: "file" }>;

type WindowKind = "txt" | "browser" | "explorer" | "terminal" | "pdf";

type OpenWindow = {
  id: string;
  kind: WindowKind;
  title: string;
  instanceId: number;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  // payloads per kind
  text?: string;          // for txt
  explorerPath?: string[]; // for explorer
  browserUrl?: string;    // for browser
  browserLink?: LinkNode | null;
  pdfUrl?: string;        // for pdf
};

let nextInstance = 1;
let nextZ = 10;

function isRotated(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 900px) and (orientation: portrait)").matches
  );
}

function toLocal(cx: number, cy: number): { x: number; y: number } {
  if (!isRotated()) return { x: cx, y: cy };
  return { x: cy, y: window.innerWidth - cx };
}

function localBounds(): { w: number; h: number } {
  if (!isRotated()) return { w: window.innerWidth, h: window.innerHeight };
  return { w: window.innerHeight, h: window.innerWidth };
}

function defaultSize(kind: WindowKind): { w: number; h: number } {
  switch (kind) {
    case "txt": return { w: 460, h: 300 };
    case "explorer": return { w: 520, h: 360 };
    case "browser": return { w: 680, h: 460 };
    case "terminal": return { w: 520, h: 300 };
    case "pdf": return { w: 720, h: 560 };
  }
}

function cascadeXY(idx: number) {
  return { x: 180 + idx * 28, y: 80 + idx * 28 };
}

type AppEntry = {
  key: string;
  label: string;
  icon: ReactNode;
  open: () => void;
  activeId: string;
};

export function Desktop() {
  const [windows, setWindows] = useState<OpenWindow[]>([]);

  const focus = (instanceId: number) =>
    setWindows(prev =>
      prev.map(w => (w.instanceId === instanceId ? { ...w, z: nextZ++ } : w)),
    );
  const close = (instanceId: number) =>
    setWindows(prev => prev.filter(w => w.instanceId !== instanceId));
  const move = (instanceId: number, x: number, y: number) =>
    setWindows(prev =>
      prev.map(w => (w.instanceId === instanceId ? { ...w, x, y } : w)),
    );

  const upsert = (
    id: string,
    build: () => Omit<OpenWindow, "instanceId" | "x" | "y" | "z">,
    patch?: Partial<OpenWindow>,
  ) => {
    setWindows(prev => {
      const i = prev.findIndex(w => w.id === id);
      if (i >= 0) {
        const merged = { ...prev[i], ...patch, z: nextZ++ };
        const copy = prev.slice();
        copy[i] = merged;
        return copy;
      }
      const base = build();
      const { x, y } = cascadeXY(prev.length);
      const win: OpenWindow = {
        ...base,
        instanceId: nextInstance++,
        x,
        y,
        z: nextZ++,
      };
      return [...prev, win];
    });
  };

  // Openers
  const openFile = (f: FileNode) => {
    const size = defaultSize("txt");
    upsert(
      `file:${f.id}`,
      () => ({
        id: `file:${f.id}`,
        kind: "txt",
        title: `${f.name} — notepad`,
        text: f.content,
        ...size,
      }),
    );
  };

  const openFileById = (id: string) => {
    const f = findFile(id);
    if (f) openFile(f);
  };

  const openExplorer = (path: string[]) => {
    const size = defaultSize("explorer");
    const title = path.length === 0 ? "files — ~" : `files — /${path.join("/")}`;
    upsert(
      "explorer",
      () => ({
        id: "explorer",
        kind: "explorer",
        title,
        explorerPath: path,
        ...size,
      }),
      { explorerPath: path, title },
    );
  };

  const openBrowser = (url: string, link?: LinkNode | null) => {
    const size = defaultSize("browser");
    const title = link ? `${link.name} — browser` : "browser";
    upsert(
      "browser",
      () => ({
        id: "browser",
        kind: "browser",
        title,
        browserUrl: url,
        browserLink: link ?? null,
        ...size,
      }),
      { browserUrl: url, browserLink: link ?? null, title },
    );
  };

  const openNotepad = () => {
    const size = defaultSize("txt");
    upsert(
      "notepad",
      () => ({
        id: "notepad",
        kind: "txt",
        title: "untitled — notepad",
        text: "",
        ...size,
      }),
    );
  };

  const openPdf = (url: string, title: string) => {
    const size = defaultSize("pdf");
    upsert(
      `pdf:${url}`,
      () => ({
        id: `pdf:${url}`,
        kind: "pdf",
        title,
        pdfUrl: url,
        ...size,
      }),
    );
  };

  const openTerminal = () => {
    const size = defaultSize("terminal");
    upsert(
      "terminal",
      () => ({
        id: "terminal",
        kind: "terminal",
        title: "terminal",
        text: [
          "pi@raspberrypi:~ $ whoami",
          "javier",
          "pi@raspberrypi:~ $ uname -a",
          "Linux raspberrypi 6.1.21-v8+ aarch64 GNU/Linux",
          "pi@raspberrypi:~ $ _",
        ].join("\n"),
        ...size,
      }),
    );
  };

  const apps: AppEntry[] = [
    { key: "about", label: "about.md", icon: <NotepadIcon />, activeId: "file:about", open: () => openFileById("about") },
    { key: "contact", label: "contact.md", icon: <NotepadIcon />, activeId: "file:contact", open: () => openFileById("contact") },
    { key: "interests", label: "interests.md", icon: <NotepadIcon />, activeId: "file:interests", open: () => openFileById("interests") },
    { key: "studies", label: "studies.md", icon: <NotepadIcon />, activeId: "file:studies", open: () => openFileById("studies") },
    { key: "experiments", label: "experiments.md", icon: <NotepadIcon />, activeId: "file:experiments", open: () => openFileById("experiments") },
    { key: "projects", label: "projects.md", icon: <NotepadIcon />, activeId: "file:projects", open: () => openFileById("projects") },
    { key: "skills", label: "skills.md", icon: <NotepadIcon />, activeId: "file:skills", open: () => openFileById("skills") },
    { key: "cv", label: "cv.pdf", icon: <PdfIcon />, activeId: "pdf:/cv.pdf", open: () => openPdf("/cv.pdf", "cv.pdf — preview") },
    { key: "browser", label: "browser", icon: <BrowserIcon />, activeId: "browser", open: () => openBrowser("https://cv.local/") },
    { key: "terminal", label: "terminal", icon: <TerminalIcon />, activeId: "terminal", open: openTerminal },
  ];

  const dockApps: AppEntry[] = [
    { key: "files", label: "files", icon: <FolderIcon />, activeId: "explorer", open: () => openExplorer([]) },
    { key: "notepad", label: "notepad", icon: <NotepadIcon />, activeId: "notepad", open: openNotepad },
    { key: "browser", label: "browser", icon: <BrowserIcon />, activeId: "browser", open: () => openBrowser("https://cv.local/") },
    { key: "terminal", label: "terminal", icon: <TerminalIcon />, activeId: "terminal", open: openTerminal },
  ];

  const activeIds = new Set(windows.map(w => w.id));

  return (
    <div className="desktop">
      <TopBar />

      <Dock
        apps={dockApps.map(a => ({
          key: a.key,
          label: a.label,
          icon: a.icon,
          active: activeIds.has(a.activeId),
          onClick: a.open,
        }))}
      />

      <div className="desktop-icons">
        {apps.map(a => (
          <div className="dicon" key={a.key} onDoubleClick={a.open} onClick={a.open}>
            <div className="dicon-box">{a.icon}</div>
            <div className="dicon-label">{a.label}</div>
          </div>
        ))}
      </div>

      {windows.map(w => (
        <Window
          key={w.instanceId}
          w={w}
          onFocus={() => focus(w.instanceId)}
          onClose={() => close(w.instanceId)}
          onMove={(x, y) => move(w.instanceId, x, y)}
          openExplorer={openExplorer}
          openFile={openFile}
          openBrowser={openBrowser}
        />
      ))}

      <Widgets />
    </div>
  );
}

function Window({
  w,
  onFocus,
  onClose,
  onMove,
  openExplorer,
  openFile,
  openBrowser,
}: {
  w: OpenWindow;
  onFocus: () => void;
  onClose: () => void;
  onMove: (x: number, y: number) => void;
  openExplorer: (path: string[]) => void;
  openFile: (f: FileNode) => void;
  openBrowser: (url: string, link?: LinkNode | null) => void;
}) {
  const dragRef = useRef<{ dx: number; dy: number } | null>(null);

  const startDrag = (e: ReactPointerEvent) => {
    if ((e.target as HTMLElement).closest(".window-controls")) return;
    onFocus();
    const start = toLocal(e.clientX, e.clientY);
    dragRef.current = { dx: start.x - w.x, dy: start.y - w.y };
    const target = e.currentTarget;
    try { target.setPointerCapture(e.pointerId); } catch {}
    const move = (ev: PointerEvent) => {
      if (!dragRef.current) return;
      const p = toLocal(ev.clientX, ev.clientY);
      const nx = p.x - dragRef.current.dx;
      const ny = p.y - dragRef.current.dy;
      const b = localBounds();
      const maxX = b.w - 80;
      const maxY = b.h - 40;
      onMove(
        Math.min(maxX, Math.max(-w.w + 80, nx)),
        Math.min(maxY, Math.max(28, ny)),
      );
    };
    const up = () => {
      dragRef.current = null;
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerup", up);
      document.removeEventListener("pointercancel", up);
    };
    document.addEventListener("pointermove", move);
    document.addEventListener("pointerup", up);
    document.addEventListener("pointercancel", up);
    e.preventDefault();
  };

  return (
    <div
      className="window"
      style={{ top: w.y, left: w.x, width: w.w, height: w.h, zIndex: w.z }}
      onPointerDown={onFocus}
    >
      <div className="window-title" onPointerDown={startDrag}>
        <span>{w.title}</span>
        <span className="window-controls">
          <span className="wc wc-min">_</span>
          <span className="wc wc-max">□</span>
          <span onClick={onClose} className="wc wc-close">x</span>
        </span>
      </div>

      {w.kind === "browser" && (
        <BrowserView
          url={w.browserUrl ?? ""}
          link={w.browserLink ?? null}
          onNavigate={(url, link) => openBrowser(url, link ?? null)}
        />
      )}

      {w.kind === "explorer" && (
        <div className="window-body window-body-fx">
          <FileExplorer
            path={w.explorerPath ?? []}
            onNavigate={openExplorer}
            onOpenFile={openFile}
            onOpenLink={l => openBrowser(l.url, l)}
          />
        </div>
      )}

      {w.kind === "txt" && (
        <div className="window-body">
          <Markdown text={w.text ?? ""} onLink={url => openBrowser(url)} />
        </div>
      )}

      {w.kind === "terminal" && (
        <div className="window-body">
          <pre>{w.text ?? ""}</pre>
        </div>
      )}

      {w.kind === "pdf" && (
        <div className="window-body window-body-pdf">
          <iframe
            className="pdf-frame"
            src={w.pdfUrl ?? ""}
            title={w.title}
          />
        </div>
      )}
    </div>
  );
}
