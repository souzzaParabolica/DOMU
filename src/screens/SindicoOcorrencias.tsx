import { useState } from 'react';
import { AlertCircle, MessageSquare } from 'lucide-react';
import { useStore } from '../store';
import { Card, Badge, Button, Modal, EmptyState, PageTitle, Input } from '../components/ui';
import { formatDataHora } from '../lib/format';
import type { Occurrence } from '../types';

export default function SindicoOcorrencias() {
  const { state, update, notify } = useStore();
  const [respondendo, setRespondendo] = useState<Occurrence | null>(null);
  const [resposta, setResposta] = useState('');
  const [novoStatus, setNovoStatus] = useState<Occurrence['status']>('Em andamento');

  const todas = [...state.occurrences].sort((a, b) => (a.criadoEm < b.criadoEm ? 1 : -1));

  const salvar = () => {
    if (!respondendo) return;
    update((s) => ({
      ...s,
      occurrences: s.occurrences.map((o) =>
        o.id === respondendo.id ? { ...o, status: novoStatus, resposta: resposta || o.resposta } : o,
      ),
    }));
    const morador = state.residents.find((r) => r.id === respondendo.residentId);
    if (morador) {
      notify(state, {
        targetProfile: 'morador',
        targetUnidadeId: morador.unidadeId,
        titulo: 'Ocorrência atualizada',
        corpo: `"${respondendo.titulo}" agora está ${novoStatus}.`,
      });
    }
    setRespondendo(null);
    setResposta('');
  };

  const abrirResposta = (o: Occurrence) => {
    setRespondendo(o);
    setNovoStatus(o.status === 'Aberta' ? 'Em andamento' : o.status);
    setResposta(o.resposta || '');
  };

  return (
    <div className="space-y-3">
      <PageTitle title="Central de ocorrências" subtitle="Chamados abertos pelos moradores" />

      {todas.length === 0 && <EmptyState icon={<AlertCircle size={32} />} title="Nenhuma ocorrência registrada" />}
      {todas.map((o) => {
        const morador = state.residents.find((r) => r.id === o.residentId);
        return (
          <Card key={o.id} className="p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="orange">{o.categoria}</Badge>
              <Badge tone={o.status === 'Resolvida' ? 'green' : o.status === 'Em andamento' ? 'amber' : 'red'}>
                {o.status}
              </Badge>
              <span className="text-xs text-muted">{formatDataHora(o.criadoEm)}</span>
            </div>
            <p className="mt-2 font-semibold text-strong">{o.titulo}</p>
            <p className="text-sm text-body">{o.descricao}</p>
            <p className="mt-1 text-xs text-muted">
              {morador ? `${morador.nome} ${morador.sobrenome} — Apto ${morador.apartamento} ${morador.bloco}` : '—'}
            </p>
            {o.resposta && (
              <div className="inset mt-3 rounded-xl p-3">
                <p className="text-xs font-bold uppercase tracking-wide text-muted">Resposta oficial</p>
                <p className="mt-1 text-sm text-body">{o.resposta}</p>
              </div>
            )}
            {o.status !== 'Resolvida' && (
              <Button className="mt-3" variant="secondary" onClick={() => abrirResposta(o)}>
                <MessageSquare size={15} /> Responder e atualizar status
              </Button>
            )}
          </Card>
        );
      })}

      <Modal open={respondendo !== null} onClose={() => setRespondendo(null)} title="Responder ocorrência">
        {respondendo && (
          <div className="space-y-3">
            <p className="text-sm text-muted">{respondendo.titulo}</p>
            <Input
              label="Novo status"
              value={novoStatus}
              onChange={(v) => setNovoStatus(v as Occurrence['status'])}
              options={[
                { value: 'Em andamento', label: 'Em andamento' },
                { value: 'Resolvida', label: 'Resolvida' },
                { value: 'Aberta', label: 'Aberta' },
              ]}
            />
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-body">Resposta oficial</span>
              <textarea
                value={resposta}
                onChange={(e) => setResposta(e.target.value)}
                rows={3}
                className="inset w-full rounded-xl border border-soft px-3 py-2.5 text-sm text-strong placeholder:text-muted outline-none"
                placeholder="Escreva a resposta que o morador verá…"
              />
            </label>
            <Button className="w-full" onClick={salvar}>
              Enviar resposta
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
