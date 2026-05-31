"use client";
/* ============================================================
   GAMSAT Study Hub — Sections (strategy + science checklists)
   ============================================================ */
import React, { useState } from "react";
import GH from "../../lib/gh";
import "../ui";
import "../../lib/store";

const E = React.createElement;

function FactRow({ facts, color }) {
  return E("div", { className: "row wrap", style: { gap: 8, marginBottom: 16 } },
    facts.map((f) => E("span", { key: f, className: "chip", style: { color, background: "color-mix(in srgb," + color + " 8%,var(--surface))", borderColor: "color-mix(in srgb," + color + " 22%,transparent)" } }, f)));
}

function StratCard({ h, p, color }) {
  return E("div", { className: "card", style: { padding: "15px 17px" } },
    E("div", { style: { fontWeight: 600, fontSize: 14.5, marginBottom: 5, color: "var(--ink)" } }, h),
    E("div", { className: "muted", style: { fontSize: 13.5, lineHeight: 1.55 } }, p));
}

/* ---------------- SECTION I ---------------- */
function SectionOne() {
  const s = GH.s1;
  return E("div", { className: "col", style: { gap: 22 } },
    E("div", null,
      E(FactRow, { facts: s.facts, color: s.accent }),
      E("p", { className: "serif", style: { fontSize: 18, lineHeight: 1.6, color: "var(--ink-2)", maxWidth: 660 } }, s.blurb)),
    E("div", null,
      E("span", { className: "eyebrow", style: { display: "block", marginBottom: 12 } }, "How to play it"),
      E("div", { className: "cards-2", style: { gap: 12 } }, s.strategy.map((c, i) => E(StratCard, { key: i, ...c, color: s.accent })))),
    E("div", null,
      E("span", { className: "eyebrow", style: { display: "block", marginBottom: 12 } }, "Stem types you'll meet"),
      E("div", { className: "col", style: { gap: 8 } }, s.stems.map((st) => E("div", { key: st.t, className: "card", style: { padding: "12px 16px", display: "flex", gap: 14, alignItems: "baseline" } },
        E("span", { style: { fontWeight: 600, fontSize: 14, minWidth: 130, color: s.accent } }, st.t),
        E("span", { className: "muted", style: { fontSize: 13.5, lineHeight: 1.5 } }, st.tip))))),
    E("div", { className: "card", style: { padding: "16px 18px", background: s.soft, border: "1px solid color-mix(in srgb," + s.accent + " 22%,transparent)", display: "flex", gap: 13, alignItems: "flex-start" } },
      E(GH.Icon, { name: "book", size: 20, style: { color: s.accent, flex: "none", marginTop: 1 } }),
      E("div", null, E("div", { style: { fontWeight: 600, fontSize: 14.5, marginBottom: 3 } }, "The one habit that matters most"),
        E("div", { className: "muted", style: { fontSize: 13.5, lineHeight: 1.55 } }, s.habit))));
}

/* ---------------- SECTION II ---------------- */
function TaskBlock({ t, color }) {
  return E("div", { className: "card", style: { padding: "16px 18px", flex: 1, minWidth: 240 } },
    E("div", { className: "row", style: { gap: 8, marginBottom: 7 } },
      E("span", { className: "display", style: { fontSize: 18, color } }, t.label)),
    E("div", { className: "muted", style: { fontSize: 13, lineHeight: 1.5, marginBottom: 12 } }, t.note),
    E("div", { className: "col", style: { gap: 0 } }, t.structure.map((st, i) => E("div", { key: i, className: "row", style: { gap: 10, padding: "7px 0", borderTop: i ? "1px solid var(--line)" : "none", alignItems: "flex-start" } },
      E("span", { className: "mono", style: { fontSize: 11, fontWeight: 700, color, minWidth: 16 } }, (i + 1)),
      E("span", { style: { fontSize: 13.5, lineHeight: 1.45 } }, st)))));
}

