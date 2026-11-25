import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

export function Card({
  children,
  className = '',
  onClick,
  hover = false,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}) {
  const clickable = onClick !== undefined;
  return (
    <div
      className={`domu-card ${hover ? 'domu-card-hover' : ''} ${clickable ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
      onKeyDown={clickable ? (e) => e.key === 'Enter' && onClick() : undefined}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
    >
      {children}
    </div>
  );
}

export function DecorIcon({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return (
    <div
      className="domu-decor"
      style={{ background: light ? 'rgba(255,255,255,0.1)' : 'var(--bg-inset)' }}
      aria-hidden="true"
    >
      <span style={{ opacity: light ? 0.5 : 0.35 }}>{children}</span>
    </div>
  );
}

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'orange' | 'green' | 'red' | 'amber';
}) {
  const tones: Record<string, string> = {
    neutral: 'var(--bg-inset)',
    orange: 'rgba(254, 78, 2, 0.14)',
    green: 'rgba(34, 140, 74, 0.14)',
    red: 'rgba(200, 50, 30, 0.14)',
    amber: 'rgba(200, 150, 20, 0.16)',
  };
  const text: Record<string, string> = {
    neutral: 'var(--text-muted)',
    orange: '#EA5C29',
    green: '#228C4A',
    red: '#C8321E',
    amber: '#9A6E00',
  };
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold"
      style={{ background: tones[tone], color: text[tone] }}
    >
      {children}
    </span>
  );
}

export function Input({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  options,
  required = false,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  options?: { value: string; label: string }[];
  required?: boolean;
}) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1 block text-sm font-medium text-body">
          {label}
          {required && <span className="text-[#EA5C29]"> *</span>}
        </span>
      )}
      {options ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          className="inset w-full rounded-xl border border-soft px-3 py-2.5 text-sm text-strong outline-none"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className="inset w-full rounded-xl border border-soft px-3 py-2.5 text-sm text-strong placeholder:text-muted outline-none"
        />
      )}
    </label>
  );
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  type = 'button',
  className = '',
  disabled = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  type?: 'button' | 'submit';
  className?: string;
  disabled?: boolean;
}) {
  const styles: Record<string, string> = {
    primary: 'bg-[#FE4E02] text-[rgba(255,255,255,0.9)] hover:bg-[#EA5C29]',
    secondary: 'surface-soft text-strong hover:bg-[rgba(254,78,2,0.12)]',
    ghost: 'text-muted hover:text-strong',
    danger: 'bg-[rgba(200,50,30,0.14)] text-[#C8321E] hover:bg-[rgba(200,50,30,0.24)]',
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 disabled:opacity-50 ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      style={{ background: 'rgba(1, 1, 1, 0.5)' }}
    >
      <div
        ref={ref}
        className="surface max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-t-2xl p-5 sm:rounded-2xl"
        style={{ background: 'var(--bg-page)' }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-strong">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="inset rounded-full p-2 text-muted hover:text-strong"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function EmptyState({ icon, title, subtitle }: { icon: ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-10 text-center">
      <div className="inset rounded-2xl p-4 text-muted" style={{ opacity: 0.7 }}>
        {icon}
      </div>
      <p className="font-semibold text-strong">{title}</p>
      {subtitle && <p className="max-w-xs text-sm text-muted">{subtitle}</p>}
    </div>
  );
}

export function PageTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-xl font-bold text-strong">{title}</h2>
      {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
    </div>
  );
}
