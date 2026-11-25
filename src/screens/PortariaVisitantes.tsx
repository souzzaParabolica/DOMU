import { useState } from 'react';
import { Search, LogIn, LogOut, UserPlus, DoorOpen } from 'lucide-react';
import { useStore } from '../store';
import { Card, Badge, Button, Modal, PageTitle, Input } from '../components/ui';
import { formatData } from '../lib/format';
import type { Visitor } from '../types';

export default function PortariaVisitantes() {
  const { state, update, notify } = useStore();
  const [busca, setBusca] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ nome: '', documento: '', tipo: 'Visita social', unidadeId: 'u1' });

  const autorizados = state.visitors.filter(
    (v) => v.status === 'Autorizado' && !v.entradaEm && !v.saidaEm,
  );

  const filtrados = autorizados.filter((v) => {
    const q = busca.toLowerCase();
    const morador = state.residents.find((r) => r.unidadeId === v.unidadeId);
    return (
      v.nome.toLowerCase().includes(q) ||
      (morador && (morador.bloco.toLowerCase().includes(q) || morador.apartamento.includes(q)))
    );
  });

  const registrarEntrada = (v: Visitor) => {
    update((s) => ({
      ...s,
      visitors: s.visitors.map((x) =>
        x.id === v.id ? { ...x, entradaEm: new Date().toISOString() } : x,
      ),
    }));
    notify(state, {
      targetProfile: 'morador',
      targetUnidadeId: v.unidadeId,
      titulo: 'Visitante entrou',
      corpo: `${v.nome} entrou às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}.`,
    });
  };

  const registrarSaida = (v: Visitor) => {
    update((s) => ({
      ...s,
      visitors: s.visitors.map((x) =>
        x.id === v.id ? { ...x, saidaEm: new Date().toISOString() } : x,
      ),
    }));
  };

  const cadastrarAvulso = () => {
    if (!form.nome.trim()) return;
    const v: Visitor = {
      id: `vi-${Date.now()}`,
      nome: form.nome,
      documento: form.documento || '—',
      dataPrevista: new Date().toISOString().slice(0, 10),
      tipo: form.tipo as Visitor['tipo'],
      autorizadoPor: 'portaria',
      unidadeId: form.unidadeId,
      status: 'Autorizado',
      avulso: true,
      entradaEm: new Date().toISOString(),
    };
    update((s) => ({ ...s, visitors: [...s.visitors, v] }));
    setForm({ nome: '', documento: '', tipo: 'Visita social', unidadeId: 'u1' });
    setModalOpen(false);
  };

  const unidades = [...new Set(state.residents.map((r) => r.unidadeId))];

  return (
    <div className="space-y-3">
      <PageTitle title="Controle de visitantes" subtitle="Entrada, saída e cadastro avulso" />
      <Button className="w-full" onClick={() => setModalOpen(true)}>
        <UserPlus size={16} /> Cadastrar visitante avulso
      </Button>

      <div className="inset flex items-center gap-2 rounded-xl border border-soft px-3 py-2.5">
        <Search size={16} className="shrink-0 text-muted" />
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Filtrar por nome ou unidade…"
          className="w-full bg-transparent text-sm text-strong placeholder:text-muted outline-none"
          aria-label="Filtrar visitantes"
        />
      </div>

      {filtrados.length === 0 && (
        <p className="py-6 text-center text-sm text-muted">Nenhum visitante pré-autorizado encontrado.</p>
      )}
      {filtrados.map((v) => {
        const morador = state.residents.find((r) => r.unidadeId === v.unidadeId);
        return (
          <Card key={v.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={v.avulso ? 'amber' : 'green'}>{v.avulso ? 'Avulso' : 'Pré-autorizado'}</Badge>
                  <Badge tone="orange">{v.tipo}</Badge>
                </div>
                <p className="mt-2 font-semibold text-strong">{v.nome}</p>
                <p className="text-sm text-muted">
                  {morador ? `Apto ${morador.apartamento} ${morador.bloco}` : '—'} · Doc {v.documento}
                </p>
                <p className="text-xs text-muted">
                  Previsto: {formatData(v.dataPrevista)}
                  {v.entradaEm && !v.saidaEm && ' · DENTRO do condomínio'}
                  {v.saidaEm && ' · Saída registrada'}
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                {!v.entradaEm && (
                  <Button onClick={() => registrarEntrada(v)} aria-label={`Entrada de ${v.nome}`}>
                    <LogIn size={15} />
                  </Button>
                )}
                {v.entradaEm && !v.saidaEm && (
                  <Button variant="secondary" onClick={() => registrarSaida(v)} aria-label={`Saída de ${v.nome}`}>
                    <LogOut size={15} />
                  </Button>
                )}
              </div>
            </div>
          </Card>
        );
      })}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Visitante avulso">
        <div className="space-y-3">
          <Input label="Nome" value={form.nome} onChange={(v) => setForm({ ...form, nome: v })} required />
          <Input label="Documento" value={form.documento} onChange={(v) => setForm({ ...form, documento: v })} />
          <Input
            label="Tipo"
            value={form.tipo}
            onChange={(v) => setForm({ ...form, tipo: v })}
            options={['Visita social', 'Delivery', 'Serviço'].map((t) => ({ value: t, label: t }))}
          />
          <Input
            label="Unidade de destino"
            value={form.unidadeId}
            onChange={(v) => setForm({ ...form, unidadeId: v })}
            options={unidades.map((id) => {
              const u = state.residents.find((r) => r.unidadeId === id);
              return { value: id, label: u ? `Apto ${u.apartamento} ${u.bloco}` : id };
            })}
          />
          <Button className="w-full" onClick={cadastrarAvulso} disabled={!form.nome.trim()}>
            <DoorOpen size={16} /> Cadastrar com entrada agora
          </Button>
        </div>
      </Modal>
    </div>
  );
}
