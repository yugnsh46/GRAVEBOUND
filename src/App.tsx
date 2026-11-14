import { useCallback, useState } from 'react';
import { StoreProvider } from './store';
import { UIProvider } from './ui';
import { Hud } from './Hud';
import World from './world/World';
import { Panels } from './panels/Panels';
import { Loader } from './Loader';

export default function App() {
  const [loading, setLoading] = useState(true);
  const done = useCallback(() => setLoading(false), []);
  return (
    <StoreProvider>
      <UIProvider>
        <div className="app">
          <World />
          <Hud />
          <Panels />
        </div>
        {loading && <Loader onDone={done} />}
      </UIProvider>
    </StoreProvider>
  );
}
