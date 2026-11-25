import { useState } from 'react';
import { Car, Plus, Pencil, Trash2 } from 'lucide-react';
import { useStore } from '../store';
import { Card, Badge, Button, Modal, EmptyState, PageTitle, Input } from '../components/ui';
import type { Vehicle } from '../types';

const VAZIO = { modelo: '', cor: '', placa: '', tipo: 'Carro', vaga: '' };

export default function Veiculos() {
  const { state, update } = useStore();
  const eu = state.residents.find((r) => r.id === state.moradorAtualId);
  const [editando, setEditando] = useState<Vehicle | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(VAZIO);

  const meus = state.vehicles.filter((v) => v.unidadeId === eu?.unidadeId);

  const abrirNovo = () => {
    setEditando(null);
    setForm(VAZIO);
    setModalOpen(true);
  };

  const abrirEditar = (v: Vehicle) => {
    setEditando(v);
    setForm({ modelo: v.modelo, cor: v.cor, placa: v.placa, tipo: v.tipo, vaga: v.vaga });
    setModalOpen(true);
  };

  const salvar = () => {
    if (!form.modelo.trim() || !eu) return;
    if (editando) {
      update((s) => ({
        ...s,
        vehicles: s.vehicles.map((v) => (v.id === editando.id ? { ...v, ...form, tipo: form.tipo as Vehicle['tipo'] } : v)),
      }));
    } else {
      const novo: Vehicle = {
        id: `v-${Date.now()}`,
        unidadeId: eu.unidadeId,
        ...form,
        tipo: form.tipo as Vehicle['tipo'],
      };
      update((s) => ({ ...s, vehicles: [...s.vehicles, novo] }));
    }
    setModalOpen(false);
  };

  const excluir = (id: string) => {
    update((s) => ({ ...s, vehicles: s.vehicles.filter((v) => v.id !== id) }));
  };

  return (
    <div className="space-y-3">
      <PageTitle title="Meus veículos" subtitle={`Vinculados à unidade ${eu?.apartamento} ${eu?.bloco}`} />
      <Button className="w-full" onClick={abrirNovo}>
        <Plus size={16} /> Cadastrar veículo
      </Button>

      {meus.length === 0 && <EmptyState icon={<Car size={32} />} title="Nenhum veículo cadastrado" />}
      {meus.map((v) => (
        <Card key={v.id} className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Badge tone="orange">{v.tipo}</Badge>
                <Badge>vaga {v.vaga}</Badge>
              </div>
              <p className="mt-2 font-semibold text-strong">
                {v.modelo} · {v.cor}
              </p>
              <p className="font-mono text-sm text-muted">{v.placa}</p>
            </div>
            <div className="flex shrink-0 gap-1">
              <Button variant="secondary" onClick={() => abrirEditar(v)} aria-label={`Editar ${v.modelo}`}>
                <Pencil size={15} />
              </Button>
              <Button variant="danger" onClick={() => excluir(v.id)} aria-label={`Excluir ${v.modelo}`}>
                <Trash2 size={15} />
              </Button>
            </div>
          </div>
        </Card>
      ))}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editando ? 'Editar veículo' : 'Novo veículo'}>
        <div className="space-y-3">
          <Input label="Modelo" value={form.modelo} onChange={(v) => setForm({ ...form, modelo: v })} required />
          <Input label="Cor" value={form.cor} onChange={(v) => setForm({ ...form, cor: v })} />
          <Input
            label="Placa"
            value={form.placa}
            onChange={(v) => setForm({ ...form, placa: v.toUpperCase() })}
            placeholder="ABC-1D23"
          />
          <Input
            label="Tipo"
            value={form.tipo}
            onChange={(v) => setForm({ ...form, tipo: v })}
            options={[
              { value: 'Carro', label: 'Carro' },
              { value: 'Moto', label: 'Moto' },
            ]}
          />
          <Input label="Número da vaga" value={form.vaga} onChange={(v) => setForm({ ...form, vaga: v })} placeholder="G-12" />
          <Button className="w-full" onClick={salvar} disabled={!form.modelo.trim()}>
            Salvar
          </Button>
        </div>
      </Modal>
    </div>
  );
}
