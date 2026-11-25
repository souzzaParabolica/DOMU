import { useState, useEffect, useRef } from 'react';
import { Building2, Eclipse, Bell, ChevronDown, RotateCcw, LogOut, Check } from 'lucide-react';
import { useStore } from '../store';
import { Button, Modal } from '../components/ui';
import { formatDataHora } from '../lib/format';
import type { Profile } from '../types';

const perfilNomes: Record<Profile, string> = {
  morador: 'Morador',
  sindico: 'Síndico(a)',
  portaria: 'Portaria',
};

export function TopBar({ onSair }: { onSair: () => void }) {
  const { state, toggleTema, setPerfil, marcarNotificacoesLidas, limparNotificacoes, restaurarDemo } =
    useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const eu = state.residents.find((r) => r.id === state.moradorAtualId);

  const notifs = state.notifications.filter(
    (n) =>
      n.targetProfile === state.perfilAtivo &&
      (!n.targetUnidadeId || state.perfilAtivo !== 'morador' || n.targetUnidadeId === eu?.unidadeId),
  );
  const naoLidas = notifs.filter((n) => !n.lida).length;

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <header className="surface sticky top-0 z-30 mb-4 flex items-center gap-2 rounded-b-2xl px-4 py-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FE4E02]" aria-hidden="true">
        <Building2 size={18} className="text-[rgba(255,255,255,0.9)]" />
      </div>
      <span className="text-lg font-extrabold tracking-tight text-strong">DOMU</span>

      <div className="flex-1" />

      <button
        onClick={toggleTema}
        aria-label="Alternar tema claro/escuro"
        className="rounded-full p-2.5 text-strong hover:text-[#FE4E02]"
      >
        <Eclipse size={19} />
      </button>

      <div className="relative" ref={notifRef}>
        <button
          onClick={() => {
            const abrindo = !notifOpen;
            setNotifOpen(abrindo);
            if (abrindo && naoLidas > 0) marcarNotificacoesLidas(state.perfilAtivo);
          }}
          aria-label="Notificações"
          className="relative rounded-full p-2.5 text-strong hover:text-[#FE4E02]"
        >
          <Bell size={19} />
          {naoLidas > 0 && (
            <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-[#FE4E02]" aria-hidden="true" />
          )}
        </button>
        {notifOpen && (
          <div
            className="surface absolute right-0 top-11 w-72 rounded-2xl p-3"
            style={{ background: 'var(--bg-page)' }}
          >
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wide text-muted">Notificações</p>
              {notifs.length > 0 && (
                <button onClick={limparNotificacoes} className="text-xs font-semibold text-[#FE4E02]">
                  Limpar
                </button>
              )}
            </div>
            {notifs.length === 0 && <p className="py-4 text-center text-sm text-muted">Nada por aqui.</p>}
            <div className="max-h-64 space-y-2 overflow-y-auto">
              {notifs.map((n) => (
                <div key={n.id} className="inset rounded-xl p-3">
                  <p className="text-sm font-semibold text-strong">{n.titulo}</p>
                  <p className="text-xs text-muted">{n.corpo}</p>
                  <p className="mt-1 text-[10px] text-muted">{formatDataHora(n.criadoEm)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Menu de perfil"
          aria-expanded={menuOpen}
          className="surface-soft flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-bold text-strong"
        >
          {perfilNomes[state.perfilAtivo]}
          <ChevronDown size={14} />
        </button>
        {menuOpen && (
          <div
            className="surface absolute right-0 top-11 w-56 rounded-2xl p-2"
            style={{ background: 'var(--bg-page)' }}
          >
            <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-muted">
              Trocar perfil
            </p>
            {(['morador', 'sindico', 'portaria'] as Profile[]).map((p) => (
              <button
                key={p}
                onClick={() => {
                  setMenuOpen(false);
                  if (p !== state.perfilAtivo) setPerfil(p);
                }}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-body hover:bg-[rgba(254,78,2,0.1)]"
              >
                {perfilNomes[p]}
                {state.perfilAtivo === p && <Check size={15} className="text-[#FE4E02]" />}
              </button>
            ))}
            <div className="my-1 border-t border-soft" />
            <button
              onClick={() => {
                setMenuOpen(false);
                setDemoOpen(true);
              }}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-body hover:bg-[rgba(254,78,2,0.1)]"
            >
              <RotateCcw size={15} /> Restaurar dados demo
            </button>
            <button
              onClick={onSair}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-body hover:bg-[rgba(254,78,2,0.1)]"
            >
              <LogOut size={15} /> Sair
            </button>
          </div>
        )}
      </div>

      <Modal open={demoOpen} onClose={() => setDemoOpen(false)} title="Restaurar dados demo">
        <p className="text-sm text-body">
          Isso apaga todas as alterações feitas e recarrega os dados de demonstração originais. Deseja
          continuar?
        </p>
        <div className="mt-4 flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={() => setDemoOpen(false)}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            onClick={() => {
              restaurarDemo();
              setDemoOpen(false);
              onSair();
            }}
          >
            Restaurar
          </Button>
        </div>
      </Modal>
    </header>
  );
}