function SectionTwo() {
  const s = GH.s2;
  const { api } = GH.useStore();
  const [tab, setTab] = useState("A");
  const themes = s.themes.filter((t) => t.task === tab);
  return E("div", { className: "col", style: { gap: 22 } },
    E("div", null,
      E(FactRow, { facts: s.facts, color: s.accent }),
      E("div", { className: "row between wrap", style: { gap: 14, alignItems: "flex-start" } },
        E("p", { className: "serif", style: { fontSize: 18, lineHeight: 1.6, color: "var(--ink-2)", maxWidth: 600 } }, s.blurb),
        E("button", { className: "btn btn-primary", onClick: () => api.setView("essay") }, E(GH.Icon, { name: "write", size: 15 }), "Open Essay Studio"))),

    /* marking */
    E("div", null,
      E("span", { className: "eyebrow", style: { display: "block", marginBottom: 12 } }, "What the three raters reward"),
      E("div", { className: "cards-2", style: { gap: 12 } }, s.marking.map((m, i) => E(StratCard, { key: i, ...m, color: s.accent })))),

    /* 5-min plan */
    E("div", { className: "card", style: { padding: "18px 20px", background: "var(--surface-2)" } },
      E("div", { className: "row", style: { gap: 9, marginBottom: 12 } },
        E(GH.Icon, { name: "clock", size: 18, style: { color: s.accent } }),
        E("span", { className: "display", style: { fontSize: 19 } }, s.plan.h)),
      E("div", { className: "col", style: { gap: 0 } }, s.plan.steps.map((st, i) => E("div", { key: i, className: "row", style: { gap: 12, padding: "9px 0", borderTop: i ? "1px solid var(--line)" : "none", alignItems: "center" } },
        E("span", { style: { flex: "none", width: 24, height: 24, borderRadius: "50%", background: s.soft, color: s.accent, display: "grid", placeItems: "center", fontWeight: 700, fontSize: 12, fontFamily: "var(--mono)" } }, i + 1),
        E("span", { style: { fontSize: 14, lineHeight: 1.45 } }, st))))),

    /* task structures */
    E("div", null,
      E("span", { className: "eyebrow", style: { display: "block", marginBottom: 12 } }, "Two tasks, two modes"),
      E("div", { className: "row wrap", style: { gap: 12 } },
        E(TaskBlock, { t: s.taskA, color: "var(--s2)" }),
        E(TaskBlock, { t: s.taskB, color: "var(--s1)" }))),

    /* theme bank */
    E("div", null,
      E("div", { className: "row between", style: { marginBottom: 12 } },
        E("span", { className: "eyebrow" }, "Theme bank · flexible material, not canned essays"),
        E("div", { className: "row", style: { gap: 6, background: "var(--surface-3)", padding: 3, borderRadius: 99 } },
          ["A", "B"].map((x) => E("button", { key: x, onClick: () => setTab(x), className: "mono",
            style: { border: "none", cursor: "pointer", padding: "5px 12px", borderRadius: 99, fontSize: 11.5, fontWeight: 700, letterSpacing: ".05em",
              background: tab === x ? "var(--surface)" : "transparent", color: tab === x ? "var(--ink)" : "var(--ink-3)", boxShadow: tab === x ? "var(--sh-1)" : "none" } }, "Task " + x)))),
      E("div", { className: "cards-2", style: { gap: 12 } }, themes.map((t) => E("div", { key: t.t, className: "card", style: { padding: "14px 16px" } },
        E("div", { style: { fontWeight: 700, fontSize: 15, marginBottom: 7, color: "var(--ink)" } }, t.t),
        E("div", { className: "col", style: { gap: 5, marginBottom: 9 } }, t.angles.map((a, i) => E("div", { key: i, className: "row", style: { gap: 7, alignItems: "flex-start" } },
          E("span", { style: { color: s.accent, fontWeight: 700, fontSize: 13 } }, "→"),
          E("span", { className: "serif", style: { fontSize: 13.5, fontStyle: "italic", color: "var(--ink-2)", lineHeight: 1.4 } }, a)))),
        E("div", { className: "row wrap", style: { gap: 5 } }, t.evidence.map((ev) => E("span", { key: ev, className: "chip", style: { fontSize: 9.5, textTransform: "none", letterSpacing: 0, fontFamily: "var(--sans)" } }, ev))))))),

    /* warnings */
    E("div", { className: "card", style: { padding: "16px 18px", background: "var(--gold-soft)", border: "1px solid color-mix(in srgb,var(--gold) 26%,transparent)" } },
      E("span", { className: "eyebrow", style: { color: "var(--gold)", display: "block", marginBottom: 10 } }, "Watch-outs from ACER"),
      E("div", { className: "col", style: { gap: 8 } }, s.warnings.map((w, i) => E("div", { key: i, className: "row", style: { gap: 9, alignItems: "flex-start" } },
        E("span", { style: { color: "var(--gold)", fontWeight: 700 } }, "•"),
        E("span", { style: { fontSize: 13.5, lineHeight: 1.5, color: "var(--ink-2)" } }, w))))));
}

