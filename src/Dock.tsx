import type { ReactNode } from "react";

type DockApp = {
  key: string;
  label: string;
  icon: ReactNode;
  onClick: () => void;
  active?: boolean;
};

export function Dock({ apps }: { apps: DockApp[] }) {
  return (
    <div className="dock">
      {apps.map(a => (
        <div
          key={a.key}
          className={`dock-app ${a.active ? "dock-app-active" : ""}`}
          title={a.label}
          onClick={a.onClick}
        >
          {a.icon}
        </div>
      ))}
    </div>
  );
}
