type IconProps = { size?: number; className?: string };

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 32 32",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

export function BrowserIcon({ size = 28, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <circle cx="16" cy="16" r="12" />
      <ellipse cx="16" cy="16" rx="5" ry="12" />
      <line x1="4" y1="16" x2="28" y2="16" />
      <line x1="16" y1="4" x2="16" y2="28" />
    </svg>
  );
}

export function TerminalIcon({ size = 28, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <rect x="3" y="6" width="26" height="20" rx="2" />
      <polyline points="8,13 12,17 8,21" />
      <line x1="14" y1="22" x2="22" y2="22" />
    </svg>
  );
}

export function FolderIcon({ size = 28, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M3 9 L3 25 Q3 27 5 27 L27 27 Q29 27 29 25 L29 12 Q29 10 27 10 L15 10 L12 7 L5 7 Q3 7 3 9 Z" />
    </svg>
  );
}

export function NotepadIcon({ size = 28, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M7 3 L22 3 L27 8 L27 29 L7 29 Z" />
      <polyline points="22,3 22,8 27,8" />
      <line x1="11" y1="14" x2="23" y2="14" />
      <line x1="11" y1="18" x2="23" y2="18" />
      <line x1="11" y1="22" x2="20" y2="22" />
    </svg>
  );
}

export function TrashIcon({ size = 28, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <line x1="4" y1="8" x2="28" y2="8" />
      <path d="M7 8 L9 27 Q9 28 10 28 L22 28 Q23 28 23 27 L25 8" />
      <path d="M12 8 L12 5 Q12 4 13 4 L19 4 Q20 4 20 5 L20 8" />
      <line x1="13" y1="13" x2="13" y2="24" />
      <line x1="16" y1="13" x2="16" y2="24" />
      <line x1="19" y1="13" x2="19" y2="24" />
    </svg>
  );
}

export function MailIcon({ size = 28, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <rect x="3" y="7" width="26" height="18" rx="1.5" />
      <polyline points="3,9 16,19 29,9" />
    </svg>
  );
}

export function PersonIcon({ size = 28, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <circle cx="16" cy="11" r="5" />
      <path d="M5 28 Q5 19 16 19 Q27 19 27 28" />
    </svg>
  );
}

export function StarIcon({ size = 28, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <polygon points="16,3 20,12 30,13 22,20 24,30 16,24 8,30 10,20 2,13 12,12" />
    </svg>
  );
}

export function GridIcon({ size = 28, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <rect x="4" y="4" width="10" height="10" rx="1.5" />
      <rect x="18" y="4" width="10" height="10" rx="1.5" />
      <rect x="4" y="18" width="10" height="10" rx="1.5" />
      <rect x="18" y="18" width="10" height="10" rx="1.5" />
    </svg>
  );
}

export function MusicIcon({ size = 28, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M12 23 L12 8 L25 5 L25 20" />
      <circle cx="9" cy="23" r="3" />
      <circle cx="22" cy="20" r="3" />
    </svg>
  );
}

export function PdfIcon({ size = 28, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M7 3 L22 3 L27 8 L27 29 L7 29 Z" />
      <polyline points="22,3 22,8 27,8" />
      <text x="16" y="22" textAnchor="middle" fontSize="7" fontFamily="monospace" fill="currentColor" stroke="none">PDF</text>
    </svg>
  );
}

export function PowerIcon({ size = 16, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M10 5 A9 9 0 1 0 22 5" />
      <line x1="16" y1="4" x2="16" y2="14" />
    </svg>
  );
}

export function WifiIcon({ size = 16, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M4 12 Q16 2 28 12" />
      <path d="M8 17 Q16 9 24 17" />
      <path d="M12 22 Q16 18 20 22" />
      <circle cx="16" cy="26" r="1.2" fill="currentColor" />
    </svg>
  );
}

export function VolumeIcon({ size = 16, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M5 12 L11 12 L17 6 L17 26 L11 20 L5 20 Z" />
      <path d="M21 11 Q25 16 21 21" />
      <path d="M24 8 Q30 16 24 24" />
    </svg>
  );
}

export function BatteryIcon({ size = 16, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <rect x="3" y="10" width="24" height="12" rx="1.5" />
      <rect x="28" y="13" width="2" height="6" />
      <rect x="5" y="12" width="14" height="8" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function UbuntuLogo({ size = 18, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <circle cx="16" cy="16" r="11" />
      <circle cx="16" cy="6" r="2" fill="currentColor" stroke="none" />
      <circle cx="7.5" cy="21" r="2" fill="currentColor" stroke="none" />
      <circle cx="24.5" cy="21" r="2" fill="currentColor" stroke="none" />
    </svg>
  );
}