/* ---------------- SECTION III ---------------- */
function TopicRow({ item }) {
  const { state, api } = GH.useStore();
  const [open, setOpen] = useState(false);
  const lv = state.topics[item.id] || "none";
  return E("div", { className: "card", style: { padding: 0, overflow: "hidden" } },
    E("div", { style: { display: "flex", alignItems: "center", gap: 12, padding: "11px 14px" } },
      E("button", { onClick: () => setOpen((o) => !o), style: { flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer", textAlign: "left" } },
        E(GH.Icon, { name: open ? "chevdown" : "chevron", size: 15, style: { color: "var(--ink-4)", flex: "none" } }),
        E("span", { style: { fontWeight: 600, fontSize: 14, lineHeight: 1.3 } }, item.t)),
      E(GH.ConfDots, { value: lv, onChange: (v) => api.setTopic(item.id, v) })),
    open && E("div", { style: { padding: "0 14px 13px 39px" } },
      E("div", { className: "muted", style: { fontSize: 13.3, lineHeight: 1.55 } }, item.note)));
}

function SubjectBlock({ sub }) {
  const { state } = GH.useStore();
  const all = sub.groups.flatMap((g) => g.items);
  const solid = all.filter((it) => state.topics[it.id] === "solid").length;
  const started = all.filter((it) => (state.topics[it.id] || "none") !== "none").length;
  return E("div", { className: "col", style: { gap: 14 } },
    E("div", { className: "row between wrap", style: { gap: 10, alignItems: "baseline" } },
      E("div", { className: "row", style: { gap: 10, alignItems: "baseline" } },
        E("span", { className: "display", style: { fontSize: 24, color: sub.accent } }, sub.label),
        E("span", { className: "chip", style: { fontFamily: "var(--sans)", textTransform: "none", letterSpacing: 0, whiteSpace: "nowrap" } }, sub.weight)),
      E("div", { className: "row", style: { gap: 10 } },
        E("span", { className: "mono faint", style: { fontSize: 12 } }, solid + " solid · " + started + "/" + all.length + " started"),
        E(GH.Ring, { pct: Math.round(100 * solid / all.length), size: 38, stroke: 4, color: sub.accent },
          E("span", { className: "mono", style: { fontSize: 9.5, fontWeight: 700 } }, Math.round(100 * solid / all.length) + "%")))),
    sub.groups.map((g) => E("div", { key: g.g, className: "col", style: { gap: 7 } },
      E("span", { className: "eyebrow", style: { fontSize: 10 } }, g.g),
      g.items.map((it) => E(TopicRow, { key: it.id, item: it })))));
}

function SectionThree() {
  const s = GH.s3;
  const { api } = GH.useStore();
  const [sub, setSub] = useState("chem");
  return E("div", { className: "col", style: { gap: 22 } },
    E("div", null,
      E(FactRow, { facts: s.facts, color: s.accent }),
      E("div", { className: "row between wrap", style: { gap: 14, alignItems: "flex-start" } },
        E("p", { className: "serif", style: { fontSize: 18, lineHeight: 1.6, color: "var(--ink-2)", maxWidth: 600 } }, s.blurb),
        E("button", { className: "btn", onClick: () => api.setView("practice") }, E(GH.Icon, { name: "practice", size: 15 }), "Drill questions"))),
    E("div", null,
      E("span", { className: "eyebrow", style: { display: "block", marginBottom: 12 } }, "Section III strategy"),
      E("div", { className: "cards-2", style: { gap: 12 } }, s.strategy.map((c, i) => E(StratCard, { key: i, ...c, color: s.accent })))),

    /* subject switcher */
    E("div", null,
      E("div", { className: "row between wrap", style: { marginBottom: 16, gap: 10 } },
        E("span", { className: "eyebrow" }, "Content checklist · rate your confidence"),
        E("div", { className: "row", style: { gap: 5, background: "var(--surface-3)", padding: 3, borderRadius: 99 } },
          Object.entries(GH.topics).map(([k, v]) => E("button", { key: k, onClick: () => setSub(k),
            style: { border: "none", cursor: "pointer", padding: "6px 14px", borderRadius: 99, fontSize: 13, fontWeight: 600,
              background: sub === k ? "var(--surface)" : "transparent", color: sub === k ? v.accent : "var(--ink-3)", boxShadow: sub === k ? "var(--sh-1)" : "none" } }, v.label)))),
      E(SubjectBlock, { sub: GH.topics[sub], key: sub })));
}

/* ---------------- shell ---------------- */
export default function Sections() {
  const [tab, setTab] = useState("s3");
  const tabs = [
    { k: "s1", label: "Section I", sub: "Humanities", color: "var(--s1)" },
    { k: "s2", label: "Section II", sub: "Essays", color: "var(--s2)" },
    { k: "s3", label: "Section III", sub: "Science", color: "var(--s3)" },
  ];
  const titleMap = { s1: GH.s1.title, s2: GH.s2.title, s3: GH.s3.title };
  return E("div", { className: "scroll", style: { height: "100%", padding: "34px clamp(18px,4vw,46px) 80px" } },
    E("div", { style: { maxWidth: 1000, margin: "0 auto" } },
      E(GH.PageHead, { eyebrow: "Strategy & content", title: "Sections" }),
      E("div", { className: "row wrap", style: { gap: 10, marginBottom: 26 } },
        tabs.map((t) => E("button", { key: t.k, onClick: () => setTab(t.k), className: "card",
          style: { cursor: "pointer", padding: "12px 18px", textAlign: "left", flex: "1 0 150px", display: "flex", flexDirection: "column", gap: 3,
            borderColor: tab === t.k ? "color-mix(in srgb," + t.color + " 50%,var(--line))" : "var(--line)",
            background: tab === t.k ? "color-mix(in srgb," + t.color + " 7%,var(--surface))" : "var(--surface)",
            boxShadow: tab === t.k ? "var(--sh-2)" : "var(--sh-1)" } },
          E("div", { className: "row between", style: { marginBottom: 3 } },
            E("span", { className: "display", style: { fontSize: 18, color: tab === t.k ? t.color : "var(--ink)" } }, t.label),
            E("span", { className: "dot", style: { background: t.color, width: 8, height: 8 } })),
          E("span", { className: "faint", style: { fontSize: 12.5 } }, t.sub)))),
      E("div", { className: "rise", key: tab },
        E("h2", { className: "display", style: { fontSize: 25, marginBottom: 18, lineHeight: 1.15, maxWidth: 640 } }, titleMap[tab]),
        tab === "s1" && E(SectionOne, null),
        tab === "s2" && E(SectionTwo, null),
        tab === "s3" && E(SectionThree, null))
    ));
}
