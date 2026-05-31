"use client";
/* ============================================================
   GAMSAT Study Hub — Progress (analytics, heatmap, badges)
   ============================================================ */
import React from "react";
import GH from "../../lib/gh";
import "../ui";
import "../../lib/store";

const E = React.createElement;

function Heatmap() {
  const { state } = GH.useStore();
  const weeks = 14;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  // back up to Monday of current week
  const dow = (today.getDay() + 6) % 7; // Mon=0
  const end = new Date(today.getTime() - dow * GH.MS_DAY + 6 * GH.MS_DAY); // Sunday this week
  const start = new Date(end.getTime() - (weeks * 7 - 1) * GH.MS_DAY);
  const cols = [];
  for (let w = 0; w < weeks; w++) {
    const col = [];
    for (let d = 0; d < 7; d++) {
      const day = new Date(start.getTime() + (w * 7 + d) * GH.MS_DAY);
      const iso = GH.iso(day);
      const future = day > today;
      col.push({ iso, active: !!state.activity[iso], future, isToday: iso === GH.todayISO() });
    }
    cols.push(col);
  }
  return E("div", { className: "card", style: { padding: "18px 20px" } },
    E("div", { className: "row between", style: { marginBottom: 14 } },
      E("span", { className: "eyebrow" }, "Study activity"),
      E("div", { className: "row", style: { gap: 6, alignItems: "center" } },
        E("span", { className: "faint", style: { fontSize: 11 } }, "less"),
        E("span", { className: "dot", style: { width: 11, height: 11, borderRadius: 3, background: "var(--surface-3)", border: "1px solid var(--line)" } }),
        E("span", { className: "dot", style: { width: 11, height: 11, borderRadius: 3, background: "color-mix(in srgb,var(--acc) 45%,var(--surface))" } }),
        E("span", { className: "dot", style: { width: 11, height: 11, borderRadius: 3, background: "var(--acc)" } }),
        E("span", { className: "faint", style: { fontSize: 11 } }, "more"))),
    E("div", { style: { overflowX: "auto" } },
      E("div", { className: "row", style: { gap: 4, alignItems: "flex-start" } },
        cols.map((c, wi) => E("div", { key: wi, className: "col", style: { gap: 4 } },
          c.map((d, di) => E("div", { key: di, title: d.iso + (d.active ? " · active" : ""),
            style: { width: 13, height: 13, borderRadius: 3,
              background: d.future ? "transparent" : d.active ? "var(--acc)" : "var(--surface-3)",
              border: d.isToday ? "1.5px solid var(--ink)" : "1px solid " + (d.future ? "transparent" : "var(--line)") } }))) ))));
}

function Bar({ label, pct, color, right }) {
  return E("div", { className: "col", style: { gap: 6 } },
    E("div", { className: "row between" }, E("span", { style: { fontSize: 13.5, fontWeight: 500 } }, label), E("span", { className: "mono faint", style: { fontSize: 12 } }, right)),
    E("div", { style: { height: 9, borderRadius: 99, background: "var(--surface-3)", overflow: "hidden" } },
      E("div", { style: { height: "100%", width: Math.max(2, pct) + "%", background: color, borderRadius: 99, transition: "width .6s cubic-bezier(.2,.7,.3,1)" } })));
}

