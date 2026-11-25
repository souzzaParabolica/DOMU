import { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import { useStore } from '../store';
import { PageTitle } from '../components/ui';
import { formatHora } from '../lib/format';
import type { Profile, ChatMessage } from '../types';

export default function Chat({
  canal,
  titulo,
  subtitulo,
  meuPerfil,
}: {
  canal: 'chatSindicoPortaria' | 'chatSindicoMorador';
  titulo: string;
  subtitulo: string;
  meuPerfil: Profile;
}) {
  const { state, update } = useStore();
  const [texto, setTexto] = useState('');
  const fimRef = useRef<HTMLDivElement>(null);

  const mensagens: ChatMessage[] = state[canal];

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens.length]);

  const enviar = () => {
    if (!texto.trim()) return;
    const msg: ChatMessage = {
      id: `m-${Date.now()}`,
      de: meuPerfil,
      autorNome: meuPerfil === 'sindico' ? 'Regina (Síndica)' : meuPerfil === 'portaria' ? 'Portaria' : 'Morador',
      corpo: texto.trim(),
      criadoEm: new Date().toISOString(),
    };
    update((s) => ({ ...s, [canal]: [...s[canal], msg] }));
    setTexto('');
  };

  const outroNome = meuPerfil === 'sindico' ? (canal === 'chatSindicoPortaria' ? 'Portaria' : 'Morador') : 'Síndico';

  return (
    <div className="flex h-[calc(100dvh-13rem)] flex-col">
      <PageTitle title={titulo} subtitle={subtitulo} />
      <div className="surface-soft no-scrollbar flex-1 space-y-2.5 overflow-y-auto rounded-2xl p-4">
        {mensagens.length === 0 && (
          <p className="py-8 text-center text-sm text-muted">Comece a conversa com {outroNome}.</p>
        )}
        {mensagens.map((m) => {
          const meu = m.de === meuPerfil;
          return (
            <div key={m.id} className={`flex ${meu ? 'justify-end' : 'justify-start'}`}>
              <div
                className="max-w-[80%] rounded-2xl px-3.5 py-2.5"
                style={{
                  background: meu ? '#FE4E02' : 'var(--bg-surface)',
                  color: meu ? 'rgba(255,255,255,0.9)' : 'var(--text-strong)',
                  border: meu ? undefined : '1px solid var(--border-soft)',
                }}
              >
                {!meu && <p className="text-[10px] font-bold uppercase tracking-wide text-muted">{m.autorNome}</p>}
                <p className="text-sm">{m.corpo}</p>
                <p className="mt-0.5 text-right text-[10px]" style={{ opacity: 0.7 }}>
                  {formatHora(m.criadoEm)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={fimRef} />
      </div>
      <div className="mt-3 flex gap-2">
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && enviar()}
          placeholder={`Mensagem para ${outroNome}…`}
          aria-label={`Mensagem para ${outroNome}`}
          className="inset flex-1 rounded-xl border border-soft px-3.5 py-2.5 text-sm text-strong placeholder:text-muted outline-none"
        />
        <button
          onClick={enviar}
          aria-label="Enviar mensagem"
          disabled={!texto.trim()}
          className="rounded-xl bg-[#FE4E02] p-3 text-[rgba(255,255,255,0.9)] hover:bg-[#EA5C29] disabled:opacity-50"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
