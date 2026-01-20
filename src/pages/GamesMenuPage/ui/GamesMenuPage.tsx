import React from 'react';
import './GamesMenuPage.css';

export type GameRoute = '#/line' | '#/cascade';

type GameCard = {
  id: 'line' | 'cascade';
  title: string;
  subtitle: string;
  badge?: string;
  route: GameRoute;
  theme: 'santa' | 'xmas' | 'hell' | 'coins';
};

const GAMES: GameCard[] = [
  {
    id: 'line',
    title: 'SLOT MACHINE',
    subtitle: 'Линии • 5×3',
    badge: 'NEW',
    route: '#/line',
    theme: 'santa',
  },
  {
    id: 'cascade',
    title: 'SUGAR RUSH',
    subtitle: 'Каскад • 7×7',
    badge: 'NEW',
    route: '#/cascade',
    theme: 'xmas',
  },
];

const themeClass: Record<GameCard['theme'], string> = {
  santa: 'theme-santa',
  xmas: 'theme-xmas',
  hell: 'theme-hell',
  coins: 'theme-coins',
};

export const GamesMenuPage: React.FC = () => {
  return (
    <div className="games-menu-page">
      <header className="games-menu-header">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">🎮</div>
          <div className="brand-name">casino</div>
        </div>

        <nav className="top-nav">
          <a className="top-nav-link active" href="#/games">HOME</a>
          <a className="top-nav-link" href="#/games">GAMES</a>
          <span className="top-nav-link muted">ABOUT</span>
          <span className="top-nav-link muted">PARTNERS</span>
          <span className="top-nav-link muted">NEWS</span>
        </nav>
      </header>

      <main className="games-menu-content">
        <div className="games-grid">
          {GAMES.map((game) => (
            <div key={game.id} className={`game-card ${themeClass[game.theme]}`}>
              {game.badge && <div className="game-badge">{game.badge}</div>}

              <div className="game-thumb" role="img" aria-label={game.title}>
                <div className="game-thumb-glow" />
                <div className="game-thumb-title">{game.title}</div>
              </div>

              <div className="game-title">{game.title}</div>
              <div className="game-subtitle">{game.subtitle}</div>

              <a className="game-cta" href={game.route}>
                ИГРАТЬ
              </a>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};


