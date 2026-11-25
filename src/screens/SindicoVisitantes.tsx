import { useState } from 'react';
import { UserPlus, ShieldCheck } from 'lucide-react';
import { useStore } from '../store';
import { Card, Badge, Button, Modal, PageTitle, Input } from '../components/ui';
import { formatData } from '../lib/format';
import type { Visitor } from '../types';

export default function SindicoVisitantes() {
  const { state, update, notify } = useStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ nome: '', documento: '', dataPrevista: '', tipo: 'Serviço', unidadeId: 'u1' });

  const administrativos = state.visitors.filter((v) => v.autorizadoPor === 'sindico');

  const cadastrar = () => {
    if (!form.nome.trim()) return;
    const v: Visitor = {
      id: `vi-${Date.now()}`,
      nome: form.nome,
      documento: form.documento || '—',
      dataPrevista: form.dataPrevista || new Date().toISOString().slice(0, 10),
      tipo: form.tipo as Visitor['tipo'],
      autorizadoPor: 'sindico',
      unidadeId: form.unidadeId,
      status: 'Autorizado',
      avulso: true,
    };
    update((s) => ({ ...s, visitors: [...s.visitors, v] }));
    notify(state, {
      targetProfile: 'portaria',
      titulo: 'Visitante administrativo autorizado',
      corpo: `${v.nome} (${v.tipo}) autorizado pela síndica para ${formatData(v.dataPrevista)}.`,
    });
    setForm({ nome: '', documento: '', dataPrevista: '', tipo: 'Serviço', unidadeId: 'u1' });
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
      <PageTitle title="Visitantes e prestadores" subtitle="Autorizações administrativas do condomínio" />
      <Button className="w-full" onClick={() => setModalOpen(true)}>
        <UserPlus size={16} /> Autorizar visitante
      </Button>

      {administrativos.length === 0 && (
        <p className="py-6 text-center text-sm text-muted">Nenhuma autorização administrativa ativa.</p>
      )}
      {administrativos.map((v) => (
        <Card key={v.id} className="flex items-center justify-between gap-3 p-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={v.status === 'Autorizado' ? 'green' : 'red'}>{v.status}</Badge>
              <Badge tone="orange">{v.tipo}</Badge>
            </div>
            <p className="mt-1.5 font-semibold text-strong">{v.nome}</p>
            <p className="text-sm text-muted">
              {formatData(v.dataPrevista)} · Doc {v.documento}
            </p>
          </div>
          {v.status === 'Autorizado' && (
            <Button variant="danger" onClick={() => revogar(v.id)}>
              <ShieldCheck size={15} /> Revogar
            </Button>
          )}
        </Card>
      ))}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Autorizar visitante administrativo">
        <div className="space-y-3">
          <Input label="Nome" value={form.nome} onChange={(v) => setForm({ ...form, nome: v })} required />
          <Input label="Documento" value={form.documento} onChange={(v) => setForm({ ...form, documento: v })} />
          <Input
            label="Tipo"
            value={form.tipo}
            onChange={(v) => setForm({ ...form, tipo: v })}
            options={[
              { value: 'Serviço', label: 'Prestador de serviço' },
              { value: 'Delivery', label: 'Delivery' },
              { value: 'Visita social', label: 'Visita social' },
            ]}
          />
          <Input
            label="Unidade relacionada"
            value={form.unidadeId}
            onChange={(v) => setForm({ ...form, unidadeId: v })}
            options={['u1', 'u2', 'u3', 'u4'].map((id) => {
              const u = state.residents.find((r) => r.unidadeId === id);
              const label = u ? `Apto ${u.apartamento} ${u.bloco}` : id;
              return { value: id, label };
            })}
          />
          <Input
            label="Data prevista"
            type="date"
            value={form.dataPrevista}
            onChange={(v) => setForm({ ...form, dataPrevista: v })}
          />
          <Button className="w-full" onClick={cadastrar} disabled={!form.nome.trim()}>
            Autorizar e avisar portaria
          </Button>
        </div>
      </Modal>
    </div>
  );
}
