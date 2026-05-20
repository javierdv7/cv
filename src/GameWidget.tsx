import { Marquee } from "./Marquee";

const GAME = {
  title: "The Legend of Zelda: Skyward Sword",
  platform: "Nintendo Wii",
  cover: "/skyward-sword.png",
};

export function GameWidget() {
  return (
    <div className="widget">
      <div className="widget-header">
        <span>currently playing</span>
        <span className="widget-tag">GAME</span>
      </div>
      <div className="widget-body widget-game">
        <img className="game-cover" src={GAME.cover} alt={GAME.title} draggable={false} />
        <div className="game-meta">
          <Marquee className="game-title">{GAME.title}</Marquee>
          <Marquee className="game-platform">{GAME.platform}</Marquee>
        </div>
      </div>
    </div>
  );
}
