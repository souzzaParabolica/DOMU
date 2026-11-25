import { useMemo, useState } from 'react';
import { Copy, Check, Users, Barcode } from 'lucide-react';
import { useStore } from '../store';
import { Card, Badge, Button, Modal, EmptyState, PageTitle, Input } from '../components/ui';
import { formatBRL, formatData } from '../lib/format';
import type { FinanceEntry, Resident } from '../types';

function toneStatus(status: FinanceEntry['status']) {
  if (status === 'Pago') return 'green' as const;
  if (status === 'Vencido') return 'red' as const;
  return 'amber' as const;
}

export default function Financeiro() {
  const { state, update, notify } = useStore();
  const eu = state.residents.find((r) => r.id === state.moradorAtualId);
  const [copiado, setCopiado] = useState<string | null>(null);
  const [rateioEntry, setRateioEntry] = useState<FinanceEntry | null>(null);

  const entries = useMemo(
    () =>
      state.finance
        .filter((f) => f.unidadeId === eu?.unidadeId)
        .sort((a, b) => (a.vencimento < b.vencimento ? 1 : -1)),
    [state.finance, eu],
  );

  const moradoresUnidade = state.residents.filter((r) => r.unidadeId === eu?.unidadeId);

  const copiar = (codigo: string) => {
    navigator.clipboard?.writeText(codigo).catch(() => {});
    setCopiado(codigo);
    setTimeout(() => setCopiado(null), 2000);
  };

  const pagar = (f: FinanceEntry) => {
    update((s) => ({
      ...s,
      finance: s.finance.map((x) => (x.id === f.id ? { ...x, status: 'Pago' } : x)),
    }));
  };

  const dividir = (f: FinanceEntry, partes: { nome: string; valor: number }[]) => {
    update((s) => ({
      ...s,
      finance: s.finance.map((x) =>
        x.id === f.id ? { ...x, rateio: partes.map((p) => ({ ...p, pago: false })) } : x,
      ),
    }));
    setRateioEntry(null);
  };

  const pagarParte = (f: FinanceEntry, idx: number) => {
    update((s) => ({
      ...s,
      finance: s.finance.map((x) => {
        if (x.id !== f.id || !x.rateio) return x;
        const rateio = x.rateio.map((p, i) => (i === idx ? { ...p, pago: true } : p));
        if (rateio.every((p) => p.pago)) return { ...x, rateio, status: 'Pago' as const };
        return { ...x, rateio };
      }),
    }));
  };

  const oculto = state.ocultarValores;

  return (
    <div className="space-y-4">
      <PageTitle title="Financeiro" subtitle="Boletos, contas extras, multas e rateio entre moradores" />

      {entries.length === 0 && (
        <EmptyState icon={<Barcode size={32} />} title="Nenhum lançamento" subtitle="Você está em dia." />
      )}

      {entries.map((f) => (
        <Card key={f.id} className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={f.tipo === 'Multa' ? 'red' : f.tipo === 'Conta Extra' ? 'amber' : 'orange'}>
                  {f.tipo}
                </Badge>
                <Badge tone={toneStatus(f.status)}>{f.status}</Badge>
              </div>
              <p className="mt-2 font-semibold text-strong">{f.descricao}</p>
              <p className="text-sm text-muted">Vence em {formatData(f.vencimento)}</p>
            </div>
            <p className="shrink-0 text-lg font-extrabold text-strong">
              {oculto ? '••••••' : formatBRL(f.valor)}
            </p>
          </div>

          <button
            onClick={() => copiar(f.codigo)}
            className="inset mt-3 flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs text-muted hover:text-strong"
            aria-label="Copiar código de pagamento"
          >
            <span className="truncate font-mono">{f.codigo}</span>
            {copiado === f.codigo ? (
              <Check size={14} className="shrink-0 text-green-600" />
            ) : (
              <Copy size={14} className="shrink-0" />
            )}
          </button>
          {copiado === f.codigo && <p className="mt-1 text-xs text-green-600">Código copiado!</p>}

          {f.rateio && (
            <div className="inset mt-3 rounded-xl p-3">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted">
                <Users size={13} /> Rateio entre moradores
              </p>
              <div className="space-y-1.5">
                {f.rateio.map((p, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-body">{p.nome}</span>
                    <span className="flex items-center gap-2">
                      <span className="font-semibold text-strong">{oculto ? '•••' : formatBRL(p.valor)}</span>
                      {p.pago ? (
                        <Badge tone="green">Pago</Badge>
                      ) : (
                        <button
                          onClick={() => pagarParte(f, i)}
                          className="rounded-full px-2 py-0.5 text-xs font-semibold"
                          style={{ background: 'rgba(254, 78, 2, 0.14)', color: '#FE4E02' }}
                        >
                          Marcar pago
                        </button>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            {f.status !== 'Pago' && (
              <Button onClick={() => pagar(f)}>Marcar como pago</Button>
            )}
            {f.status !== 'Pago' && moradoresUnidade.length > 1 && !f.rateio && (
              <Button variant="secondary" onClick={() => setRateioEntry(f)}>
                <Users size={15} /> Dividir com a unidade
              </Button>
            )}
          </div>
        </Card>
      ))}

      <RateioModal
        entry={rateioEntry}
        moradores={moradoresUnidade}
        onClose={() => setRateioEntry(null)}
        onConfirm={dividir}
      />
    </div>
  );
}

function RateioModal({
  entry,
  moradores,
  onClose,
  onConfirm,
}: {
  entry: FinanceEntry | null;
  moradores: Resident[];
  onClose: () => void;
  onConfirm: (f: FinanceEntry, partes: { nome: string; valor: number }[]) => void;
}) {
  const { state } = useStore();
  const [modo, setModo] = useState<'igual' | 'manual'>('igual');
  const [valores, setValores] = useState<Record<string, string>>({});
  const [selecionados, setSelecionados] = useState<Record<string, boolean>>({});
  const oculto = state.ocultarValores;

  if (!entry) return null;

  const ativos = moradores.filter((m) => selecionados[m.id] !== false);
  const total = ativos.length;

  const parteDe = (m: (typeof moradores)[number]) => {
    if (modo === 'igual') return entry.valor / Math.max(1, total);
    const v = parseFloat(valores[m.id] || '0');
    return isNaN(v) ? 0 : v;
  };
  const somaManual = ativos.reduce((acc, m) => acc + parteDe(m), 0);
  const valido = modo === 'igual' ? true : Math.abs(somaManual - entry.valor) < 0.01;

  return (
    <Modal open onClose={onClose} title="Dividir despesa">
      <p className="mb-1 text-sm text-muted">{entry.descricao}</p>
      <p className="mb-4 text-lg font-extrabold text-strong">{formatBRL(entry.valor)}</p>

      <div className="inset mb-4 flex rounded-xl p-1">
        {(['igual', 'manual'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setModo(m)}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold ${
              modo === m ? 'bg-[#FE4E02] text-[rgba(255,255,255,0.9)]' : 'text-muted'
            }`}
          >
            {m === 'igual' ? 'Divisão igual' : 'Valores personalizados'}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {moradores.map((m) => (
          <div key={m.id} className="inset flex items-center gap-3 rounded-xl p-3">
            <input
              type="checkbox"
              checked={selecionados[m.id] !== false}
              onChange={(e) => setSelecionados((s) => ({ ...s, [m.id]: e.target.checked }))}
              className="h-4 w-4 accent-[#FE4E02]"
              aria-label={`Incluir ${m.nome}`}
            />
            <span className="min-w-0 flex-1 truncate text-sm font-medium text-strong">
              {m.nome} {m.sobrenome}
            </span>
            {modo === 'manual' && selecionados[m.id] !== false ? (
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                value={valores[m.id] || ''}
                onChange={(e) => setValores((s) => ({ ...s, [m.id]: e.target.value }))}
                className="inset w-24 rounded-lg border border-soft px-2 py-1.5 text-right text-sm text-strong"
                aria-label={`Valor de ${m.nome}`}
                placeholder="0,00"
              />
            ) : (
              selecionados[m.id] !== false && (
                <span className="text-sm font-semibold text-strong">
                  {oculto ? '•••' : formatBRL(entry.valor / Math.max(1, total))}
                </span>
              )
            )}
          </div>
        ))}
      </div>

      {modo === 'manual' && (
        <p className={`mt-2 text-xs ${valido ? 'text-green-600' : 'text-[#C8321E]'}`}>
          {valido
            ? 'Valores conferem com o total.'
            : `Soma atual: ${formatBRL(somaManual)} — ajuste para ${formatBRL(entry.valor)}.`}
        </p>
      )}

      <div className="mt-4 flex gap-2">
        <Button variant="secondary" className="flex-1" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          className="flex-1"
          disabled={!valido || total === 0}
          onClick={() =>
            onConfirm(
              entry,
              ativos.map((m) => ({ nome: `${m.nome} ${m.sobrenome}`, valor: parteDe(m) })),
            )
          }
        >
          Confirmar divisão
        </Button>
      </div>
    </Modal>
  );
}
