import { useEffect, useState } from "react";
import { BatteryIcon, PowerIcon, UbuntuLogo, VolumeIcon, WifiIcon } from "./icons";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function fmtFull(d: Date): string {
  const day = DAYS[d.getDay()];
  const month = MONTHS[d.getMonth()];
  const date = d.getDate().toString().padStart(2, "0");
  const year = d.getFullYear();
  const hh = d.getHours().toString().padStart(2, "0");
  const mm = d.getMinutes().toString().padStart(2, "0");
  const ss = d.getSeconds().toString().padStart(2, "0");
  return `${day} ${date} ${month} ${year}  ${hh}:${mm}:${ss}`;
}

export function TopBar() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="topbar">
      <div className="topbar-left">
        <div className="topbar-item activities">
          <UbuntuLogo size={16} />
          <span>Activities</span>
        </div>
      </div>
      <div className="topbar-center">{fmtFull(now)}</div>
      <div className="topbar-right">
        <span className="topbar-item"><WifiIcon /></span>
        <span className="topbar-item"><VolumeIcon /></span>
        <span className="topbar-item"><BatteryIcon /></span>
        <span className="topbar-item"><PowerIcon /></span>
      </div>
    </div>
  );
}
