import { useMemo, useState } from 'react';
import { Star, Users, Check, CalendarDays, Clock, ArrowLeft, ArrowRight } from 'lucide-react';
import { useStore } from '../store';
import { Card, Badge, Button, EmptyState, PageTitle, DecorIcon } from '../components/ui';
import { ESPACOS } from '../seed';
import { DIAS_SEMANA } from '../lib/format';

const HORARIOS = ['08:00', '10:00', '13:00', '15:00', '18:00', '20:00'];

function proximosDias(n: number): Date[] {
  const out: Date[] = [];
  const hoje = new Date();
  for (let i = 1; i <= n; i++) {
    const d = new Date(hoje);
    d.setDate(d.getDate() + i);
    out.push(d);
  }
  return out;
}

export default function Reservas() {
  const { state, update, notify } = useStore();
  const eu = state.residents.find((r) => r.id === state.moradorAtualId);
  const [espacoSel, setEspacoSel] = useState<string | null>(null);
  const [dataSel, setDataSel] = useState<string | null>(null);
  const [horaSel, setHoraSel] = useState<string | null>(null);
  const [confirmado, setConfirmado] = useState(false);

  const dias = useMemo(() => proximosDias(21), []);

  const espaco = ESPACOS.find((e) => e.id === espacoSel);

  const reservasEspaco = state.bookings.filter((b) => b.espacoId === espacoSel);
  const ocupados = reservasEspaco.filter((b) => b.data === dataSel).map((b) => b.horario);

  const minhasReservas = state.bookings
    .filter((b) => b.unidadeId === eu?.unidadeId)
    .sort((a, b) => (a.data < b.data ? -1 : 1));

  const reset = () => {
    setEspacoSel(null);
    setDataSel(null);
    setHoraSel(null);
    setConfirmado(false);
  };

  const reservar = () => {
    if (!espaco || !dataSel || !horaSel || !eu) return;
    const booking = {
      id: `b-${Date.now()}`,
      espacoId: espaco.id,
      unidadeId: eu.unidadeId,
      residentId: eu.id,
      data: dataSel,
      horario: horaSel,
      criadoEm: new Date().toISOString(),
    };
    update((s) => ({ ...s, bookings: [...s.bookings, booking] }));
    notify(state, {
      targetProfile: 'sindico',
      titulo: 'Nova reserva',
      corpo: `${eu.nome} reservou ${espaco.nome} em ${dataSel.split('-').reverse().join('/')} às ${horaSel}.`,
    });
    setConfirmado(true);
  };

  const cancelar = (id: string) => {
    update((s) => ({ ...s, bookings: s.bookings.filter((b) => b.id !== id) }));
  };

  const formatDataBR = (iso: string) => {
    const d = new Date(iso + 'T12:00:00');
    return d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' });
  };

  if (confirmado && espaco) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div
          className="mb-4 flex h-16 w-16 items-center justify-center rounded-full"
          style={{ background: 'rgba(34, 140, 74, 0.15)', color: '#228C4A' }}
        >
          <Check size={32} />
        </div>
        <h2 className="text-xl font-extrabold text-strong">Reserva feita!</h2>
        <p className="mt-1 max-w-xs text-sm text-muted">
          {espaco.nome} — {dataSel && formatDataBR(dataSel)} às {horaSel}. A portaria e o síndico já foram avisados.
        </p>
        <Button className="mt-6" onClick={reset}>
          Voltar aos espaços
        </Button>
      </div>
    );
  }

  if (espaco) {
    const step = !dataSel ? 1 : !horaSel ? 2 : 3;
    return (
      <div className="space-y-4">
        <button
          onClick={reset}
          className="flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-strong"
        >
          <ArrowLeft size={16} /> Espaços
        </button>

        <div
          className={`domu-card bg-gradient-to-br ${espaco.gradiente} p-5 text-[rgba(255,255,255,0.9)]`}
          style={{ boxShadow: '0 3px 5px rgba(234, 92, 41, 0.18)' }}
        >
          <DecorIcon light>
            <CalendarDays size={72} />
          </DecorIcon>
          <h2 className="text-xl font-extrabold">{espaco.nome}</h2>
          <p className="mt-1 flex items-center gap-1 text-sm text-[rgba(255,255,255,0.8)]">
            <Star size={14} className="fill-current" /> {espaco.nota.toFixed(1)} · até {espaco.capacidade} pessoas
          </p>
        </div>

        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className="h-1.5 rounded-full transition-all"
              style={{
                width: s === step ? 28 : 12,
                background: s <= step ? '#FE4E02' : 'var(--bg-inset)',
              }}
              aria-hidden="true"
            />
          ))}
        </div>
        <p className="text-center text-sm font-semibold text-muted">
          {step === 1 ? 'Falta pouco… escolha a data' : step === 2 ? 'Falta pouco… escolha o horário' : 'Confira e confirme'}
        </p>

        <Card className="p-4">
          <p className="mb-3 flex items-center gap-1.5 text-sm font-bold text-strong">
            <CalendarDays size={16} className="text-[#FE4E02]" /> Data
          </p>
          <div className="grid grid-cols-7 gap-1.5">
            {dias.map((d) => {
              const iso = d.toISOString().slice(0, 10);
              const ocupadoDia =
                espaco.nome === 'Salão de Festas' && d.getDate() === 15; // exemplo de bloqueio
              const cheio = HORARIOS.every((h) =>
                state.bookings.some((b) => b.espacoId === espaco.id && b.data === iso && b.horario === h),
              );
              const sel = dataSel === iso;
              return (
                <button
                  key={iso}
                  disabled={ocupadoDia || cheio}
                  onClick={() => {
                    setDataSel(iso);
                    setHoraSel(null);
                  }}
                  aria-label={formatDataBR(iso)}
                  className={`rounded-lg py-2 text-center text-xs font-semibold transition-colors ${
                    sel ? 'text-[rgba(255,255,255,0.9)]' : 'text-body'
                  }`}
                  style={{
                    background: sel
                      ? '#FE4E02'
                      : ocupadoDia || cheio
                        ? 'var(--bg-inset)'
                        : 'var(--bg-surface-soft)',
                    opacity: ocupadoDia || cheio ? 0.35 : 1,
                    textDecoration: ocupadoDia ? 'line-through' : undefined,
                  }}
                >
                  <span className="block">{DIAS_SEMANA[d.getDay()]}</span>
                  <span className="text-sm">{d.getDate()}</span>
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-muted">Datas riscadas ou apagadas já estão reservadas.</p>
        </Card>

        {dataSel && (
          <Card className="p-4">
            <p className="mb-3 flex items-center gap-1.5 text-sm font-bold text-strong">
              <Clock size={16} className="text-[#FE4E02]" /> Horário
            </p>
            <div className="grid grid-cols-3 gap-2">
              {HORARIOS.map((h) => {
                const ocupado = ocupados.includes(h);
                const sel = horaSel === h;
                return (
                  <button
                    key={h}
                    disabled={ocupado}
                    onClick={() => setHoraSel(h)}
                    className={`rounded-xl py-2.5 text-sm font-semibold transition-colors ${
                      sel ? 'text-[rgba(255,255,255,0.9)]' : ocupado ? 'text-muted' : 'text-body'
                    }`}
                    style={{
                      background: sel ? '#FE4E02' : ocupado ? 'var(--bg-inset)' : 'var(--bg-surface-soft)',
                      opacity: ocupado ? 0.4 : 1,
                      border: '1px solid var(--border-soft)',
                    }}
                  >
                    {h}
                    {ocupado && ' ✕'}
                  </button>
                );
              })}
            </div>
          </Card>
        )}

        {dataSel && horaSel && (
          <Card className="p-4">
            <p className="mb-2 text-sm font-bold text-strong">Resumo</p>
            <div className="inset rounded-xl p-3 text-sm">
              <div className="flex justify-between py-0.5">
                <span className="text-muted">Espaço</span>
                <span className="font-semibold text-strong">{espaco.nome}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-muted">Data</span>
                <span className="font-semibold text-strong">{formatDataBR(dataSel)}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-muted">Horário</span>
                <span className="font-semibold text-strong">{horaSel}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-muted">Responsável</span>
                <span className="font-semibold text-strong">
                  {eu?.nome} — Apto {eu?.apartamento} {eu?.bloco}
                </span>
              </div>
            </div>
            <Button className="mt-3 w-full" onClick={reservar}>
              Confirmar reserva <ArrowRight size={16} />
            </Button>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageTitle title="Reservar áreas comuns" subtitle="Escolha um espaço para começar" />

      {ESPACOS.map((e) => (
        <Card key={e.id} hover onClick={() => setEspacoSel(e.id)} className="overflow-hidden">
          <div className={`h-24 bg-gradient-to-br ${e.gradiente}`} aria-hidden="true" />
          <div className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-bold text-strong">{e.nome}</p>
                <p className="flex items-center gap-2 text-sm text-muted">
                  <span className="flex items-center gap-1">
                    <Star size={13} className="fill-current text-[#FE4E02]" /> {e.nota.toFixed(1)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={13} /> {e.capacidade}
                  </span>
                </p>
              </div>
              <Button variant="secondary">Reservar</Button>
            </div>
            <p className="mt-2 text-sm text-body">{e.descricao}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {e.comodidades.map((c) => (
                <Badge key={c}>{c}</Badge>
              ))}
            </div>
          </div>
        </Card>
      ))}

      <div>
        <p className="mb-2 mt-6 text-sm font-bold uppercase tracking-wide text-muted">Minhas reservas</p>
        {minhasReservas.length === 0 ? (
          <EmptyState icon={<CalendarDays size={32} />} title="Nenhuma reserva ainda" />
        ) : (
          <div className="space-y-2">
            {minhasReservas.map((b) => {
              const esp = ESPACOS.find((e) => e.id === b.espacoId);
              const futura = b.data >= new Date().toISOString().slice(0, 10);
              return (
                <Card key={b.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-semibold text-strong">{esp?.nome}</p>
                    <p className="text-sm text-muted">
                      {formatDataBR(b.data)} às {b.horario}
                    </p>
                  </div>
                  {futura && (
                    <Button variant="danger" onClick={() => cancelar(b.id)}>
                      Cancelar
                    </Button>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
