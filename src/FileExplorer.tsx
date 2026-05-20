import { resolvePath, type FsNode } from "./fs";
import { FolderIcon, NotepadIcon, BrowserIcon } from "./icons";

type Props = {
  path: string[];
  onNavigate: (path: string[]) => void;
  onOpenFile: (file: Extract<FsNode, { kind: "file" }>) => void;
  onOpenLink: (link: Extract<FsNode, { kind: "link" }>) => void;
};

export function FileExplorer({ path, onNavigate, onOpenFile, onOpenLink }: Props) {
  let node: FsNode;
  try {
    node = resolvePath(path);
  } catch {
    return <div className="fx-body">path not found: /{path.join("/")}</div>;
  }
  if (node.kind !== "dir") return <div className="fx-body">not a directory</div>;

  const goUp = () => onNavigate(path.slice(0, -1));
  const goRoot = () => onNavigate([]);

  return (
    <div className="fx">
      <div className="fx-bar">
        <button className="fx-btn" disabled={path.length === 0} onClick={goUp}>◀</button>
        <button className="fx-btn" onClick={goRoot}>⌂</button>
        <div className="fx-crumbs">
          <span className="fx-crumb" onClick={goRoot}>~</span>
          {path.map((seg, i) => (
            <span key={i}>
              <span className="fx-sep">/</span>
              <span
                className="fx-crumb"
                onClick={() => onNavigate(path.slice(0, i + 1))}
              >
                {seg}
              </span>
            </span>
          ))}
        </div>
      </div>
      <div className="fx-body">
        {node.children.length === 0 && <div className="fx-empty">(empty)</div>}
        {node.children.map(child => (
          <Entry
            key={child.name}
            node={child}
            onActivate={() => {
              if (child.kind === "dir") onNavigate([...path, child.name]);
              else if (child.kind === "file") onOpenFile(child);
              else onOpenLink(child);
            }}
          />
        ))}
      </div>
    </div>
  );
}

function Entry({ node, onActivate }: { node: FsNode; onActivate: () => void }) {
  const icon =
    node.kind === "dir" ? <FolderIcon size={22} /> :
    node.kind === "link" ? <BrowserIcon size={22} /> :
    <NotepadIcon size={22} />;
  const label =
    node.kind === "link" ? `${node.name}  →` :
    node.kind === "dir" ? `${node.name}/` :
    node.name;
  return (
    <div className="fx-entry" onDoubleClick={onActivate} onClick={onActivate}>
      <div className="fx-icon">{icon}</div>
      <div className="fx-label">{label}</div>
    </div>
  );
}
