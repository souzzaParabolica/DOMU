import { useState } from 'react';
import { useStoreValue, useStore, StoreProvider } from './store';
import Login from './screens/Login';
import AppShell from './screens/AppShell';

function Tela() {
  const { state, setPerfil } = useStore();
  const [logado, setLogado] = useState(true);

  if (!logado) {
    return <Login onEntrar={(perfil) => { setPerfil(perfil); setLogado(true); }} />;
  }
  return <AppShell onSair={() => setLogado(false)} />;
}

export default function App() {
  const store = useStoreValue();

  return (
    <StoreProvider store={store}>
      <div className="min-h-screen" style={{ background: 'var(--bg-page)' }}>
        <Tela />
      </div>
    </StoreProvider>
  );
}
