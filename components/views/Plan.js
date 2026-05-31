"use client";
/* ============================================================
   GAMSAT Study Hub — Study Plan (timeline + 15 weeks)
   ============================================================ */
import React, { useState } from "react";
import GH from "../../lib/gh";
import "../ui";
import "../../lib/store";

const E = React.createElement;

function Milestone({ m }) {
  const d = GH.daysUntil(m.date);
  const past = d < 0;
  const toneMap = { exam: "var(--s2)", result: "var(--s1)", admin: "var(--gold)", backup: "var(--ink-3)" };
  const c = toneMap[m.tag] || "var(--ink-3)";
  return E("div", { className: "card", style: { padding: "14px 16px", minWidth: 200, flex: "1 0 200px", opacity: past ? .6 : 1, borderColor: !past && d <= 21 ? "color-mix(in srgb," + c + " 35%,var(--line))" : "var(--line)" } },
    E("div", { className: "row between", style: { marginBottom: 8 } },
      E("span", { className: "chip", style: { color: c, background: "color-mix(in srgb," + c + " 9%,var(--surface))", borderColor: "transparent" } }, m.tag),
      E("span", { className: "mono", style: { fontSize: 11.5, fontWeight: 700, color: past ? "var(--ink-4)" : c } }, past ? "passed" : "in " + d + "d")),
    E("div", { style: { fontWeight: 600, fontSize: 14.5, marginBottom: 3, lineHeight: 1.3 } }, m.title),
    E("div", { className: "faint", style: { fontSize: 12, lineHeight: 1.45, marginBottom: 6 } }, m.note),
    E("div", { className: "mono faint", style: { fontSize: 11 } }, GH.fmtDate(m.date)));
}

