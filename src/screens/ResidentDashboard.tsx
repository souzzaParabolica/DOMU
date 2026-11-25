import { useMemo, useState } from 'react';
import {
  Eye,
  EyeOff,
  Bell,
  Package,
  Users,
  Car,
  CalendarPlus,
  CalendarDays,
  AlertCircle,
  Wallet,
  ChevronRight,
} from 'lucide-react';
import { useStore } from '../store';
import { Card, DecorIcon, Badge } from '../components/ui';
import { formatBRL, formatDataHora } from '../lib/format';

export default function ResidentDashboard({ go, nomeUsuario }: { go: (tab: string) => void; nomeUsuario: string }) {
  const { state, toggleOcultarValores } = useStore();
  const eu = state.residents.find((r) => r.id === state.moradorAtualId);
  const nomeExibicao = nomeUsuario.trim() || 'Morador';
  const iniciais = nomeExibicao.split(/\s+/).slice(0, 2).map((parte) => parte[0]).join('').toUpperCase();
  const [notifOpen, setNotifOpen] = useState(false);

  const minhasNotifs = useMemo(
    () =>
      state.notifications.filter(
        (n) =>
          n.targetProfile === 'morador' &&
          (!n.targetUnidadeId || n.targetUnidadeId === eu?.unidadeId),
      ),
    [state.notifications, eu],
  );
  const naoLidas = minhasNotifs.filter((n) => !n.lida).length;

  const financeiros = state.finance.filter(
    (f) => f.unidadeId === eu?.unidadeId && f.status !== 'Pago',
  );
  const totalAberto = financeiros.reduce((acc, f) => acc + f.valor, 0);

  const entregasPendentes = state.packages.filter(
    (p) => p.unidadeId === eu?.unidadeId && p.status === 'Aguardando retirada',
  ).length;

  const visitantesAtivos = state.visitors.filter(
    (v) => v.unidadeId === eu?.unidadeId && v.status === 'Autorizado',
  ).length;

  const veiculos = state.vehicles.filter((v) => v.unidadeId === eu?.unidadeId).length;

  const hoje = new Date().getDay();
  const proximosEventos = state.schedule
    .filter((s) => s.diaSemana >= hoje)
    .slice(0, 3);

  const toggleNotif = () => {
    setNotifOpen((o) => !o);
    if (!notifOpen && naoLidas > 0) {
      // mark as read when panel is opened
      setTimeout(() => {}, 0);
    }
  };

  return (
    <div className="space-y-4">
      <header className="flex items-center gap-3">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-full font-bold text-[rgba(255,255,255,0.9)]"
          style={{ background: 'linear-gradient(135deg, #FE4E02, #EA5C29)' }}
        >
          {iniciais}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-extrabold text-strong">Opa, {nomeExibicao}</h1>
          <p className="text-sm text-muted">
            Apto {eu?.apartamento} {eu?.bloco}
          </p>
        </div>
        <button
          onClick={toggleOcultarValores}
          aria-label={state.ocultarValores ? 'Exibir valores' : 'Ocultar valores'}
          className="surface rounded-full p-2.5 text-strong"
        >
          {state.ocultarValores ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
        <div className="relative">
          <button
            onClick={toggleNotif}
            aria-label="Notificações"
            className="surface relative rounded-full p-2.5 text-strong"
          >
            <Bell size={18} />
            {naoLidas > 0 && (
              <span
                className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-[#FE4E02]"
                aria-hidden="true"
              />
            )}
          </button>
          {notifOpen && (
            <div className="surface absolute right-0 top-12 z-40 w-72 rounded-2xl p-3" style={{ background: 'var(--bg-page)' }}>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">Notificações</p>
              {minhasNotifs.length === 0 && <p className="py-4 text-center text-sm text-muted">Nada por aqui.</p>}
              <div className="max-h-64 space-y-2 overflow-y-auto">
                {minhasNotifs.slice(0, 8).map((n) => (
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
      </header>

      <Card className="p-5" hover onClick={() => go('financeiro')}>
        <div
          className="rounded-2xl p-5"
          style={{ background: 'linear-gradient(135deg, #FE4E02, #EA5C29)' }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[rgba(255,255,255,0.8)]">Fatura atual em aberto</p>
              <p className="mt-1 text-3xl font-extrabold text-[rgba(255,255,255,0.9)]">
                {state.ocultarValores ? '••••••' : formatBRL(totalAberto)}
              </p>
              <p className="mt-1 text-xs text-[rgba(255,255,255,0.8)]">
                {financeiros.length} lançamento(s) — boletos, contas e multas
              </p>
            </div>
            <Wallet size={40} className="text-[rgba(255,255,255,0.6)]" />
          </div>
          <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[rgba(255,255,255,0.9)]">
            Abrir financeiro <ChevronRight size={16} />
          </span>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card hover onClick={() => go('visitantes')} className="p-4">
          <DecorIcon>
            <Users size={64} />
          </DecorIcon>
          <Badge tone="orange">+{Math.max(0, visitantesAtivos - 1)}</Badge>
          <p className="mt-2 font-bold text-strong">Visitantes autorizados</p>
          <p className="text-sm text-muted">{visitantesAtivos} na lista ativa</p>
        </Card>

        <Card hover onClick={() => go('encomendas')} className="p-4">
          <DecorIcon>
            <Package size={64} />
          </DecorIcon>
          {entregasPendentes > 0 && <Badge tone="orange">{entregasPendentes} aguardando</Badge>}
          <p className="mt-2 font-bold text-strong">Entregas</p>
          <p className="text-sm text-muted">
            {entregasPendentes > 0 ? 'Retire na portaria' : 'Nada aguardando'}
          </p>
        </Card>

        <Card hover onClick={() => go('veiculos')} className="p-4">
          <DecorIcon>
            <Car size={64} />
          </DecorIcon>
          <p className="mt-2 font-bold text-strong">Meus veículos</p>
          <p className="text-sm text-muted">{veiculos} cadastrado(s)</p>
        </Card>

        <Card hover onClick={() => go('reservas')} className="p-4">
          <DecorIcon>
            <CalendarPlus size={64} />
          </DecorIcon>
          <p className="mt-2 font-bold text-strong">Reservar área comum</p>
          <p className="text-sm text-muted">Salão, churrasqueira…</p>
        </Card>
      </div>

      <Card hover onClick={() => go('programacao')} className="p-4">
        <DecorIcon>
          <CalendarDays size={64} />
        </DecorIcon>
        <p className="font-bold text-strong">Programações da semana</p>
        <div className="mt-2 space-y-2">
          {proximosEventos.map((ev) => (
            <div key={ev.id} className="inset flex items-center justify-between rounded-xl px-3 py-2">
              <span className="text-sm font-medium text-strong">{ev.titulo}</span>
              <Badge tone={ev.tipo === 'Evento' ? 'orange' : ev.tipo === 'Manutenção' ? 'amber' : 'neutral'}>
                {ev.horario}
              </Badge>
            </div>
          ))}
          {proximosEventos.length === 0 && <p className="text-sm text-muted">Sem eventos restantes nesta semana.</p>}
        </div>
      </Card>

      <Card hover onClick={() => go('ocorrencias')} className="p-4">
        <DecorIcon>
          <AlertCircle size={64} />
        </DecorIcon>
        <p className="font-bold text-strong">Ocorrências e Reclamações</p>
        <p className="text-sm text-muted">Barulho, manutenção, segurança ou sugestões</p>
      </Card>
    </div>
  );
}
