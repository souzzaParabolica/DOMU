import { useState } from 'react';
import { PackagePlus, PackageCheck, Package } from 'lucide-react';
import { useStore } from '../store';
import { Card, Badge, Button, Modal, PageTitle, Input, EmptyState } from '../components/ui';
import { formatDataHora } from '../lib/format';
import type { Package_ } from '../types';

export default function PortariaEncomendas() {
  const { state, update, notify } = useStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [baixa, setBaixa] = useState<Package_ | null>(null);
  const [quemRetirou, setQuemRetirou] = useState('');
  const [form, setForm] = useState({ residentId: '', descricao: '', transportadora: '', observacao: '' });

  const aguardando = state.packages.filter((p) => p.status === 'Aguardando retirada');
  const retiradas = state.packages.filter((p) => p.status === 'Retirado').slice(0, 5);

  const registrar = () => {
    const r = state.residents.find((x) => x.id === form.residentId);
    if (!r || !form.descricao.trim()) return;
    const pkg: Package_ = {
      id: `p-${Date.now()}`,
      unidadeId: r.unidadeId,
      residentId: r.id,
      descricao: form.descricao,
      transportadora: form.transportadora || '—',
      observacao: form.observacao,
      chegadaEm: new Date().toISOString(),
      status: 'Aguardando retirada',
    };
    update((s) => ({ ...s, packages: [...s.packages, pkg] }));
    notify(state, {
      targetProfile: 'morador',
      targetUnidadeId: r.unidadeId,
      titulo: 'Encomenda chegou',
      corpo: `${pkg.transportadora}: ${pkg.descricao} aguardando na portaria.`,
    });
    setForm({ residentId: '', descricao: '', transportadora: '', observacao: '' });
    setModalOpen(false);
  };

  const confirmarBaixa = () => {
    if (!baixa || !quemRetirou.trim()) return;
    update((s) => ({
      ...s,
      packages: s.packages.map((p) =>
        p.id === baixa.id
          ? { ...p, status: 'Retirado' as const, retiradoPor: quemRetirou, retiradoEm: new Date().toISOString() }
          : p,
      ),
    }));
    notify(state, {
      targetProfile: 'morador',
      targetUnidadeId: baixa.unidadeId,
      titulo: 'Encomenda retirada',
      corpo: `${baixa.descricao} retirada por ${quemRetirou}.`,
    });
    setBaixa(null);
    setQuemRetirou('');
  };

  return (
    <div className="space-y-3">
      <PageTitle title="Encomendas" subtitle={`${aguardando.length} aguardando retirada`} />
      <Button className="w-full" onClick={() => setModalOpen(true)}>
        <PackagePlus size={16} /> Registrar chegada
      </Button>

      {aguardando.length === 0 && (
        <EmptyState icon={<Package size={32} />} title="Nenhuma encomenda aguardando" />
      )}
      {aguardando.map((p) => {
        const morador = state.residents.find((r) => r.id === p.residentId);
        return (
          <Card key={p.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Badge tone="orange">Aguardando retirada</Badge>
                <p className="mt-2 font-semibold text-strong">{p.descricao}</p>
                <p className="text-sm text-muted">
                  {p.transportadora} · {morador ? `Apto ${morador.apartamento} ${morador.bloco} — ${morador.nome}` : '—'}
                </p>
                <p className="text-xs text-muted">
                  Chegou {formatDataHora(p.chegadaEm)}
                  {p.observacao && ` · ${p.observacao}`}
                </p>
              </div>
            </div>
            <Button
              className="mt-3 w-full"
              variant="secondary"
              onClick={() => setBaixa(p)}
            >
              <PackageCheck size={16} /> Registrar baixa / retirada
            </Button>
          </Card>
        );
      })}

      {retiradas.length > 0 && (
        <>
          <p className="pt-2 text-sm font-bold uppercase tracking-wide text-muted">Retiradas recentes</p>
          {retiradas.map((p) => (
            <Card key={p.id} className="p-4">
              <p className="font-semibold text-strong">{p.descricao}</p>
              <p className="text-sm text-muted">
                Retirado por {p.retiradoPor} em {formatDataHora(p.retiradoEm || '')}
              </p>
            </Card>
          ))}
        </>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Registrar chegada de encomenda">
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
          <Input label="Descrição" value={form.descricao} onChange={(v) => setForm({ ...form, descricao: v })} placeholder="Caixa média, envelope…" required />
          <Input label="Transportadora" value={form.transportadora} onChange={(v) => setForm({ ...form, transportadora: v })} placeholder="Amazon, Correios…" />
          <Input label="Observação" value={form.observacao} onChange={(v) => setForm({ ...form, observacao: v })} placeholder="Opcional" />
          <Button className="w-full" onClick={registrar} disabled={!form.residentId || !form.descricao.trim()}>
            Registrar e avisar morador
          </Button>
        </div>
      </Modal>

      <Modal open={baixa !== null} onClose={() => setBaixa(null)} title="Registrar retirada">
        {baixa && (
          <div className="space-y-3">
            <p className="text-sm text-muted">{baixa.descricao}</p>
            <Input label="Quem retirou" value={quemRetirou} onChange={setQuemRetirou} placeholder="Nome completo" required />
            <Button className="w-full" onClick={confirmarBaixa} disabled={!quemRetirou.trim()}>
              Confirmar baixa
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
