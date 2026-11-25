import { useState } from 'react';
import { Plus, Pencil, Search, Phone, Car } from 'lucide-react';
import { useStore } from '../store';
import { Card, Badge, Button, Modal, EmptyState, PageTitle, Input } from '../components/ui';
import { formatData } from '../lib/format';
import type { Resident } from '../types';

const VAZIO = {
  nome: '',
  sobrenome: '',
  nascimento: '',
  cpf: '',
  bloco: 'T-A',
  apartamento: '',
  telefone: '',
  vaga: '',
};

export default function GestaoMoradores() {
  const { state, update } = useStore();
  const [busca, setBusca] = useState('');
  const [editando, setEditando] = useState<Resident | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(VAZIO);

  const filtrados = state.residents.filter((r) => {
    const q = busca.toLowerCase();
    return (
      r.nome.toLowerCase().includes(q) ||
      r.sobrenome.toLowerCase().includes(q) ||
      r.bloco.toLowerCase().includes(q) ||
      r.apartamento.includes(q) ||
      r.cpf.includes(q)
    );
  });

  const abrirNovo = () => {
    setEditando(null);
    setForm(VAZIO);
    setModalOpen(true);
  };

  const abrirEditar = (r: Resident) => {
    setEditando(r);
    setForm({
      nome: r.nome,
      sobrenome: r.sobrenome,
      nascimento: r.nascimento,
      cpf: r.cpf,
      bloco: r.bloco,
      apartamento: r.apartamento,
      telefone: r.telefone,
      vaga: r.vaga,
    });
    setModalOpen(true);
  };

  const salvar = () => {
    if (!form.nome.trim() || !form.apartamento.trim()) return;
    const unidadeId = `u-${form.bloco}-${form.apartamento}`;
    const existente = state.residents.find(
      (r) => r.unidadeId === unidadeId || (editando && r.id === editando.id),
    );
    const unidId =
      existente?.unidadeId ?? unidadeId;

    if (editando) {
      update((s) => ({
        ...s,
        residents: s.residents.map((r) => (r.id === editando.id ? { ...r, ...form, unidadeId: unidId } : r)),
      }));
    } else {
      const novo: Resident = {
        id: `r-${Date.now()}`,
        ...form,
        avatarSeed: (form.nome[0] || '?') + (form.sobrenome[0] || ''),
        unidadeId: unidId,
      };
      update((s) => ({ ...s, residents: [...s.residents, novo] }));
    }
    setModalOpen(false);
  };

  const veiculosDe = (unidadeId: string) => state.vehicles.filter((v) => v.unidadeId === unidadeId);

  return (
    <div className="space-y-3">
      <PageTitle title="Gestão de moradores" subtitle="Cadastro completo e consulta" />
      <Button className="w-full" onClick={abrirNovo}>
        <Plus size={16} /> Novo morador
      </Button>

      <div className="inset flex items-center gap-2 rounded-xl border border-soft px-3 py-2.5">
        <Search size={16} className="shrink-0 text-muted" />
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome, apto, bloco ou CPF…"
          className="w-full bg-transparent text-sm text-strong placeholder:text-muted outline-none"
          aria-label="Buscar moradores"
        />
      </div>

      {filtrados.length === 0 && <EmptyState icon={<Search size={32} />} title="Nenhum morador encontrado" />}
      {filtrados.map((r) => (
        <Card key={r.id} className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 gap-3">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-[rgba(255,255,255,0.9)]"
                style={{ background: 'linear-gradient(135deg, #FE4E02, #EA5C29)' }}
              >
                {r.avatarSeed}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-strong">
                  {r.nome} {r.sobrenome}
                </p>
                <p className="text-sm text-muted">
                  Apto {r.apartamento} · {r.bloco} · Vaga {r.vaga || '—'}
                </p>
                <p className="text-xs text-muted">
                  Nasc. {formatData(r.nascimento)} · CPF {r.cpf}
                </p>
                <p className="flex items-center gap-1 text-xs text-muted">
                  <Phone size={11} /> {r.telefone}
                </p>
                {veiculosDe(r.unidadeId).length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {veiculosDe(r.unidadeId).map((v) => (
                      <Badge key={v.id}>
                        <Car size={10} /> {v.modelo} · {v.placa}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <Button variant="secondary" onClick={() => abrirEditar(r)} aria-label={`Editar ${r.nome}`}>
              <Pencil size={15} />
            </Button>
          </div>
        </Card>
      ))}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editando ? 'Editar morador' : 'Novo morador'}>
        <div className="space-y-3">
          <Input label="Nome" value={form.nome} onChange={(v) => setForm({ ...form, nome: v })} required />
          <Input label="Sobrenome" value={form.sobrenome} onChange={(v) => setForm({ ...form, sobrenome: v })} />
          <Input
            label="Data de nascimento"
            type="date"
            value={form.nascimento}
            onChange={(v) => setForm({ ...form, nascimento: v })}
          />
          <Input label="CPF" value={form.cpf} onChange={(v) => setForm({ ...form, cpf: v })} placeholder="000.000.000-00" />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Bloco"
              value={form.bloco}
              onChange={(v) => setForm({ ...form, bloco: v })}
              options={['T-A', 'T-B', 'T-C'].map((b) => ({ value: b, label: b }))}
            />
            <Input label="Apartamento" value={form.apartamento} onChange={(v) => setForm({ ...form, apartamento: v })} required />
          </div>
          <Input label="Telefone" value={form.telefone} onChange={(v) => setForm({ ...form, telefone: v })} placeholder="(11) 90000-0000" />
          <Input label="Vaga de garagem" value={form.vaga} onChange={(v) => setForm({ ...form, vaga: v })} placeholder="G-12" />
          <Button className="w-full" onClick={salvar} disabled={!form.nome.trim() || !form.apartamento.trim()}>
            Salvar
          </Button>
        </div>
      </Modal>
    </div>
  );
}
