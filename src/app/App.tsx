import React, { useEffect, useMemo, useState } from 'react';
import { GamePage } from '@pages/GamePage';
import { CascadeGamePage } from '@pages/CascadeGamePage';
import { GamesMenuPage } from '@pages/GamesMenuPage';
import './styles/index.css';
import './App.css';

type AppRoute = 'games' | 'line' | 'cascade';

const parseHashRoute = (): AppRoute => {
  const hash = window.location.hash || '';
  if (hash.startsWith('#/line')) return 'line';
  if (hash.startsWith('#/cascade')) return 'cascade';
  return 'games';
};

export const App: React.FC = () => {
  const [route, setRoute] = useState<AppRoute>(() => parseHashRoute());

  useEffect(() => {
    const onHashChange = () => setRoute(parseHashRoute());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const page = useMemo(() => {
    switch (route) {
      case 'line':
        return <GamePage />;
      case 'cascade':
        return <CascadeGamePage />;
      case 'games':
      default:
        return <GamesMenuPage />;
    }
  }, [route]);

  return (
    <div className="app-container">
      {page}
    </div>
  );
};

