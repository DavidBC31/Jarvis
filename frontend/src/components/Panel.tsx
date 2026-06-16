import type { ReactNode } from "react";

interface PanelProps {
  title: string;
  subtitle?: string;
  stale?: boolean;
  children: ReactNode;
  className?: string;
}

// Coque de panneau HUD : titre, liseré néon, indicateur "stale".
export function Panel({ title, subtitle, stale, children, className }: PanelProps) {
  return (
    <section
      className={`neon-border rounded-md flex flex-col min-h-0 ${className ?? ""}`}
      style={{
        background: "var(--bg-panel)",
        opacity: stale ? 0.55 : 1,
        boxShadow: "0 0 0 1px rgba(0,0,0,0.4), inset 0 0 24px rgba(0,0,0,0.35)",
      }}
    >
      <div
        className="flex items-baseline justify-between gap-2 px-3 py-2 shrink-0 border-b"
        style={{ borderColor: "var(--neon-cyan-dim, rgba(64,224,255,0.25))" }}
      >
        <h2 className="font-display text-sm tracking-[0.22em] neon-text truncate">{title}</h2>
        <div className="flex items-center gap-2 shrink-0">
          {subtitle && (
            <span className="text-[10px] tracking-widest text-text-muted">{subtitle}</span>
          )}
          {stale && (
            <span className="text-[10px] tracking-widest text-status-warn">DONNÉES OBSOLÈTES</span>
          )}
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-hidden p-3">{children}</div>
    </section>
  );
}
