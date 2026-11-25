import { Building2, Shield, User, Eclipse, ArrowRight } from 'lucide-react';
import { useStore } from '../store';
import type { Profile } from '../types';

const PERFIS: {
  id: Profile;
  nome: string;
  desc: string;
  icon: typeof User;
}[] = [
  { id: 'morador', nome: 'Morador', desc: 'Cauê — Apto 12 T-A', icon: User },
  { id: 'sindico', nome: 'Síndico(a)', desc: 'Regina — gestão completa', icon: Shield },
  { id: 'portaria', nome: 'Portaria', desc: 'Controle de acesso e entregas', icon: Building2 },
];

export default function Login() {
  const { state, setPerfil, toggleTema } = useStore();

  const entrar = (perfil: Profile) => {
    const primeiroMorador = state.residents[0];
    setPerfil(perfil, primeiroMorador?.id);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-5 py-10">
      <button
        onClick={toggleTema}
        aria-label="Alternar tema claro/escuro"
        className="surface fixed right-5 top-5 rounded-full p-3 text-strong hover:text-[#FE4E02]"
      >
        <Eclipse size={20} />
      </button>

      <div className="mb-10 text-center">
        <div
          className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FE4E02]"
          style={{ boxShadow: '0 3px 5px rgba(234, 92, 41, 0.18)' }}
        >
          <Building2 size={30} className="text-[rgba(255,255,255,0.9)]" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-strong">DOMU</h1>
        <p className="mt-1 text-sm text-muted">Gestão de Condomínios — eficiência, transparência e bem-estar</p>
      </div>

      <div className="w-full max-w-sm space-y-3">
        <p className="text-center text-sm font-medium text-muted">Entrar com 1 clique</p>
        {PERFIS.map((p) => {
          const Icon = p.icon;
          return (
            <button
              key={p.id}
              onClick={() => entrar(p.id)}
              className="domu-card domu-card-hover group flex w-full items-center gap-4 p-4 text-left"
            >
              <span
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                style={{ background: 'rgba(254, 78, 2, 0.14)', color: '#FE4E02' }}
              >
                <Icon size={22} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-bold text-strong">{p.nome}</span>
                <span className="block truncate text-sm text-muted">{p.desc}</span>
              </span>
              <ArrowRight size={18} className="shrink-0 text-muted group-hover:text-[#FE4E02]" />
            </button>
          );
        })}
      </div>

      <p className="mt-8 max-w-xs text-center text-xs text-muted" style={{ opacity: 0.85 }}>
        Ambiente de demonstração com dados simulados. Nenhuma informação real é coletada.
      </p>
    </div>
  );
}
