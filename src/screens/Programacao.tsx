import { CalendarDays } from 'lucide-react';
import { useStore } from '../store';
import { Card, Badge, EmptyState, PageTitle } from '../components/ui';
import { DIAS_SEMANA } from '../lib/format';

export default function Programacao() {
  const { state } = useStore();
  const hojeIdx = new Date().getDay();

  const porDia = DIAS_SEMANA.map((nome, idx) => ({
    idx,
    nome,
    eventos: state.schedule
      .filter((s) => s.diaSemana === idx)
      .sort((a, b) => a.horario.localeCompare(b.horario)),
  }));

  return (
    <div className="space-y-3">
      <PageTitle title="Programação da semana" subtitle="Eventos e rotinas do condomínio" />
      {state.schedule.length === 0 && (
        <EmptyState icon={<CalendarDays size={32} />} title="Nenhum evento programado" />
      )}
      {porDia.map((d) =>
        d.eventos.length === 0 ? null : (
          <div key={d.idx}>
            <p className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-muted">
              {d.nome}
              {d.idx === hojeIdx && <Badge tone="orange">Hoje</Badge>}
            </p>
            <div className="space-y-2">
              {d.eventos.map((ev) => (
                <Card key={ev.id} className="flex items-center gap-3 p-4">
                  <div
                    className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl text-[rgba(255,255,255,0.9)]"
                    style={{ background: 'linear-gradient(135deg, #FE4E02, #EA5C29)' }}
                  >
                    <span className="text-[10px] font-medium">{ev.horario.split(':')[0]}h</span>
                    <span className="text-xs font-bold">{ev.horario.split(':')[1]}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-strong">{ev.titulo}</p>
                    <p className="truncate text-sm text-muted">{ev.local}</p>
                  </div>
                  <Badge tone={ev.tipo === 'Evento' ? 'orange' : ev.tipo === 'Manutenção' ? 'amber' : 'neutral'}>
                    {ev.tipo}
                  </Badge>
                </Card>
              ))}
            </div>
          </div>
        ),
      )}
    </div>
  );
}
