import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { AppState, Profile } from './types';
import { seedState } from './seed';

const STORAGE_KEY = 'domu-state-v1';

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppState;
      if (parsed && Array.isArray(parsed.residents)) return parsed;
    }
  } catch {
    // corrupted storage falls through to seed
  }
  return seedState();
}

export function useStoreValue() {
  const [state, setState] = useState<AppState>(loadState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // storage full or unavailable
    }
  }, [state]);

  useEffect(() => {
    const root = document.documentElement;
    if (state.tema === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
  }, [state.tema]);

  const helpers = useMemo(() => {
    const update = (fn: (s: AppState) => AppState) => setState((s) => fn(s));

    const notify = (
      s: AppState,
      n: { targetProfile: Profile; targetUnidadeId?: string; titulo: string; corpo: string },
    ): AppState => ({
      ...s,
      notifications: [
        {
          id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          criadoEm: new Date().toISOString(),
          lida: false,
          ...n,
        },
        ...s.notifications,
      ],
    });

    return {
      update,
      setPerfil: (perfil: Profile, moradorId?: string) =>
        update((s) => ({
          ...s,
          perfilAtivo: perfil,
          moradorAtualId: moradorId ?? (perfil === 'morador' ? s.moradorAtualId : s.moradorAtualId),
        })),
      setMorador: (id: string) => update((s) => ({ ...s, moradorAtualId: id })),
      toggleTema: () =>
        update((s) => ({ ...s, tema: s.tema === 'dark' ? 'light' : 'dark' })),
      toggleOcultarValores: () => update((s) => ({ ...s, ocultarValores: !s.ocultarValores })),
      marcarNotificacoesLidas: (perfil: Profile, unidadeId?: string) =>
        update((s) => ({
          ...s,
          notifications: s.notifications.map((n) =>
            n.targetProfile === perfil &&
            (!n.targetUnidadeId || !unidadeId || n.targetUnidadeId === unidadeId)
              ? { ...n, lida: true }
              : n,
          ),
        })),
      limparNotificacoes: () => update((s) => ({ ...s, notifications: [] })),
      restaurarDemo: () => {
        localStorage.removeItem(STORAGE_KEY);
        setState(seedState());
      },
      notify,
    };
  }, []);

  return { state, ...helpers };
}

export type Store = ReturnType<typeof useStoreValue>;

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children, store }: { children: ReactNode; store: Store }) {
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
