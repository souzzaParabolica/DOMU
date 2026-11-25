import { useState } from 'react';
import { Receipt, Plus, Gavel } from 'lucide-react';
import { useStore } from '../store';
import { Card, Badge, Button, Modal, PageTitle, Input } from '../components/ui';
import { formatBRL, formatData, gerarCodigoBoleto } from '../lib/format';
import type { FinanceEntry } from '../types';

export default function EmitirBoletos() {
  const { state, update, notify } = useStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    residentId: '',
    tipo: 'Taxa Condominial',
    descricao: '',
    valor: '',
    vencimento: '',
  });

  const residentSel = state.residents.find((r) => r.id === form.residentId);

  const lancamentos = [...state.finance]
    .sort((a, b) => (a.criadoEm < b.criadoEm ? 1 : -1))
    .slice(0, 12);

  const emitir = () => {
    if (!residentSel || !form.valor) return;
    const entry: FinanceEntry = {
      id: `f-${Date.now()}`,
      unidadeId: residentSel.unidadeId,
      residentId: residentSel.id,
      tipo: form.tipo as FinanceEntry['tipo'],
      descricao: form.descricao || (form.tipo === 'Multa' ? 'Multa aplicada pelo síndico' : 'Taxa condominial'),
      valor: parseFloat(form.valor.replace(',', '.')) || 0,
      vencimento: form.vencimento || new Date().toISOString().slice(0, 10),
      status: 'Em aberto',
      codigo: gerarCodigoBoleto(),
      criadoEm: new Date().toISOString(),
    };
    update((s) => ({ ...s, finance: [...s.finance, entry] }));
    notify(state, {
      targetProfile: 'morador',
      targetUnidadeId: residentSel.unidadeId,
      titulo: entry.tipo === 'Multa' ? 'Multa aplicada' : 'Novo boleto emitido',
      corpo: `${entry.descricao} — ${formatBRL(entry.valor)}, venc. ${formatData(entry.vencimento)}.`,
    });
    setForm({ residentId: '', tipo: 'Taxa Condominial', descricao: '', valor: '', vencimento: '' });
    setModalOpen(false);
  };

  return (
    <div className="space-y-3">
      <PageTitle title="Boletos e multas" subtitle="Emitir cobranças que caem direto na fatura do morador" />
      <Button className="w-full" onClick={() => setModalOpen(true)}>
        <Plus size={16} /> Emitir boleto / aplicar multa
      </Button>

      <div className="space-y-2">
        {lancamentos.map((f) => {
          const morador = state.residents.find((r) => r.id === f.residentId);
          return (
            <Card key={f.id} className="flex items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge tone={f.tipo === 'Multa' ? 'red' : 'orange'}>{f.tipo}</Badge>
                  <Badge tone={f.status === 'Pago' ? 'green' : f.status === 'Vencido' ? 'red' : 'amber'}>
                    {f.status}
                  </Badge>
                </div>
                <p className="mt-1.5 truncate font-semibold text-strong">{f.descricao}</p>
                <p className="text-sm text-muted">
                  {morador ? `Apto ${morador.apartamento} ${morador.bloco} — ${morador.nome}` : '—'} · venc.{' '}
                  {formatData(f.vencimento)}
                </p>
              </div>
              <p className="shrink-0 font-extrabold text-strong">{formatBRL(f.valor)}</p>
            </Card>
          );
        })}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Emitir cobrança">
        <div className="space-y-3">
          <Input
            label="Morador / unidade"
            value={form.residentId}
            onChange={(v) => setForm({ ...form, residentId: v })}
            options={[
              { value: '', label: 'Selecione…' },
              ...state.residents.map((r) => ({
                value: r.id,
                label: `${r.nome} ${r.sobrenome} — Apto ${r.apartamento} ${r.bloco}`,
              })),
            ]}
          />
          <Input
            label="Tipo"
            value={form.tipo}
            onChange={(v) => setForm({ ...form, tipo: v })}
            options={[
              { value: 'Taxa Condominial', label: 'Taxa Condominial' },
              { value: 'Multa', label: 'Multa' },
              { value: 'Conta Extra', label: 'Conta Extra' },
            ]}
          />
          <Input
            label={form.tipo === 'Multa' ? 'Motivo da multa' : 'Descrição'}
            value={form.descricao}
            onChange={(v) => setForm({ ...form, descricao: v })}
            placeholder={form.tipo === 'Multa' ? 'Ex.: descarte incorreto de lixo' : 'Ex.: Condomínio Dezembro/2026'}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Valor (R$)"
              type="number"
              value={form.valor}
              onChange={(v) => setForm({ ...form, valor: v })}
              placeholder="780,00"
            />
            <Input label="Vencimento" type="date" value={form.vencimento} onChange={(v) => setForm({ ...form, vencimento: v })} />
          </div>
          <Button className="w-full" onClick={emitir} disabled={!form.residentId || !form.valor}>
            <Receipt size={16} /> {form.tipo === 'Multa' ? <Gavel size={16} /> : null}
            Emitir e notificar morador
          </Button>
        </div>
      </Modal>
    </div>
  );
}
