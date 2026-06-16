import { Panel } from "../Panel";
import { useDashboard } from "../../store";
import type { KeyStatus } from "../../types";

const DOT: Record<KeyStatus, string> = {
  on_track: "var(--status-ok)",
  at_risk: "var(--status-warn)",
  critical: "var(--status-alert)",
};

export function ProjectsPanel() {
  const panel = useDashboard((s) => s.state?.projects);
  return (
    <Panel title="PROJETS SI" subtitle="PORTEFEUILLE" stale={panel?.stale}>
      {!panel ? (
        <div className="text-text-muted text-xs">Chargement…</div>
      ) : (
        <ul className="text-xs h-full overflow-auto divide-y divide-white/5 pr-1">
          {panel.projects.map((p) => (
            <li key={p.id} className="flex items-center gap-3 py-1.5">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: DOT[p.keyStatus], boxShadow: `0 0 6px ${DOT[p.keyStatus]}` }}
              />
              <span
                className="font-display tracking-wider shrink-0 w-20 truncate"
                style={{ color: "var(--neon-cyan)" }}
                title={p.id}
              >
                {p.id}
              </span>
              <span className="flex-1 min-w-0 truncate" title={p.name}>
                {p.name}
              </span>
              {p.progress > 0 && (
                <span className="tabular-nums text-text-muted w-9 text-right">{p.progress}%</span>
              )}
              <span className="text-text-muted shrink-0 w-24 text-right truncate" title={p.owner}>
                {p.owner}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
