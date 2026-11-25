import { useState } from 'react';
import { Plus, Pencil, Trash2, Briefcase } from 'lucide-react';
import { useStore } from '../store';
import { Card, Badge, Button, Modal, EmptyState, PageTitle, Input } from '../components/ui';
import type { Colaborador } from '../types';

const VAZIO = { nome: '', cargo: 'Porteiro', turno: 'Manhã', cpf: '', telefone: '' };

export default function Colaboradores() {
  const { state, update } = useStore();
  const [editando, setEditando] = useState<Colaborador | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(VAZIO);

  const abrirNovo = () => {
    setEditando(null);
    setForm(VAZIO);
    setModalOpen(true);
  };

  const abrirEditar = (c: Colaborador) => {
    setEditando(c);
    setForm({ nome: c.nome, cargo: c.cargo, turno: c.turno, cpf: c.cpf, telefone: c.telefone });
    setModalOpen(true);
  };

  const salvar = () => {
    if (!form.nome.trim()) return;
    if (editando) {
      update((s) => ({
        ...s,
        colaboradores: s.colaboradores.map((c) => (c.id === editando.id ? { ...c, ...form } : c)),
      }));
    } else {
      const novo: Colaborador = { id: `c-${Date.now()}`, ...form };
      update((s) => ({ ...s, colaboradores: [...s.colaboradores, novo] }));
    }
    setModalOpen(false);
  };

  const excluir = (id: string) => {
    update((s) => ({ ...s, colaboradores: s.colaboradores.filter((c) => c.id !== id) }));
  };

  return (
    <div className="space-y-3">
      <PageTitle title="Colaboradores" subtitle="Porteiros, zeladores e equipe de limpeza" />
      <Button className="w-full" onClick={abrirNovo}>
        <Plus size={16} /> Novo colaborador
      </Button>

      {state.colaboradores.length === 0 && (
        <EmptyState icon={<Briefcase size={32} />} title="Nenhum colaborador cadastrado" />
      )}
      {state.colaboradores.map((c) => (
        <Card key={c.id} className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="orange">{c.cargo}</Badge>
                <Badge>{c.turno}</Badge>
              </div>
              <p className="mt-2 font-semibold text-strong">{c.nome}</p>
              <p className="text-xs text-muted">
                CPF {c.cpf} · {c.telefone}
              </p>
            </div>
            <div className="flex shrink-0 gap-1">
              <Button variant="secondary" onClick={() => abrirEditar(c)} aria-label={`Editar ${c.nome}`}>
                <Pencil size={15} />
              </Button>
              <Button variant="danger" onClick={() => excluir(c.id)} aria-label={`Excluir ${c.nome}`}>
                <Trash2 size={15} />
              </Button>
            </div>
          </div>
        </Card>
      ))}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editando ? 'Editar colaborador' : 'Novo colaborador'}>
        <div className="space-y-3">
          <Input label="Nome" value={form.nome} onChange={(v) => setForm({ ...form, nome: v })} required />
          <Input
            label="Cargo"
            value={form.cargo}
            onChange={(v) => setForm({ ...form, cargo: v })}
            options={['Porteiro', 'Zelador', 'Limpeza', 'Manutenção'].map((c) => ({ value: c, label: c }))}
          />
          <Input
            label="Turno"
            value={form.turno}
            onChange={(v) => setForm({ ...form, turno: v })}
            options={['Manhã', 'Tarde', 'Noite', 'Integral'].map((t) => ({ value: t, label: t }))}
          />
          <Input label="CPF" value={form.cpf} onChange={(v) => setForm({ ...form, cpf: v })} placeholder="000.000.000-00" />
          <Input label="Telefone" value={form.telefone} onChange={(v) => setForm({ ...form, telefone: v })} />
          <Button className="w-full" onClick={salvar} disabled={!form.nome.trim()}>
            Salvar
          </Button>
        </div>
      </Modal>
    </div>
  );
}