export default function Progress() {
  const { state, api, stats } = GH.useStore();
  const studyDays = Object.values(state.activity).filter(Boolean).length;

  // accuracy by section
  const secMeta = { chem: ["Chemistry", "var(--s3)"], bio: ["Biology", "var(--s1)"], phys: ["Physics", "var(--gold)"], s1: ["Section I", "var(--s1)"] };

  // readiness heuristics
  const essayReady = Math.min(100, Math.round(state.essays.length / 16 * 100));
  const sciReady = Math.round((stats.topicsSolid / stats.topicsTotal) * 100);
  const chemAcc = stats.acc.chem[1] ? Math.round(100 * stats.acc.chem[0] / stats.acc.chem[1]) : 0;

  return E("div", { className: "scroll", style: { height: "100%", padding: "34px clamp(18px,4vw,46px) 80px" } },
    E("div", { style: { maxWidth: 1000, margin: "0 auto" } },
      E(GH.PageHead, { eyebrow: "Momentum & analytics", title: "Progress" },
        E("div", { className: "row", style: { gap: 14 } }, E(GH.Flame, { count: stats.streak }),
          E("div", { className: "col", style: { alignItems: "flex-end", lineHeight: 1.1 } },
            E("span", { className: "display", style: { fontSize: 22, color: "var(--gold)" } }, stats.longest),
            E("span", { className: "eyebrow", style: { fontSize: 9 } }, "longest streak")))),

      /* stat row */
      E("div", { className: "cards-4 rise", style: { gap: 12, marginBottom: 18 } },
        [[stats.xp, "Total XP", stats.level, "var(--acc)"],
         [studyDays, "Active days", "since you began", "var(--s3)"],
         [stats.essays, "Essays written", "target ~16", "var(--s2)"],
         [stats.questionsAnswered, "Questions", (stats.accuracyOverall || 0) + "% correct", "var(--s1)"]].map((s, i) =>
          E("div", { key: i, className: "card", style: { padding: "16px 18px" } }, E(GH.Stat, { value: s[0], label: s[1], sub: s[2], color: s[3] })))),

      E("div", { className: "grid-2c", style: { gap: 18, marginBottom: 18 } },
        E(Heatmap, null),
        /* readiness */
        E("div", { className: "card", style: { padding: "18px 20px" } },
          E("span", { className: "eyebrow", style: { display: "block", marginBottom: 16 } }, "Readiness by section"),
          E("div", { className: "col", style: { gap: 15 } },
            E(Bar, { label: "Section II · Essays", pct: essayReady, color: "var(--s2)", right: state.essays.length + " / ~16 essays" }),
            E(Bar, { label: "Section III · Science topics", pct: sciReady, color: "var(--s3)", right: stats.topicsSolid + " / " + stats.topicsTotal + " solid" }),
            E(Bar, { label: "Chemistry accuracy", pct: chemAcc, color: "var(--gold)", right: stats.acc.chem[1] ? chemAcc + "%" : "no data yet" }),
            E(Bar, { label: "Overall question accuracy", pct: stats.accuracyOverall, color: "var(--s1)", right: stats.totalCorrect + " / " + stats.questionsAnswered })),
          E("div", { className: "faint", style: { fontSize: 12, marginTop: 14, lineHeight: 1.5 } }, "Rough momentum gauges, not predictions — they climb as you log work."))),

      /* accuracy by section + topics */
      E("div", { className: "grid-2c", style: { gap: 18, marginBottom: 18 } },
        E("div", { className: "card", style: { padding: "18px 20px" } },
          E("span", { className: "eyebrow", style: { display: "block", marginBottom: 16 } }, "Accuracy by subject"),
          E("div", { className: "col", style: { gap: 14 } },
            Object.entries(secMeta).map(([k, [label, color]]) => {
              const [c, t] = stats.acc[k]; const pct = t ? Math.round(100 * c / t) : 0;
              return E(Bar, { key: k, label, pct, color, right: t ? c + "/" + t + " · " + pct + "%" : "—" });
            }))),
        E("div", { className: "card", style: { padding: "18px 20px" } },
          E("span", { className: "eyebrow", style: { display: "block", marginBottom: 16 } }, "Science topic confidence"),
          E("div", { className: "row", style: { gap: 18, alignItems: "center" } },
            E(GH.Ring, { pct: sciReady, size: 92, stroke: 9, color: "var(--s3)" }, E("div", { className: "col", style: { alignItems: "center" } }, E("span", { className: "display", style: { fontSize: 24 } }, sciReady + "%"), E("span", { className: "eyebrow", style: { fontSize: 8.5 } }, "solid"))),
            E("div", { className: "col", style: { gap: 10, flex: 1 } },
              Object.entries(GH.topics).map(([k, sub]) => {
                const items = sub.groups.flatMap((g) => g.items);
                const solid = items.filter((it) => state.topics[it.id] === "solid").length;
                const shaky = items.filter((it) => state.topics[it.id] === "shaky").length;
                return E("div", { key: k, className: "col", style: { gap: 4 } },
                  E("div", { className: "row between" }, E("span", { style: { fontSize: 13, fontWeight: 600, color: sub.accent } }, sub.label), E("span", { className: "mono faint", style: { fontSize: 11.5 } }, solid + " solid · " + shaky + " shaky")),
                  E("div", { style: { height: 7, borderRadius: 99, background: "var(--surface-3)", overflow: "hidden", display: "flex" } },
                    E("div", { style: { height: "100%", width: (100 * solid / items.length) + "%", background: sub.accent } }),
                    E("div", { style: { height: "100%", width: (100 * shaky / items.length) + "%", background: "color-mix(in srgb," + sub.accent + " 35%,var(--surface))" } }))); }))))),

      /* badges */
      E("div", { className: "card", style: { padding: "18px 20px", marginBottom: 18 } },
        E("span", { className: "eyebrow", style: { display: "block", marginBottom: 14 } }, "Badges"),
        E("div", { className: "cards-3", style: { gap: 12 } },
          GH.badgeDefs.map((b) => { const got = !!state.badges[b.id];
            return E("div", { key: b.id, style: { display: "flex", gap: 12, alignItems: "center", padding: "12px 14px", borderRadius: "var(--r-sm)", border: "1px solid var(--line)", background: got ? "var(--gold-soft)" : "var(--surface-2)", opacity: got ? 1 : .6 } },
              E("div", { style: { flex: "none", width: 38, height: 38, borderRadius: "50%", display: "grid", placeItems: "center", background: got ? "var(--gold)" : "var(--surface-3)" } },
                E(GH.Icon, { name: got ? "trophy" : "lock", size: 19, style: { color: got ? "#fff" : "var(--ink-4)" } })),
              E("div", { className: "col", style: { gap: 1 } }, E("span", { style: { fontWeight: 700, fontSize: 13.5 } }, b.t), E("span", { className: "faint", style: { fontSize: 11.5, lineHeight: 1.35 } }, b.d))); }))),

      /* reset */
      E("div", { className: "row between wrap", style: { gap: 12, padding: "4px 2px" } },
        E("span", { className: "faint", style: { fontSize: 12 } }, "Everything is saved privately in this browser."),
        E("button", { className: "btn btn-ghost btn-sm", style: { color: "var(--acc)" }, onClick: () => { if (confirm("Reset all progress? This can't be undone.")) api.resetAll(); } },
          E(GH.Icon, { name: "reset", size: 14 }), "Reset all progress"))
    ));
}
