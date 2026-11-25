import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { AppState, Profile } from './types';
import { seedState } from './seed';
import { supabase } from './lib/supabase';

const LOCAL_PREFS_KEY = 'domu-local-prefs-v1';
const SHARED_ROW_ID = 'condominio-principal';

type LocalPrefs = Pick<AppState, 'perfilAtivo' | 'moradorAtualId' | 'tema' | 'ocultarValores'>;
type SharedData = Omit<AppState, keyof LocalPrefs>;

function extractLocal(s: AppState): LocalPrefs {
  return {
    perfilAtivo: s.perfilAtivo,
    moradorAtualId: s.moradorAtualId,
    tema: s.tema,
    ocultarValores: s.ocultarValores,
  };
}

function extractShared(s: AppState): SharedData {
  const { perfilAtivo, moradorAtualId, tema, ocultarValores, ...shared } = s;
  void perfilAtivo;
  void moradorAtualId;
  void tema;
  void ocultarValores;
  return shared;
}

function loadInitialState(): AppState {
  const base = seedState();
  try {
    const raw = localStorage.getItem(LOCAL_PREFS_KEY);
    if (raw) {
      const prefs = JSON.parse(raw) as Partial<LocalPrefs>;
      return { ...base, ...prefs };
    }
  } catch {
    // ignora erro de leitura no storage local
  }
  return base;
}

function saveLocalPrefs(prefs: LocalPrefs) {
  try {
    localStorage.setItem(LOCAL_PREFS_KEY, JSON.stringify(prefs));
  } catch {
    // ignora se storage estiver cheio/indisponível
  }
}

async function pushSharedState(shared: SharedData) {
  if (!supabase) return;
  const { error } = await supabase.from('domu_shared_state').upsert({
    id: SHARED_ROW_ID,
    data: shared,
    updated_at: new Date().toISOString(),
  });
  if (error) {
    console.error('Erro ao salvar dados no Supabase:', error.message);
  }
}

export function useStoreValue() {
  const [state, setState] = useState<AppState>(loadInitialState);

  // 1 e 3. Carrega dados globais do Supabase e escuta atualizações em tempo real
  useEffect(() => {
    if (!supabase) return;
    const client = supabase;
    let active = true;

    const syncFromCloud = async () => {
      const { data: sessionData } = await client.auth.getSession();
      if (!sessionData.session || !active) return;

      const { data, error } = await client
        .from('domu_shared_state')
        .select('data')
        .eq('id', SHARED_ROW_ID)
        .maybeSingle();

      if (!active) return;

      if (error) {
        console.error('Erro ao buscar estado compartilhado:', error.message);
        return;
      }

      if (data?.data) {
        const cloudShared = data.data as Partial<SharedData>;
        setState((prev) => ({
          ...prev,
          ...cloudShared,
          // Mantém as preferências individuais deste aparelho
          ...extractLocal(prev),
        }));
      } else {
        // Se for o primeiro acesso e a tabela estiver vazia, inicializa com o seed
        await pushSharedState(extractShared(seedState()));
      }
    };

    void syncFromCloud();

    // Recarrega assim que o usuário concluir o login
    const { data: authListener } = client.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        void syncFromCloud();
      }
    });

    // Escuta alterações feitas por outros dispositivos em tempo real
    const channel = client
      .channel('domu-sync')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'domu_shared_state',
          filter: `id=eq.${SHARED_ROW_ID}`,
        },
        (payload) => {
          const novoRegistro = payload.new as { data?: Partial<SharedData> } | null;
          if (novoRegistro?.data && active) {
            setState((prev) => ({
              ...prev,
              ...novoRegistro.data,
              ...extractLocal(prev),
            }));
          }
        },
      )
      .subscribe();

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
      void client.removeChannel(channel);
    };
  }, []);

  // Aplica o tema claro/escuro no documento
  useEffect(() => {
    const root = document.documentElement;
    if (state.tema === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');

    const palette =
      state.tema === 'dark'
        ? {
            '--bg-page': '#1d1d1b',
            '--bg-surface': 'rgba(255, 255, 255, 0.08)',
            '--bg-surface-soft': 'rgba(255, 255, 255, 0.05)',
            '--bg-inset': 'rgba(255, 255, 255, 0.09)',
            '--text-strong': 'rgba(255, 255, 255, 0.9)',
            '--text-body': 'rgba(255, 255, 255, 0.8)',
            '--text-muted': 'rgba(255, 255, 255, 0.7)',
            '--border-soft': 'rgba(255, 255, 255, 0.1)',
          }
        : {
            '--bg-page': '#fcfcf4',
            '--bg-surface': 'rgba(255, 255, 255, 0.9)',
            '--bg-surface-soft': 'rgba(251, 241, 205, 0.6)',
            '--bg-inset': 'rgba(1, 1, 1, 0.06)',
            '--text-strong': 'rgba(1, 1, 1, 0.9)',
            '--text-body': 'rgba(1, 1, 1, 0.8)',
            '--text-muted': 'rgba(1, 1, 1, 0.7)',
            '--border-soft': 'rgba(1, 1, 1, 0.1)',
          };

    for (const [property, value] of Object.entries(palette)) {
      root.style.setProperty(property, value);
    }
    root.style.colorScheme = state.tema;
    document.body.style.backgroundColor = palette['--bg-page'];
    document.body.style.color = palette['--text-body'];
  }, [state.tema]);

  const helpers = useMemo(() => {
    // Atualiza localmente sem enviar para a nuvem (usado para tema, perfil, etc.)
    const updateLocalOnly = (fn: (s: AppState) => AppState) => {
      setState((prev) => {
        const next = fn(prev);
        saveLocalPrefs(extractLocal(next));
        return next;
      });
    };

    // 2. Atualiza na tela e envia os dados compartilhados para o Supabase
    const update = (fn: (s: AppState) => AppState) => {
      setState((prev) => {
        const next = fn(prev);
        saveLocalPrefs(extractLocal(next));
        void pushSharedState(extractShared(next));
        return next;
      });
    };

    const notify = (
      s: AppState,
      n: { targetProfile: Profile; targetUnidadeId?: string; titulo: string; corpo: string },
    ): AppState => {
      const novaNotif = {
        id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        criadoEm: new Date().toISOString(),
        lida: false,
        ...n,
      };
      let nextState = s;
      update((curr) => {
        nextState = {
          ...curr,
          notifications: [novaNotif, ...curr.notifications],
        };
        return nextState;
      });
      return nextState;
    };

    return {
      update,
      setPerfil: (perfil: Profile, moradorId?: string) =>
        updateLocalOnly((s) => ({
          ...s,
          perfilAtivo: perfil,
          moradorAtualId: moradorId ?? s.moradorAtualId,
        })),
      setMorador: (id: string) => updateLocalOnly((s) => ({ ...s, moradorAtualId: id })),
      toggleTema: () =>
        updateLocalOnly((s) => ({ ...s, tema: s.tema === 'dark' ? 'light' : 'dark' })),
      toggleOcultarValores: () =>
        updateLocalOnly((s) => ({ ...s, ocultarValores: !s.ocultarValores })),
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
        const fresh = seedState();
        saveLocalPrefs(extractLocal(fresh));
        setState(fresh);
        void pushSharedState(extractShared(fresh));
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
