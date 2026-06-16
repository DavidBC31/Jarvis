import { Panel } from "../Panel";
import { useDashboard } from "../../store";
import type { TicketStatus } from "../../types";

const STATUS_COLOR: Record<TicketStatus, string> = {
  new: "var(--status-new)",
  in_progress: "var(--status-warn)",
  on_hold: "var(--status-alert)",
  resolved: "var(--status-ok)",
  closed: "var(--text-muted)",
};
const STATUS_LABEL: Record<TicketStatus, string> = {
  new: "Nouveau",
  in_progress: "En cours",
  on_hold: "En attente",
  resolved: "Résolu",
  closed: "Clôturé",
};
const PRIORITY_LABEL: Record<string, string> = {
  low: "Basse",
  medium: "Moyenne",
  high: "Haute",
  urgent: "Urgente",
};

export function TicketsPanel() {
  const panel = useDashboard((s) => s.state?.tickets);
  return (
    <Panel title="TICKETS DE SUPPORT" subtitle="FLUX EVERPING" stale={panel?.stale}>
      {!panel ? (
        <Loading />
      ) : (
        <div className="flex gap-3 h-full">
          <table className="flex-1 text-xs border-collapse self-start">
            <thead className="text-text-muted text-left">
              <tr>
                <th className="py-1 pr-2 font-normal">Réf.</th>
                <th className="py-1 pr-2 font-normal">Sujet</th>
                <th className="py-1 pr-2 font-normal">Statut</th>
                <th className="py-1 pr-2 font-normal">Assigné</th>
                <th className="py-1 font-normal">Prio.</th>
              </tr>
            </thead>
            <tbody>
              {panel.tickets.map((t) => (
                <tr key={t.id} className="border-t border-white/5">
                  <td className="py-1 pr-2 whitespace-nowrap">{t.id}</td>
                  <td className="py-1 pr-2 truncate max-w-[14rem]">{t.subject}</td>
                  <td className="py-1 pr-2">
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] whitespace-nowrap"
                      style={{
                        background: `${STATUS_COLOR[t.status]}22`,
                        color: STATUS_COLOR[t.status],
                        border: `1px solid ${STATUS_COLOR[t.status]}`,
                      }}
                    >
                      {STATUS_LABEL[t.status]}
                    </span>
                  </td>
                  <td className="py-1 pr-2 whitespace-nowrap">{t.assignedTo ?? "—"}</td>
                  <td className="py-1">{PRIORITY_LABEL[t.priority] ?? t.priority}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Donut counts={panel.statusCounts} total={panel.total} />
        </div>
      )}
    </Panel>
  );
}

function Donut({
  counts,
  total,
}: {
  counts: Partial<Record<TicketStatus, number>>;
  total: number;
}) {
  const radius = 34;
  const circ = 2 * Math.PI * radius;
  let offset = 0;
  const segments = (Object.entries(counts) as [TicketStatus, number][]).map(
    ([status, n]) => {
      const frac = total ? n / total : 0;
      const seg = {
        status,
        dash: frac * circ,
        offset: -offset * circ,
      };
      offset += frac;
      return seg;
    },
  );
  return (
    <svg width="96" height="96" viewBox="0 0 96 96" className="shrink-0 self-center">
      <circle cx="48" cy="48" r={radius} fill="none" stroke="#ffffff10" strokeWidth="10" />
      {segments.map((s) => (
        <circle
          key={s.status}
          cx="48"
          cy="48"
          r={radius}
          fill="none"
          stroke={STATUS_COLOR[s.status]}
          strokeWidth="10"
          strokeDasharray={`${s.dash} ${circ}`}
          strokeDashoffset={s.offset}
          transform="rotate(-90 48 48)"
        />
      ))}
      <text x="48" y="52" textAnchor="middle" className="fill-text-primary" fontSize="18">
        {total}
      </text>
    </svg>
  );
}

function Loading() {
  return <div className="text-text-muted text-xs">Chargement…</div>;
}
