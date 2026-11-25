import { Package, Users, CalendarDays, AlertCircle, ArrowRight } from 'lucide-react';
import { useStore } from '../store';
import { Card, DecorIcon, Badge } from '../components/ui';

export default function PortariaPainel({ go }: { go: (tab: string) => void }) {
  const { state } = useStore();

  const aguardando = state.packages.filter((p) => p.status === 'Aguardando retirada');
  const dentro = state.visitors.filter((v) => v.entradaEm && !v.saidaEm);
  const reservasSemana = state.bookings.length;
  const ocorrenciasAbertas = state.occurrences.filter((o) => o.status !== 'Resolvida').length;

  const cards = [
    {
      id: 'p-encomendas',
      titulo: 'Encomendas na portaria',
      valor: `${aguardando.length}`,
      sub: aguardando.length > 0 ? 'aguardando retirada' : 'nada pendente',
      icon: Package,
      destaque: aguardando.length > 0,
    },
    {
      id: 'p-visitantes',
      titulo: 'Visitantes dentro',
      valor: `${dentro.length}`,
      sub: 'no condomínio agora',
      icon: Users,
      destaque: false,
    },
    {
      id: 'p-consulta',
      titulo: 'Reservas ativas',
      valor: `${reservasSemana}`,
      sub: 'áreas comuns',
      icon: CalendarDays,
      destaque: false,
    },
    {
      id: 'p-consulta',
      titulo: 'Ocorrências abertas',
      valor: `${ocorrenciasAbertas}`,
      sub: 'reportadas pelos moradores',
      icon: AlertCircle,
      destaque: false,
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-extrabold text-strong">Portaria</h1>
        <p className="text-sm text-muted">Visão geral do movimento de hoje</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Card key={c.titulo} hover onClick={() => go(c.id)} className="p-4">
              <DecorIcon>
                <Icon size={64} />
              </DecorIcon>
              <div className="flex items-center gap-2">
                <p className="text-xl font-extrabold text-strong">{c.valor}</p>
                {c.destaque && <Badge tone="orange">!</Badge>}
              </div>
              <p className="mt-0.5 text-sm font-semibold text-body">{c.titulo}</p>
              <p className="text-xs text-muted">{c.sub}</p>
            </Card>
          );
        })}
      </div>

      <Card className="p-4">
        <p className="mb-2 text-sm font-bold text-strong">Encomendas aguardando retirada</p>
        {aguardando.length === 0 ? (
          <p className="py-2 text-sm text-muted">Nenhuma encomenda pendente.</p>
        ) : (
          <div className="space-y-2">
            {aguardando.slice(0, 4).map((p) => {
              const morador = state.residents.find((r) => r.id === p.residentId);
              return (
                <div key={p.id} className="inset flex items-center justify-between rounded-xl px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-strong">{p.descricao}</p>
                    <p className="text-xs text-muted">
                      {morador ? `Apto ${morador.apartamento} ${morador.bloco} · ${p.transportadora}` : '—'}
                    </p>
                  </div>
                  <button
                    onClick={() => go('p-encomendas')}
                    aria-label="Abrir encomendas"
                    className="shrink-0 text-[#FE4E02]"
                  >
                    <ArrowRight size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card className="p-4">
        <p className="mb-2 text-sm font-bold text-strong">Acesso rápido</p>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => go('p-encomendas')}
            className="inset flex flex-col items-center gap-1.5 rounded-xl py-3 text-xs font-semibold text-body"
          >
            <Package size={20} className="text-[#FE4E02]" />
            Encomendas
          </button>
          <button
            onClick={() => go('p-visitantes')}
            className="inset flex flex-col items-center gap-1.5 rounded-xl py-3 text-xs font-semibold text-body"
          >
            <Users size={20} className="text-[#FE4E02]" />
            Visitantes
          </button>
          <button
            onClick={() => go('p-consulta')}
            className="inset flex flex-col items-center gap-1.5 rounded-xl py-3 text-xs font-semibold text-body"
          >
            <AlertCircle size={20} className="text-[#FE4E02]" />
            Consulta
          </button>
        </div>
      </Card>
    </div>
  );
}
