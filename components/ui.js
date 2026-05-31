"use client";
/* ============================================================
   GAMSAT Study Hub — shared UI components
   Ported from the prototype components.jsx.
   ============================================================ */
import React, { useState, useEffect, useRef } from "react";
import GH from "../lib/gh";

/* ---------- icons (simple line set) ---------- */
const P = (d, extra) => React.createElement("path", Object.assign({ d, fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round" }, extra || {}));
export function Icon({ name, size = 18, style }) {
  const c = {
    today:   [P("M3 9.5 12 4l9 5.5"), P("M5 8.5V20h14V8.5"), P("M9.5 20v-5h5v5")],
    plan:    [P("M4 6h16M4 12h16M4 18h10"), React.createElement("circle", { key: "c", cx: 19, cy: 18, r: 2, fill: "none", stroke: "currentColor", strokeWidth: 1.7 })],
    sections: [P("M12 3 3 8l9 5 9-5-9-5Z"), P("M3 13l9 5 9-5")],
    essay:   [P("M5 19h14"), P("M14.5 5.5l3 3L8 18l-3.5.5L5 15z")],
    practice: [React.createElement("circle", { key: "o", cx: 12, cy: 12, r: 8, fill: "none", stroke: "currentColor", strokeWidth: 1.7 }), React.createElement("circle", { key: "i", cx: 12, cy: 12, r: 3, fill: "none", stroke: "currentColor", strokeWidth: 1.7 })],
    vocab:   [P("M5 4h10a2 2 0 0 1 2 2v14l-4-2-4 2V4z"), P("M5 4v14")],
    progress: [P("M4 20V10M10 20V4M16 20v-7M22 20H2")],
    flame:   [P("M12 3c1 3 4 4 4 8a4 4 0 1 1-8 0c0-1 .5-2 1-2.5C9 11 12 9 12 3z")],
    check:   [P("M4 12l5 5L20 6")],
    chevron: [P("M9 6l6 6-6 6")],
    chevdown: [P("M6 9l6 6 6-6")],
    lock:    [React.createElement("rect", { key: "r", x: 5, y: 11, width: 14, height: 9, rx: 2, fill: "none", stroke: "currentColor", strokeWidth: 1.7 }), P("M8 11V8a4 4 0 0 1 8 0v3")],
    spark:   [P("M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18")],
    clock:   [React.createElement("circle", { key: "c", cx: 12, cy: 12, r: 8, fill: "none", stroke: "currentColor", strokeWidth: 1.7 }), P("M12 8v4.5l3 1.5")],
    x:       [P("M6 6l12 12M18 6 6 18")],
    plus:    [P("M12 5v14M5 12h14")],
    arrow:   [P("M5 12h14M13 6l6 6-6 6")],
    target:  [React.createElement("circle", { key: "a", cx: 12, cy: 12, r: 8, fill: "none", stroke: "currentColor", strokeWidth: 1.7 }), React.createElement("circle", { key: "b", cx: 12, cy: 12, r: 4.5, fill: "none", stroke: "currentColor", strokeWidth: 1.7 }), React.createElement("circle", { key: "d", cx: 12, cy: 12, r: 1, fill: "currentColor", stroke: "none" })],
    book:    [P("M4 5.5C4 4.7 4.7 4 5.5 4H11v15H5.5A1.5 1.5 0 0 0 4 20.5z"), P("M20 5.5C20 4.7 19.3 4 18.5 4H13v15h5.5a1.5 1.5 0 0 1 1.5 1.5z")],
    trophy:  [P("M7 4h10v4a5 5 0 0 1-10 0V4z"), P("M7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3M9 18h6M10 14v4M14 14v4")],
    reset:   [P("M4 12a8 8 0 1 1 2.3 5.6"), P("M4 20v-5h5")],
    write:   [P("M5 19h14"), P("M14.5 5.5l3 3L8 18l-3.5.5L5 15z")],
    cal:     [React.createElement("rect", { key: "r", x: 4, y: 5, width: 16, height: 15, rx: 2, fill: "none", stroke: "currentColor", strokeWidth: 1.7 }), P("M4 9h16M8 3v4M16 3v4")],
    menu:    [P("M4 7h16M4 12h16M4 17h16")],
    settings: [React.createElement("circle", { key: "c", cx: 12, cy: 12, r: 3.2, fill: "none", stroke: "currentColor", strokeWidth: 1.7 }), P("M19.4 13a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H10a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V10a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z")],
    ai:      [React.createElement("rect", { key: "r", x: 4, y: 7, width: 16, height: 12, rx: 3, fill: "none", stroke: "currentColor", strokeWidth: 1.7 }), P("M12 3v4M9 13h.01M15 13h.01M9 16h6")],
  }[name] || [];
  return React.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", style, "aria-hidden": true },
    c.map((el, i) => React.cloneElement(el, { key: i })));
}

/* ---------- progress ring ---------- */
export function Ring({ pct, size = 56, stroke = 5, color = "var(--acc)", track = "var(--line)", children, label }) {
  const r = (size - stroke) / 2, C = 2 * Math.PI * r;
  const off = C * (1 - Math.max(0, Math.min(1, pct / 100)));
  return React.createElement("div", { style: { position: "relative", width: size, height: size, flex: "none" } },
    React.createElement("svg", { width: size, height: size, style: { transform: "rotate(-90deg)" } },
      React.createElement("circle", { cx: size / 2, cy: size / 2, r, fill: "none", stroke: track, strokeWidth: stroke }),
      React.createElement("circle", { cx: size / 2, cy: size / 2, r, fill: "none", stroke: color, strokeWidth: stroke,
        strokeDasharray: C, strokeDashoffset: off, strokeLinecap: "round", style: { transition: "stroke-dashoffset .6s cubic-bezier(.2,.7,.3,1)" } })),
    React.createElement("div", { style: { position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" } },
      children || (label && React.createElement("span", { className: "mono", style: { fontSize: 13, fontWeight: 600 } }, label))));
}

/* ---------- streak flame ---------- */
export function Flame({ count, size = "lg" }) {
  const lit = count > 0;
  const big = size === "lg";
  return React.createElement("div", { className: "row", style: { gap: big ? 10 : 7 } },
    React.createElement("div", { style: { position: "relative", display: "grid", placeItems: "center",
        width: big ? 44 : 30, height: big ? 44 : 30, borderRadius: "50%",
        background: lit ? "var(--acc-soft)" : "var(--surface-3)" } },
      React.createElement(Icon, { name: "flame", size: big ? 24 : 17, style: { color: lit ? "var(--acc)" : "var(--ink-4)" } })),
    React.createElement("div", { className: "col", style: { lineHeight: 1.05 } },
      React.createElement("span", { className: "mono", style: { fontSize: big ? 22 : 16, fontWeight: 700, color: lit ? "var(--ink)" : "var(--ink-3)" } }, count),
      React.createElement("span", { className: "eyebrow", style: { fontSize: 9.5 } }, "day streak")));
}

/* ---------- section badge ---------- */
export function SecChip({ s }) {
  const map = { s1: ["S1", "var(--s1)"], s2: ["S2", "var(--s2)"], s3: ["S3", "var(--s3)"],
    chem: ["Chem", "var(--s3)"], bio: ["Bio", "var(--s1)"], phys: ["Phys", "var(--gold)"] };
  const [t, c] = map[s] || [s, "var(--ink-3)"];
  return React.createElement("span", { className: "chip", style: { color: c, borderColor: "color-mix(in srgb, " + c + " 30%, transparent)", background: "color-mix(in srgb, " + c + " 9%, var(--surface))" } },
    React.createElement("span", { className: "dot", style: { background: c } }), t);
}

/* ---------- confidence selector ---------- */
export function ConfDots({ value, onChange }) {
  return React.createElement("div", { className: "row", style: { gap: 5 } },
    GH.confLevels.map((l) => {
      const active = (value || "none") === l.v;
      return React.createElement("button", { key: l.v, onClick: (e) => { e.stopPropagation(); onChange(l.v); },
        title: l.label,
        style: { display: "flex", alignItems: "center", gap: 6, cursor: "pointer", border: "1px solid " + (active ? "var(--line-2)" : "transparent"),
          background: active ? "var(--surface)" : "transparent", padding: "4px 8px", borderRadius: 99, transition: "all .12s" } },
        React.createElement("span", { className: "dot", style: { width: 9, height: 9, background: active ? l.dot : "var(--line-2)" } }),
        active && React.createElement("span", { className: "mono", style: { fontSize: 10, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--ink-2)" } }, l.label));
    }));
}

/* ---------- stat tile ---------- */
export function Stat({ value, label, sub, color }) {
  return React.createElement("div", { className: "col", style: { gap: 2 } },
    React.createElement("span", { className: "display", style: { fontSize: 30, color: color || "var(--ink)" } }, value),
    React.createElement("span", { className: "eyebrow" }, label),
    sub && React.createElement("span", { className: "faint", style: { fontSize: 12 } }, sub));
}

/* ---------- countdown chip ---------- */
export function Countdown({ iso, label, color, soft, big }) {
  const d = GH.daysUntil(iso);
  const past = d < 0;
  return React.createElement("div", { className: "card", style: { padding: big ? "18px 20px" : "14px 16px", background: soft || "var(--surface)", border: "1px solid " + (color ? ("color-mix(in srgb," + color + " 26%, var(--line))") : "var(--line)"), flex: 1, minWidth: 0 } },
    React.createElement("div", { className: "eyebrow", style: { color: color || "var(--ink-3)", marginBottom: 6 } }, label),
    React.createElement("div", { className: "row", style: { alignItems: "baseline", gap: 9, flexWrap: "nowrap" } },
      React.createElement("span", { className: "display", style: { fontSize: big ? 50 : 36, lineHeight: 1, color: color || "var(--ink)" } }, past ? "—" : d),
      React.createElement("span", { className: "muted", style: { fontSize: 14, fontWeight: 600, whiteSpace: "nowrap" } }, past ? "done" : (d === 1 ? "day to go" : "days to go"))),
    React.createElement("div", { className: "faint", style: { fontSize: 12.5, marginTop: 4 } }, GH.fmtDate(iso)));
}

/* ---------- timer hook ---------- */
export function useTimer(seconds, running, onDone) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => { setLeft(seconds); }, [seconds]);
  useEffect(() => {
    if (!running) return;
    if (left <= 0) { onDone && onDone(); return; }
    const t = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(t);
  }, [running, left]);
  return [left, setLeft];
}

/* ---------- section header ---------- */
export function PageHead({ eyebrow, title, children }) {
  return React.createElement("div", { className: "row between wrap rise", style: { gap: 16, marginBottom: 22, alignItems: "flex-end" } },
    React.createElement("div", { className: "col", style: { gap: 6 } },
      eyebrow && React.createElement("span", { className: "eyebrow" }, eyebrow),
      React.createElement("h1", { className: "display", style: { fontSize: 34 } }, title)),
    children);
}

/* ---------- attributed quote ---------- */
export function Quote({ q, size = 15.5, color = "var(--ink-2)", authorColor = "var(--ink-3)" }) {
  const text = GH.quoteText(q);
  const author = GH.quoteAuthor(q);
  return React.createElement("div", { className: "col", style: { gap: 3 } },
    React.createElement("span", { className: "serif", style: { fontSize: size, fontStyle: "italic", lineHeight: 1.5, color } }, "“" + text + "”"),
    author && React.createElement("span", { className: "mono", style: { fontSize: 11, letterSpacing: ".04em", color: authorColor } }, "— " + author));
}

/* ---------- spinner ---------- */
export function Spinner({ size = 18, color = "var(--acc)" }) {
  return React.createElement("span", {
    className: "spin",
    style: { display: "inline-block", width: size, height: size, borderRadius: "50%",
      border: "2.5px solid color-mix(in srgb," + color + " 25%, transparent)", borderTopColor: color, flex: "none" },
  });
}

/* expose on the GH singleton so ported view code can call GH.Icon, GH.Ring, … */
Object.assign(GH, { Icon, Ring, Flame, SecChip, ConfDots, Stat, Countdown, useTimer, PageHead, Quote, Spinner });
