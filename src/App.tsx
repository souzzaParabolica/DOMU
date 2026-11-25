import { useState } from 'react';
import { useStoreValue, StoreProvider } from './store';
import Login from './screens/Login';
import AppShell from './screens/AppShell';

function Root({ onSair }: { onSair: () => void }) {
  return <AppShell onSair={onSair} />;
}

export default function App() {
  const store = useStoreValue();
  const [saiu, setSaiu] = useState(false);

  return (
    <StoreProvider store={store}>
      <div className="min-h-screen" style={{ background: 'var(--bg-page)' }}>
        {saiu ? <Login /> : <Root onSair={() => setSaiu(true)} />}
      </div>
    </StoreProvider>
  );
}