function WeekCard({ week, open, onToggle, isCurrent }) {
  const { state, api } = GH.useStore();
  const phase = GH.phases[week.phase];
  const done = week.tasks.filter((_, i) => state.tasks[`w${week.n}-${i}`]).length;
  const pct = week.tasks.length ? Math.round(100 * done / week.tasks.length) : 0;
  return E("div", { className: "card", style: { overflow: "hidden", borderColor: isCurrent ? "color-mix(in srgb," + phase.color + " 45%,var(--line))" : "var(--line)", boxShadow: isCurrent ? "var(--sh-2)" : "var(--sh-1)" } },
    E("button", { onClick: onToggle, style: { width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", background: isCurrent ? phase.soft : "transparent", border: "none", cursor: "pointer", textAlign: "left" } },
      E("div", { style: { width: 5, alignSelf: "stretch", borderRadius: 99, background: phase.color, flex: "none" } }),
      E("div", { className: "col", style: { gap: 3, flex: 1, minWidth: 0 } },
        E("div", { className: "row", style: { gap: 8, flexWrap: "wrap" } },
          E("span", { style: { fontWeight: 700, fontSize: 15 } }, "Week " + week.n),
          isCurrent && E("span", { className: "chip", style: { color: "#fff", background: phase.color, borderColor: "transparent" } }, "You are here"),
          E("span", { className: "mono faint", style: { fontSize: 12 } }, week.range)),
        E("div", { className: "row", style: { gap: 6, flexWrap: "wrap" } },
          E("span", { className: "chip", style: { color: phase.color, background: phase.soft, borderColor: "transparent", fontSize: 9.5 } }, phase.label),
          week.focus.map((f) => E("span", { key: f, className: "faint", style: { fontSize: 11.5 } }, "· " + f)))),
      E(GH.Ring, { pct, size: 40, stroke: 4, color: phase.color },
        E("span", { className: "mono", style: { fontSize: 10, fontWeight: 700 } }, done + "/" + week.tasks.length)),
      E(GH.Icon, { name: open ? "chevdown" : "chevron", size: 18, style: { color: "var(--ink-3)", flex: "none" } })),
    open && E("div", { className: "col" },
      week.tasks.map((t, i) => {
        const id = `w${week.n}-${i}`, dn = !!state.tasks[id];
        return E("button", { key: id, onClick: () => api.toggleTask(id),
          style: { display: "flex", gap: 12, alignItems: "flex-start", textAlign: "left", padding: "11px 16px 11px 22px", background: "transparent", border: "none", borderTop: "1px solid var(--line)", cursor: "pointer" } },
          E("span", { style: { flex: "none", marginTop: 1, width: 20, height: 20, borderRadius: 6, border: "1.8px solid " + (dn ? phase.color : "var(--line-2)"), background: dn ? phase.color : "transparent", display: "grid", placeItems: "center" } },
            dn && E(GH.Icon, { name: "check", size: 12, style: { color: "#fff" } })),
          E("span", { style: { fontSize: 14, lineHeight: 1.45, color: dn ? "var(--ink-3)" : "var(--ink)", textDecoration: dn ? "line-through" : "none" } }, t));
      })));
}

export default function Plan() {
  const cur = GH.currentWeekIdx();
  const [open, setOpen] = useState({ [cur]: true });
  const { state } = GH.useStore();
  const totalTasks = GH.plan.reduce((n, w) => n + w.tasks.length, 0);
  const doneTasks = GH.plan.reduce((n, w) => n + w.tasks.filter((_, i) => state.tasks[`w${w.n}-${i}`]).length, 0);

  return E("div", { className: "scroll", style: { height: "100%", padding: "34px clamp(18px,4vw,46px) 80px" } },
    E("div", { style: { maxWidth: 1000, margin: "0 auto" } },
      E(GH.PageHead, { eyebrow: "Your periodised plan · 15 weeks to the main sitting", title: "Study Plan" },
        E("div", { className: "row", style: { gap: 14 } },
          E("div", { className: "col", style: { alignItems: "flex-end", lineHeight: 1.1 } },
            E("span", { className: "display", style: { fontSize: 26, color: "var(--acc)" } }, Math.round(100 * doneTasks / totalTasks) + "%"),
            E("span", { className: "eyebrow" }, doneTasks + " / " + totalTasks + " tasks")),
          E(GH.Ring, { pct: Math.round(100 * doneTasks / totalTasks), size: 52, color: "var(--acc)" }))),

      /* milestones timeline */
      E("div", { className: "rise", style: { marginBottom: 30 } },
        E("span", { className: "eyebrow", style: { display: "block", marginBottom: 10 } }, "Key dates"),
        E("div", { className: "row scroll", style: { gap: 12, overflowX: "auto", paddingBottom: 6 } },
          GH.milestones.map((m) => E(Milestone, { key: m.date, m })))),

      /* strategy note */
      E("div", { className: "card rise", style: { padding: "16px 18px", marginBottom: 26, background: "var(--surface-2)", display: "flex", gap: 13, alignItems: "flex-start" } },
        E(GH.Icon, { name: "target", size: 20, style: { color: "var(--acc)", flex: "none", marginTop: 1 } }),
        E("div", { className: "col", style: { gap: 4 } },
          E("span", { style: { fontWeight: 600, fontSize: 14.5 } }, "Why the plan is shaped this way"),
          E("span", { className: "muted", style: { fontSize: 13.5, lineHeight: 1.55 } },
            "Section II is sat first (22 Aug), so essays peak in mid-August — but science can't be crammed in the 3 weeks after, so chemistry & biology build steadily from June alongside your writing. The final sprint is pure Sections I & III with full mocks. Your two weak spots — ", E("strong", { style: { color: "var(--s2)" } }, "essays"), " and ", E("strong", { style: { color: "var(--s3)" } }, "chemistry"), " — get the most weekly minutes."))),

      /* phase legend */
      E("div", { className: "row wrap", style: { gap: 10, marginBottom: 18 } },
        Object.values(GH.phases).map((p) => E("span", { key: p.label, className: "row", style: { gap: 7, fontSize: 12.5, color: "var(--ink-2)" } },
          E("span", { className: "dot", style: { background: p.color, width: 9, height: 9 } }), p.label))),

      /* weeks */
      E("div", { className: "col", style: { gap: 10 } },
        GH.plan.map((w, i) => E(WeekCard, { key: w.n, week: w, open: !!open[i], isCurrent: i === cur, onToggle: () => setOpen((o) => ({ ...o, [i]: !o[i] })) })))
    ));
}
