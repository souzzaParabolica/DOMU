import { useState } from 'react';
import { UserPlus, Users, Ban } from 'lucide-react';
import { useStore } from '../store';
import { Card, Badge, Button, Modal, EmptyState, PageTitle, Input } from '../components/ui';
import { formatData } from '../lib/format';
import type { Visitor } from '../types';

export default function Visitantes() {
  const { state, update, notify } = useStore();
  const eu = state.residents.find((r) => r.id === state.moradorAtualId);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ nome: '', documento: '', dataPrevista: '', tipo: 'Visita social' });

  const meus = state.visitors
    .filter((v) => v.unidadeId === eu?.unidadeId)
    .sort((a, b) => (a.dataPrevista < b.dataPrevista ? 1 : -1));

  const cadastrar = () => {
    if (!form.nome.trim() || !eu) return;
    const v: Visitor = {
      id: `vi-${Date.now()}`,
      nome: form.nome,
      documento: form.documento || '—',
      dataPrevista: form.dataPrevista || new Date().toISOString().slice(0, 10),
      tipo: form.tipo as Visitor['tipo'],
      autorizadoPor: eu.id,
      unidadeId: eu.unidadeId,
      status: 'Autorizado',
    };
    update((s) => ({ ...s, visitors: [...s.visitors, v] }));
    notify(state, {
      targetProfile: 'portaria',
      titulo: 'Novo visitante autorizado',
      corpo: `${v.nome} (${v.tipo}) para Apto ${eu.apartamento} ${eu.bloco} em ${formatData(v.dataPrevista)}.`,
    });
    setForm({ nome: '', documento: '', dataPrevista: '', tipo: 'Visita social' });
    setModalOpen(false);
  };

  const revogar = (id: string) => {
    update((s) => ({
      ...s,
      visitors: s.visitors.map((v) => (v.id === id ? { ...v, status: 'Revogado' as const } : v)),
    }));
  };

  return (
    <div className="space-y-3">
      <PageTitle title="Visitantes autorizados" subtitle="Pré-autorize visitas, deliveries e serviços" />
      <Button className="w-full" onClick={() => setModalOpen(true)}>
        <UserPlus size={16} /> Autorizar visitante
      </Button>

      {meus.length === 0 && (
        <EmptyState icon={<Users size={32} />} title="Nenhum visitante cadastrado" />
      )}
      {meus.map((v) => (
        <Card key={v.id} className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={v.status === 'Autorizado' ? 'green' : 'red'}>{v.status}</Badge>
                <Badge tone="orange">{v.tipo}</Badge>
              </div>
              <p className="mt-2 font-semibold text-strong">{v.nome}</p>
              <p className="text-sm text-muted">
                Doc: {v.documento} · Previsto: {formatData(v.dataPrevista)}
              </p>
              {v.entradaEm && <p className="text-xs text-muted">Entrada registrada {formatData(v.entradaEm)}</p>}
            </div>
            {v.status === 'Autorizado' && (
              <Button variant="danger" onClick={() => revogar(v.id)} aria-label={`Revogar ${v.nome}`}>
                <Ban size={15} />
              </Button>
            )}
          </div>
        </Card>
      ))}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Autorizar visitante">
        <div className="space-y-3">
          <Input label="Nome completo" value={form.nome} onChange={(v) => setForm({ ...form, nome: v })} required />
          <Input
            label="Documento / CPF"
            value={form.documento}
            onChange={(v) => setForm({ ...form, documento: v })}
            placeholder="000.000.000-00"
          />
          <Input
            label="Data prevista"
            type="date"
            value={form.dataPrevista}
            onChange={(v) => setForm({ ...form, dataPrevista: v })}
          />
          <Input
            label="Tipo"
            value={form.tipo}
            onChange={(v) => setForm({ ...form, tipo: v })}
            options={[
              { value: 'Visita social', label: 'Visita social' },
              { value: 'Delivery', label: 'Delivery' },
              { value: 'Serviço', label: 'Serviço' },
            ]}
          />
          <Button className="w-full" onClick={cadastrar} disabled={!form.nome.trim()}>
            Autorizar
          </Button>
        </div>
      </Modal>
    </div>
  );
}
