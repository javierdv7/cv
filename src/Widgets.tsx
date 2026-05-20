import { NowPlaying } from "./NowPlaying";
import { GameWidget } from "./GameWidget";

export function Widgets() {
  return (
    <div className="widgets">
      <NowPlaying />
      <GameWidget />
    </div>
  );
}
