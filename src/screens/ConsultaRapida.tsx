import { useState } from 'react';
import { Search, Phone, Car, User } from 'lucide-react';
import { useStore } from '../store';
import { Card, Badge, PageTitle, EmptyState } from '../components/ui';

export default function ConsultaRapida() {
  const { state } = useStore();
  const [busca, setBusca] = useState('');

  const q = busca.toLowerCase().trim();

  const moradores = q
    ? state.residents.filter(
        (r) =>
          r.nome.toLowerCase().includes(q) ||
          r.sobrenome.toLowerCase().includes(q) ||
          r.apartamento.includes(q) ||
          r.bloco.toLowerCase().includes(q) ||
          r.vaga.toLowerCase().includes(q),
      )
    : state.residents;

  const veiculos = q
    ? state.vehicles.filter(
        (v) =>
          v.placa.toLowerCase().includes(q) ||
          v.modelo.toLowerCase().includes(q) ||
          v.cor.toLowerCase().includes(q),
      )
    : [];

  return (
    <div className="space-y-3">
      <PageTitle title="Consulta rápida" subtitle="Moradores e veículos por nome, apto ou placa" />

      <div className="inset flex items-center gap-2 rounded-xl border border-soft px-3 py-3">
        <Search size={18} className="shrink-0 text-muted" />
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Ex.: 12, Cauê, FQR-2A31…"
          className="w-full bg-transparent text-sm text-strong placeholder:text-muted outline-none"
          aria-label="Buscar morador ou veículo"
          autoFocus
        />
      </div>

      {q && veiculos.length > 0 && (
        <>
          <p className="text-sm font-bold uppercase tracking-wide text-muted">Veículos</p>
          {veiculos.map((v) => {
            const morador = state.residents.find((r) => r.unidadeId === v.unidadeId);
            return (
              <Card key={v.id} className="p-4">
                <div className="flex items-center gap-3">
                  <span className="inset rounded-xl p-2.5 text-muted">
                    <Car size={20} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-mono font-bold text-strong">{v.placa}</p>
                    <p className="text-sm text-muted">
                      {v.modelo} · {v.cor} · vaga {v.vaga}
                    </p>
                    <p className="text-xs text-muted">
                      {morador ? `${morador.nome} — Apto ${morador.apartamento} ${morador.bloco} · ${morador.telefone}` : '—'}
                    </p>
                  </div>
                  <Badge tone="green">Autorizado</Badge>
                </div>
              </Card>
            );
          })}
        </>
      )}

      <p className="text-sm font-bold uppercase tracking-wide text-muted">Moradores</p>
      {moradores.length === 0 && <EmptyState icon={<Search size={32} />} title="Nada encontrado" subtitle="Tente nome, apartamento, bloco, vaga ou placa." />}
      {moradores.map((r) => {
        const veics = state.vehicles.filter((v) => v.unidadeId === r.unidadeId);
        return (
          <Card key={r.id} className="p-4">
            <div className="flex items-start gap-3">
              <span className="inset rounded-xl p-2.5 text-muted">
                <User size={20} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-strong">
                  {r.nome} {r.sobrenome}
                </p>
                <p className="text-sm text-muted">
                  Apto {r.apartamento} · {r.bloco} · Vaga {r.vaga || '—'}
                </p>
                <p className="flex items-center gap-1 text-sm text-muted">
                  <Phone size={12} /> {r.telefone}
                </p>
                {veics.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {veics.map((v) => (
                      <Badge key={v.id}>
                        <Car size={10} /> {v.placa}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
