import { useMemo } from 'react';
import { Package, AlertCircle, CalendarDays, Wallet, TrendingUp } from 'lucide-react';
import { useStore } from '../store';
import { Card, DecorIcon, Badge } from '../components/ui';
import { formatBRL } from '../lib/format';

export default function SindicoPainel({ go }: { go: (tab: string) => void }) {
  const { state } = useStore();

  const pendentes = state.packages.filter((p) => p.status === 'Aguardando retirada').length;
  const abertas = state.occurrences.filter((o) => o.status !== 'Resolvida').length;
  const reservasSemana = state.bookings.length;
  const inadimplencia = state.finance
    .filter((f) => f.status !== 'Pago')
    .reduce((acc, f) => acc + f.valor, 0);
  const emitidos = state.finance.length;

  const totalRecebido = useMemo(
    () => state.finance.filter((f) => f.status === 'Pago').reduce((a, f) => a + f.valor, 0),
    [state.finance],
  );
  const taxaAdimplencia = emitidos > 0 ? Math.round((totalRecebido / (totalRecebido + inadimplencia)) * 100) : 100;

  const cards = [
    {
      id: 'encomendas-portaria',
      titulo: 'Encomendas pendentes',
      valor: `${pendentes}`,
      sub: 'aguardando retirada',
      icon: Package,
    },
    {
      id: 'ocorrencias',
      titulo: 'Ocorrências abertas',
      valor: `${abertas}`,
      sub: 'aguardando resolução',
      icon: AlertCircle,
    },
    {
      id: 'programacao',
      titulo: 'Reservas da semana',
      valor: `${reservasSemana}`,
      sub: 'áreas comuns',
      icon: CalendarDays,
    },
    {
      id: 'boletos',
      titulo: 'Inadimplência',
      valor: formatBRL(inadimplencia),
      sub: `${emitidos} boletos emitidos`,
      icon: Wallet,
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-extrabold text-strong">Painel do Síndico</h1>
        <p className="text-sm text-muted">Visão geral do condomínio</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Card key={c.id} hover onClick={() => go(c.id)} className="p-4">
              <DecorIcon>
                <Icon size={64} />
              </DecorIcon>
              <p className="text-xl font-extrabold text-strong">{c.valor}</p>
              <p className="mt-0.5 text-sm font-semibold text-body">{c.titulo}</p>
              <p className="text-xs text-muted">{c.sub}</p>
            </Card>
          );
        })}
      </div>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="flex items-center gap-1.5 text-sm font-bold text-strong">
              <TrendingUp size={16} className="text-[#FE4E02]" /> Adimplência do condomínio
            </p>
            <p className="text-sm text-muted">
              {formatBRL(totalRecebido)} recebido · {formatBRL(inadimplencia)} em aberto
            </p>
          </div>
          <Badge tone={taxaAdimplencia >= 70 ? 'green' : 'amber'}>{taxaAdimplencia}%</Badge>
        </div>
        <div className="inset mt-3 h-2.5 overflow-hidden rounded-full">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${taxaAdimplencia}%`, background: 'linear-gradient(90deg, #FE4E02, #EA5C29)' }}
          />
        </div>
      </Card>

      <Card className="p-4">
        <p className="mb-2 text-sm font-bold text-strong">Últimas ocorrências</p>
        <div className="space-y-2">
          {state.occurrences.slice(0, 3).map((o) => (
            <div key={o.id} className="inset flex items-center justify-between rounded-xl px-3 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-strong">{o.titulo}</p>
                <p className="text-xs text-muted">{o.categoria}</p>
              </div>
              <Badge tone={o.status === 'Resolvida' ? 'green' : o.status === 'Em andamento' ? 'amber' : 'red'}>
                {o.status}
              </Badge>
            </div>
          ))}
          {state.occurrences.length === 0 && <p className="py-2 text-sm text-muted">Nenhuma ocorrência.</p>}
        </div>
      </Card>
    </div>
  );
}
