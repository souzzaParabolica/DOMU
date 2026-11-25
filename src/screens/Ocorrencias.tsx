import { useState } from 'react';
import { AlertCircle, Plus } from 'lucide-react';
import { useStore } from '../store';
import { Card, Badge, Button, Modal, EmptyState, PageTitle, Input } from '../components/ui';
import { formatDataHora } from '../lib/format';
import type { Occurrence } from '../types';

const VAZIO = { categoria: 'Barulho', titulo: '', descricao: '' };

export default function Ocorrencias() {
  const { state, update, notify } = useStore();
  const eu = state.residents.find((r) => r.id === state.moradorAtualId);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(VAZIO);

  const minhas = state.occurrences
    .filter((o) => o.unidadeId === eu?.unidadeId)
    .sort((a, b) => (a.criadoEm < b.criadoEm ? 1 : -1));

  const abrir = () => {
    setForm(VAZIO);
    setModalOpen(true);
  };

  const registrar = () => {
    if (!form.titulo.trim() || !eu) return;
    const o: Occurrence = {
      id: `o-${Date.now()}`,
      unidadeId: eu.unidadeId,
      residentId: eu.id,
      categoria: form.categoria as Occurrence['categoria'],
      titulo: form.titulo,
      descricao: form.descricao,
      criadoEm: new Date().toISOString(),
      status: 'Aberta',
    };
    update((s) => ({ ...s, occurrences: [...s.occurrences, o] }));
    notify(state, {
      targetProfile: 'sindico',
      titulo: 'Nova ocorrência',
      corpo: `${o.categoria}: ${o.titulo} — Apto ${eu.apartamento} ${eu.bloco}.`,
    });
    setModalOpen(false);
  };

  const tone = (s: Occurrence['status']) =>
    s === 'Resolvida' ? 'green' : s === 'Em andamento' ? 'amber' : 'red';

  return (
    <div className="space-y-3">
      <PageTitle title="Ocorrências e Reclamações" subtitle="Registre chamados e acompanhe as respostas" />
      <Button className="w-full" onClick={abrir}>
        <Plus size={16} /> Registrar ocorrência
      </Button>

      {minhas.length === 0 && (
        <EmptyState icon={<AlertCircle size={32} />} title="Nenhuma ocorrência registrada" />
      )}
      {minhas.map((o) => (
        <Card key={o.id} className="p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="orange">{o.categoria}</Badge>
            <Badge tone={tone(o.status)}>{o.status}</Badge>
            <span className="text-xs text-muted">{formatDataHora(o.criadoEm)}</span>
          </div>
          <p className="mt-2 font-semibold text-strong">{o.titulo}</p>
          <p className="text-sm text-body">{o.descricao}</p>
          {o.resposta && (
            <div className="inset mt-3 rounded-xl p-3">
              <p className="text-xs font-bold uppercase tracking-wide text-muted">Resposta do síndico</p>
              <p className="mt-1 text-sm text-body">{o.resposta}</p>
            </div>
          )}
        </Card>
      ))}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Registrar ocorrência">
        <div className="space-y-3">
          <Input
            label="Categoria"
            value={form.categoria}
            onChange={(v) => setForm({ ...form, categoria: v })}
            options={[
              { value: 'Barulho', label: 'Barulho' },
              { value: 'Manutenção', label: 'Manutenção' },
              { value: 'Segurança', label: 'Segurança' },
              { value: 'Sugestão', label: 'Sugestão' },
            ]}
          />
          <Input label="Título" value={form.titulo} onChange={(v) => setForm({ ...form, titulo: v })} required />
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-body">Descrição</span>
            <textarea
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              rows={3}
              className="inset w-full rounded-xl border border-soft px-3 py-2.5 text-sm text-strong placeholder:text-muted outline-none"
              placeholder="Conte o que aconteceu…"
            />
          </label>
          <Button className="w-full" onClick={registrar} disabled={!form.titulo.trim()}>
            Enviar ao síndico
          </Button>
        </div>
      </Modal>
    </div>
  );
}
