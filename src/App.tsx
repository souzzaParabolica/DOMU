import { useCallback, useEffect, useState } from 'react';
import { Building2 } from 'lucide-react';
import { useStoreValue, useStore, StoreProvider } from './store';
import Login from './screens/Login';
import AppShell from './screens/AppShell';
import AdminUsers from './screens/AdminUsers';
import type { UserProfile } from './lib/supabase';

function Tela() {
  const { setPerfil } = useStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  const loadProfile = useCallback(async (userId: string) => {
    const { supabase } = await import('./lib/supabase');
    if (!supabase) { setProfile(null); setLoading(false); return; }
    const { data, error } = await supabase.from('user_profiles').select('*').eq('id', userId).single();
    if (error) { setAuthError('Não foi possível carregar o perfil. Confira se o esquema do Supabase foi aplicado.'); setProfile(null); }
    else { setAuthError(''); setProfile(data as UserProfile); if (data.role !== 'admin') setPerfil(data.role); }
    setLoading(false);
  }, [setPerfil]);

  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | undefined;
    void import('./lib/supabase').then(async ({ supabase }) => {
      if (!supabase) { if (active) setLoading(false); return; }
      const { data } = await supabase.auth.getSession();
      if (!active) return;
      if (data.session) {
        const { data: current } = await supabase.from('user_profiles').select('*').eq('id', data.session.user.id).single();
        if (current?.role === 'morador' && current.requested_role && current.requested_role !== 'morador') {
          await supabase.auth.signOut();
          if (active) { setProfile(null); setLoading(false); }
        } else await loadProfile(data.session.user.id);
      } else setLoading(false);
      const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
        if (!active) return;
        if (event === 'SIGNED_OUT' || !session) { setProfile(null); setLoading(false); }
      });
      unsubscribe = () => subscription.subscription.unsubscribe();
    });
    return () => { active = false; unsubscribe?.(); };
  }, [loadProfile]);

  const sair = async () => {
    const { supabase } = await import('./lib/supabase');
    if (supabase) await supabase.auth.signOut();
    setProfile(null);
  };

  if (loading) return <div className="grid min-h-screen place-items-center bg-[#f7f6f3]"><div className="flex items-center gap-3 text-[#66706a]"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#c86648] text-white"><Building2 size={20} /></span><span className="text-sm">Carregando seu espaço…</span></div></div>;
  if (!profile) return <><Login onEntrar={(next) => { setProfile(next); if (next.role !== 'admin') setPerfil(next.role); }} />{authError && <div role="alert" className="fixed bottom-4 left-1/2 -translate-x-1/2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 shadow">{authError}</div>}</>;
  if (profile.role === 'admin') return <AdminUsers admin={profile} onSair={() => void sair()} />;
  return <AppShell nomeUsuario={profile.nome} onSair={() => void sair()} />;
}

export default function App() {
  const store = useStoreValue();
  return <StoreProvider store={store}><div className="min-h-screen" style={{ background: 'var(--bg-page)' }}><Tela /></div></StoreProvider>;
}
