import { Package, Check } from 'lucide-react';
import { useStore } from '../store';
import { Card, Badge, Button, EmptyState, PageTitle } from '../components/ui';
import { formatDataHora } from '../lib/format';

export default function Encomendas() {
  const { state, update, notify } = useStore();
  const eu = state.residents.find((r) => r.id === state.moradorAtualId);

  const minhas = state.packages
    .filter((p) => p.unidadeId === eu?.unidadeId)
    .sort((a, b) => (a.chegadaEm < b.chegadaEm ? 1 : -1));

  const retirar = (id: string) => {
    const pkg = state.packages.find((p) => p.id === id);
    if (!pkg) return;
    update((s) => ({
      ...s,
      packages: s.packages.map((p) =>
        p.id === id
          ? {
              ...p,
              status: 'Retirado' as const,
              retiradoPor: `${eu?.nome} ${eu?.sobrenome}`,
              retiradoEm: new Date().toISOString(),
            }
          : p,
      ),
    }));
    notify(state, {
      targetProfile: 'portaria',
      titulo: 'Encomenda retirada',
      corpo: `${eu?.nome} retirou: ${pkg.descricao}.`,
    });
  };

  return (
    <div className="space-y-3">
      <PageTitle title="Minhas encomendas" subtitle="Acompanhe entregas e confirme retiradas" />
      {minhas.length === 0 && (
        <EmptyState icon={<Package size={32} />} title="Nenhuma encomenda registrada" />
      )}
      {minhas.map((p) => (
        <Card key={p.id} className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Badge tone={p.status === 'Aguardando retirada' ? 'orange' : 'green'}>{p.status}</Badge>
              <p className="mt-2 font-semibold text-strong">{p.descricao}</p>
              <p className="text-sm text-muted">{p.transportadora}</p>
              <p className="mt-1 text-xs text-muted">
                Chegou em {formatDataHora(p.chegadaEm)}
                {p.retiradoEm && ` · Retirado em ${formatDataHora(p.retiradoEm)} por ${p.retiradoPor}`}
              </p>
            </div>
            <Package
              size={36}
              className="shrink-0"
              style={{ color: p.status === 'Aguardando retirada' ? '#FE4E02' : 'var(--text-muted)', opacity: 0.5 }}
            />
          </div>
          {p.status === 'Aguardando retirada' && (
            <Button className="mt-3 w-full" onClick={() => retirar(p.id)}>
              <Check size={16} /> Confirmar retirada
            </Button>
          )}
        </Card>
      ))}
    </div>
  );
}
