import { useState } from 'react';
import { CalendarDays, Plus, Pencil, Trash2 } from 'lucide-react';
import { useStore } from '../store';
import { Card, Badge, Button, Modal, EmptyState, PageTitle, Input } from '../components/ui';
import { DIAS_SEMANA } from '../lib/format';
import type { ScheduleEvent } from '../types';

const VAZIO = { diaSemana: '1', titulo: '', horario: '08:00', local: '', tipo: 'Rotina' };

export default function GerenciarProgramacao() {
  const { state, update } = useStore();
  const [editando, setEditando] = useState<ScheduleEvent | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(VAZIO);

  const ordenados = [...state.schedule].sort(
    (a, b) => a.diaSemana - b.diaSemana || a.horario.localeCompare(b.horario),
  );

  const abrirNovo = () => {
    setEditando(null);
    setForm(VAZIO);
    setModalOpen(true);
  };

  const abrirEditar = (e: ScheduleEvent) => {
    setEditando(e);
    setForm({
      diaSemana: String(e.diaSemana),
      titulo: e.titulo,
      horario: e.horario,
      local: e.local,
      tipo: e.tipo,
    });
    setModalOpen(true);
  };

  const salvar = () => {
    if (!form.titulo.trim()) return;
    const dados = {
      diaSemana: parseInt(form.diaSemana, 10),
      titulo: form.titulo,
      horario: form.horario,
      local: form.local,
      tipo: form.tipo as ScheduleEvent['tipo'],
    };
    if (editando) {
      update((s) => ({
        ...s,
        schedule: s.schedule.map((e) => (e.id === editando.id ? { ...e, ...dados } : e)),
      }));
    } else {
      update((s) => ({ ...s, schedule: [...s.schedule, { id: `s-${Date.now()}`, ...dados }] }));
    }
    setModalOpen(false);
  };

  const excluir = (id: string) => {
    update((s) => ({ ...s, schedule: s.schedule.filter((e) => e.id !== id) }));
  };

  return (
    <div className="space-y-3">
      <PageTitle title="Programação da semana" subtitle="Eventos visíveis para todos os moradores" />
      <Button className="w-full" onClick={abrirNovo}>
        <Plus size={16} /> Novo evento
      </Button>

      {ordenados.length === 0 && <EmptyState icon={<CalendarDays size={32} />} title="Nenhum evento cadastrado" />}
      {ordenados.map((e) => (
        <Card key={e.id} className="flex items-center gap-3 p-4">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-bold text-[rgba(255,255,255,0.9)]"
            style={{ background: 'linear-gradient(135deg, #FE4E02, #EA5C29)' }}
          >
            {DIAS_SEMANA[e.diaSemana]}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-strong">{e.titulo}</p>
            <p className="text-sm text-muted">
              {e.horario} · {e.local}
            </p>
          </div>
          <Badge tone={e.tipo === 'Evento' ? 'orange' : e.tipo === 'Manutenção' ? 'amber' : 'neutral'}>{e.tipo}</Badge>
          <div className="flex shrink-0 gap-1">
            <Button variant="secondary" onClick={() => abrirEditar(e)} aria-label={`Editar ${e.titulo}`}>
              <Pencil size={14} />
            </Button>
            <Button variant="danger" onClick={() => excluir(e.id)} aria-label={`Excluir ${e.titulo}`}>
              <Trash2 size={14} />
            </Button>
          </div>
        </Card>
      ))}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editando ? 'Editar evento' : 'Novo evento'}>
        <div className="space-y-3">
          <Input
            label="Dia da semana"
            value={form.diaSemana}
            onChange={(v) => setForm({ ...form, diaSemana: v })}
            options={DIAS_SEMANA.map((d, i) => ({ value: String(i), label: d }))}
          />
          <Input label="Título" value={form.titulo} onChange={(v) => setForm({ ...form, titulo: v })} required />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Horário" type="time" value={form.horario} onChange={(v) => setForm({ ...form, horario: v })} />
            <Input label="Local" value={form.local} onChange={(v) => setForm({ ...form, local: v })} placeholder="Praça central" />
          </div>
          <Input
            label="Tipo"
            value={form.tipo}
            onChange={(v) => setForm({ ...form, tipo: v })}
            options={['Rotina', 'Evento', 'Manutenção'].map((t) => ({ value: t, label: t }))}
          />
          <Button className="w-full" onClick={salvar} disabled={!form.titulo.trim()}>
            Salvar
          </Button>
        </div>
      </Modal>
    </div>
  );
}
