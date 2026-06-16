import { Panel } from "../Panel";
import { useDashboard } from "../../store";
import type { ServiceNode, ServiceState } from "../../types";

const STATE_COLOR: Record<ServiceState, string> = {
  ok: "var(--status-ok)",
  warn: "var(--status-warn)",
  alert: "var(--status-alert)",
  maint: "#ff9a3a",
};
const STATE_LABEL: Record<ServiceState, string> = {
  ok: "Opérationnel",
  warn: "Dégradé",
  alert: "Hors ligne",
  maint: "Maintenance",
};

const BEATS_SHOWN = 30;

export function ServicesPanel() {
  const panel = useDashboard((s) => s.state?.services);
  const up = panel?.upCount ?? 0;
  const total = panel?.total ?? panel?.nodes.length ?? 0;
  const allUp = total > 0 && up === total;

  return (
    <Panel title="ÉTAT DES SERVICES" subtitle="SUPERVISION TEMPS RÉEL" stale={panel?.stale}>
      {!panel ? (
        <div className="text-text-muted text-xs">Chargement…</div>
      ) : (
        <div className="h-full flex flex-col">
          <div className="flex items-center gap-2 text-[11px] mb-2 shrink-0">
            <span
              className="w-2 h-2 rounded-full"
              style={{
                background: allUp ? "var(--status-ok)" : "var(--status-alert)",
                boxShadow: `0 0 6px ${allUp ? "var(--status-ok)" : "var(--status-alert)"}`,
              }}
            />
            <span className="font-display tracking-widest">
              {allUp ? "TOUS LES SERVICES OPÉRATIONNELS" : "INCIDENT EN COURS"}
            </span>
            <span className="ml-auto text-text-muted tabular-nums">
              {up}/{total} en ligne
            </span>
          </div>

          <ul className="flex-1 min-h-0 overflow-auto divide-y divide-white/5 pr-1">
            {panel.nodes.map((n) => (
              <ServiceRow key={n.id} node={n} />
            ))}
          </ul>
        </div>
      )}
    </Panel>
  );
}

function ServiceRow({ node }: { node: ServiceNode }) {
  const color = STATE_COLOR[node.state];
  const beats = node.beats ?? [];
  // Aligne les barres à droite (les plus récentes à droite), comble à gauche.
  const padded: (ServiceState | null)[] = [
    ...Array(Math.max(0, BEATS_SHOWN - beats.length)).fill(null),
    ...beats.slice(-BEATS_SHOWN),
  ];

  return (
    <li className="flex items-center gap-3 py-1.5">
      <span
        className="w-2.5 h-2.5 rounded-full shrink-0"
        style={{
          background: color,
          boxShadow: `0 0 6px ${color}`,
          animation: node.state !== "ok" ? "pulse-glow 1.4s ease-in-out infinite" : undefined,
        }}
      />
      <div className="min-w-0 w-40 shrink-0">
        <div className="truncate">{node.label}</div>
        <div className="text-[10px] truncate" style={{ color }}>
          {STATE_LABEL[node.state]}
          {node.detail ? ` · ${node.detail}` : ""}
        </div>
      </div>

      <div className="flex-1 min-w-0 flex items-end justify-end gap-[2px] h-5">
        {padded.map((b, i) => (
          <span
            key={i}
            className="w-[3px] rounded-sm"
            style={{
              height: b ? "100%" : "40%",
              background: b ? STATE_COLOR[b] : "rgba(255,255,255,0.10)",
            }}
          />
        ))}
      </div>

      <span className="tabular-nums text-text-muted w-14 text-right shrink-0">
        {node.uptimePercent != null ? `${node.uptimePercent}%` : "—"}
      </span>
    </li>
  );
}
