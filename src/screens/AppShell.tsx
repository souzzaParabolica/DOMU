import { useEffect, useState } from 'react';
import {
  Home,
  Wallet,
  CalendarDays,
  MessageSquare,
  LayoutDashboard,
  Package,
  IdCard,
  ClipboardList,
  Search,
  Users,
  ShieldCheck,
  Receipt,
  Megaphone,
} from 'lucide-react';
import { useStore } from '../store';
import { TopBar } from './TopBar';
import ResidentDashboard from './ResidentDashboard';
import Financeiro from './Financeiro';
import Reservas from './Reservas';
import Encomendas from './Encomendas';
import Visitantes from './Visitantes';
import Veiculos from './Veiculos';
import Ocorrencias from './Ocorrencias';
import Programacao from './Programacao';
import SindicoPainel from './SindicoPainel';
import GestaoMoradores from './GestaoMoradores';
import Colaboradores from './Colaboradores';
import SindicoVisitantes from './SindicoVisitantes';
import EmitirBoletos from './EmitirBoletos';
import SindicoOcorrencias from './SindicoOcorrencias';
import GerenciarProgramacao from './GerenciarProgramacao';
import Chat from './Chat';
import PortariaPainel from './PortariaPainel';
import PortariaEncomendas from './PortariaEncomendas';
import PortariaVisitantes from './PortariaVisitantes';
import ConsultaRapida from './ConsultaRapida';
import type { Profile } from '../types';

interface NavItem {
  id: string;
  label: string;
  icon: typeof Home;
}

const NAV: Record<Profile, NavItem[]> = {
  morador: [
    { id: 'inicio', label: 'Início', icon: Home },
    { id: 'encomendas', label: 'Entregas', icon: Package },
    { id: 'reservas', label: 'Reservas', icon: CalendarDays },
    { id: 'financeiro', label: 'Financeiro', icon: Wallet },
  ],
  sindico: [
    { id: 'painel', label: 'Painel', icon: LayoutDashboard },
    { id: 'ocorrencias', label: 'Ocorrências', icon: Megaphone },
    { id: 'boletos', label: 'Boletos', icon: Receipt },
    { id: 'chat-portaria', label: 'Portaria', icon: MessageSquare },
  ],
  portaria: [
    { id: 'p-painel', label: 'Início', icon: LayoutDashboard },
    { id: 'p-encomendas', label: 'Encomendas', icon: Package },
    { id: 'p-visitantes', label: 'Visitantes', icon: IdCard },
    { id: 'p-consulta', label: 'Consulta', icon: Search },
  ],
};

const MAIS: Record<Profile, { id: string; label: string }[]> = {
  morador: [
    { id: 'visitantes', label: 'Visitantes' },
    { id: 'veiculos', label: 'Meus veículos' },
    { id: 'ocorrencias', label: 'Ocorrências' },
    { id: 'programacao', label: 'Programação' },
  ],
  sindico: [
    { id: 'moradores', label: 'Moradores' },
    { id: 'colaboradores', label: 'Colaboradores' },
    { id: 's-visitantes', label: 'Visitantes' },
    { id: 's-programacao', label: 'Programação' },
    { id: 'chat-morador', label: 'Falar com morador' },
  ],
  portaria: [],
};

const TAB_INICIAL: Record<Profile, string> = {
  morador: 'inicio',
  sindico: 'painel',
  portaria: 'p-painel',
};

export default function AppShell({ onSair }: { onSair: () => void }) {
  const { state } = useStore();
  const [tab, setTab] = useState(TAB_INICIAL[state.perfilAtivo]);

  const perfil = state.perfilAtivo;

  useEffect(() => {
    setTab(TAB_INICIAL[perfil]);
  }, [perfil]);

  const valido =
    NAV[perfil].some((n) => n.id === tab) || MAIS[perfil].some((m) => m.id === tab);
  const abaAtual = valido ? tab : TAB_INICIAL[perfil];

  const go = (id: string) => setTab(id);

  const render = () => {
    if (perfil === 'morador') {
      switch (abaAtual) {
        case 'inicio':
          return <ResidentDashboard go={go} />;
        case 'financeiro':
          return <Financeiro />;
        case 'reservas':
          return <Reservas />;
        case 'encomendas':
          return <Encomendas />;
        case 'visitantes':
          return <Visitantes />;
        case 'veiculos':
          return <Veiculos />;
        case 'ocorrencias':
          return <Ocorrencias />;
        case 'programacao':
          return <Programacao />;
        default:
          return <ResidentDashboard go={go} />;
      }
    }
    if (perfil === 'sindico') {
      switch (abaAtual) {
        case 'painel':
          return <SindicoPainel go={go} />;
        case 'moradores':
          return <GestaoMoradores />;
        case 'colaboradores':
          return <Colaboradores />;
        case 's-visitantes':
          return <SindicoVisitantes />;
        case 'boletos':
          return <EmitirBoletos />;
        case 'ocorrencias':
          return <SindicoOcorrencias />;
        case 's-programacao':
          return <GerenciarProgramacao />;
        case 'chat-portaria':
          return (
            <Chat
              canal="chatSindicoPortaria"
              titulo="Chat com a Portaria"
              subtitulo="Assuntos operacionais do condomínio"
              meuPerfil="sindico"
            />
          );
        case 'chat-morador':
          return (
            <Chat
              canal="chatSindicoMorador"
              titulo="Chat com Moradores"
              subtitulo="Canal direto com a unidade do morador atual"
              meuPerfil="sindico"
            />
          );
        default:
          return <SindicoPainel go={go} />;
      }
    }
    switch (abaAtual) {
      case 'p-painel':
        return <PortariaPainel go={go} />;
      case 'p-encomendas':
        return <PortariaEncomendas />;
      case 'p-visitantes':
        return <PortariaVisitantes />;
      case 'p-consulta':
        return <ConsultaRapida />;
      case 'chat-portaria':
        return (
          <Chat
            canal="chatSindicoPortaria"
            titulo="Chat com o Síndico"
            subtitulo="Reporte urgências e tire dúvidas"
            meuPerfil="portaria"
          />
        );
      default:
        return <PortariaPainel go={go} />;
    }
  };

  const maisAtivo = MAIS[perfil].some((m) => m.id === abaAtual);

  return (
    <div className="mx-auto min-h-screen w-full max-w-lg px-4 pb-24 lg:max-w-3xl">
      <TopBar onSair={onSair} />
      <main>{render()}</main>

      <nav
        className="surface fixed bottom-4 left-1/2 z-30 flex w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 items-center justify-around rounded-2xl px-2 py-2"
        aria-label="Navegação principal"
      >
        {NAV[perfil].map((item) => {
          const Icon = item.icon;
          const ativo = abaAtual === item.id;
          return (
            <button
              key={item.id}
              onClick={() => go(item.id)}
              aria-label={item.label}
              aria-current={ativo ? 'page' : undefined}
              className="flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[10px] font-semibold"
              style={{ color: ativo ? '#FE4E02' : 'var(--text-muted)' }}
            >
              <Icon size={20} />
              {item.label}
            </button>
          );
        })}
        {MAIS[perfil].length > 0 && (
          <button
            onClick={() => go(MAIS[perfil][0].id)}
            aria-label="Mais funcionalidades"
            aria-current={maisAtivo ? 'page' : undefined}
            className="flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[10px] font-semibold"
            style={{ color: maisAtivo ? '#FE4E02' : 'var(--text-muted)' }}
          >
            <ClipboardList size={20} />
            Mais
          </button>
        )}
      </nav>
    </div>
  );
}
