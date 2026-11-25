# Project memory

## Product intent & audience

- **DOMU** — condomínio/property management web app (Portuguese-language UI).
- Multi-role profiles; confirmed role: **Portaria** (porter desk/front desk).
- Modules: Entregas, Reservas, Financeiro, Painel, Ocorrências, Boletos, Portaria, Visitantes, Consulta, plus "Mais" overflow.
- Designed for production use across desktop and mobile.

## Brand personality & voice

- Portuguese (pt-BR) interface and communications.
- Practical, utility-focused admin tool; concise labels and action buttons.

## Visual design & UX direction

- **Stack:** Vite + React (JSX), Tailwind CSS, React hooks, Lucide React icons; `@/` alias → `src/`.
- **Icons:** each navbar tab must have a unique Lucide icon (no duplicates); no icon beside the "DOMU" brand title.
- **Header:** compact on mobile; contains theme toggle (light/dark) and notifications. Notification panel and profile menu must be width-constrained to viewport on small screens.
- **Navbar:** tabbed navigation with icon + label; includes a "Mais" overflow item.
- **Portaria dashboard:** card-based summary (encomendas aguardando, visitantes no condomínio, reservas ativas, ocorrências abertas), pending deliveries list, and quick-action shortcuts.
- **Mobile-first fixes applied:** header layout, dropdown/drawer widths, touch-friendly restore-demo and logout actions.

## Decisions, constraints & rationale

- No UI theme/icon packages beyond Tailwind + Lucide React unless explicitly requested.
- **Auth state:** logout returns to login screen; selecting a profile re-enters directly. "Deslogado" state must not be persisted — root cause of the relogin bug.
- **Restore demo data:** clears all state, reloads original seed data, returns to login screen; must work on touch (mobile) and click.
- Active tab resets when switching profiles.
- Build must pass with no errors after changes.

## Open questions & assumptions

- Full list of user roles beyond Portaria is not yet confirmed (other profiles exist in the login selector).
- Seed/demo data structure and storage mechanism (localStorage assumed) not fully documented.
- Whether notifications are real-time or static demo data is unspecified.