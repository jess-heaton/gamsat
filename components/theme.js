"use client";
/* ============================================================
   GAMSAT Study Hub — real theme system
   Replaces the Claude-Design "tweaks" host-protocol panel with a
   genuine, persisted in-app settings popover (accent / paper / serif).
   ============================================================ */
import React, { useState, useEffect, useRef } from "react";
import { Icon } from "./ui";

export const ACCENTS = {
  Terracotta: { acc: "#c0492f", deep: "#9a3620", soft: "#f4e3da", soft2: "#efd6c9" },
  Indigo:     { acc: "#465aa0", deep: "#33447d", soft: "#e4e7f3", soft2: "#ced5ec" },
  Forest:     { acc: "#3d7a57", deep: "#2c5b40", soft: "#deeee4", soft2: "#c7e3d2" },
  Plum:       { acc: "#8a4a66", deep: "#6b3850", soft: "#f1e2ea", soft2: "#e5ccd9" },
};
export const TONES = {
  Cream: { bg: "#faf6ec", bg2: "#f3ecdb", s1: "#fffdf8", s2: "#fbf7ed", s3: "#f6efe1", line: "#ebe3d2", line2: "#ddd2bd" },
  Sand:  { bg: "#f4ecdd", bg2: "#ebe0c9", s1: "#fdf8ee", s2: "#f6eedd", s3: "#efe4cf", line: "#e3d8c0", line2: "#d3c4a6" },
  Mist:  { bg: "#f3f3ef", bg2: "#e8e8e2", s1: "#fdfdfb", s2: "#f6f6f2", s3: "#eeeee8", line: "#e5e5df", line2: "#d4d4cc" },
};
export const SERIFS = { Newsreader: "Newsreader", Spectral: "Spectral", "Source Serif": "'Source Serif 4'" };

const KEY = "gh_theme_v1";
const DEFAULTS = { accent: "Terracotta", tone: "Cream", serif: "Newsreader" };

export function useThemeState() {
  const [theme, setThemeRaw] = useState(DEFAULTS);
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) setThemeRaw({ ...DEFAULTS, ...JSON.parse(raw) });
    } catch (e) {}
  }, []);
  const setTheme = (k, v) => setThemeRaw((prev) => {
    const next = { ...prev, [k]: v };
    try { window.localStorage.setItem(KEY, JSON.stringify(next)); } catch (e) {}
    return next;
  });
  return [theme, setTheme];
}

/* build the CSS custom-property object for a given theme */
export function themeVars(theme) {
  const a = ACCENTS[theme.accent] || ACCENTS.Terracotta;
  const tone = TONES[theme.tone] || TONES.Cream;
  return {
    "--acc": a.acc, "--acc-deep": a.deep, "--acc-soft": a.soft, "--acc-soft2": a.soft2,
    "--s2": a.acc, "--s2-soft": a.soft,
    "--bg": tone.bg, "--bg-2": tone.bg2, "--surface": tone.s1, "--surface-2": tone.s2, "--surface-3": tone.s3,
    "--line": tone.line, "--line-2": tone.line2,
    "--serif": (SERIFS[theme.serif] || "Newsreader") + ", Georgia, serif",
  };
}

/* segmented control */
function Seg({ value, options, onChange, render }) {
  return React.createElement("div", { className: "row", style: { gap: 6, flexWrap: "wrap" } },
    options.map((o) => {
      const on = o === value;
      return React.createElement("button", { key: o, onClick: () => onChange(o),
        style: { cursor: "pointer", border: "1px solid " + (on ? "var(--ink-3)" : "var(--line-2)"),
          background: on ? "var(--surface-3)" : "var(--surface)", color: on ? "var(--ink)" : "var(--ink-2)",
          padding: "6px 11px", borderRadius: 99, fontSize: 12.5, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 7, transition: "all .12s" } },
        render ? render(o, on) : o);
    }));
}

export function SettingsMenu({ theme, setTheme, compact }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onEsc = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onEsc); };
  }, [open]);

  return React.createElement("div", { ref, style: { position: "relative" } },
    React.createElement("button", { onClick: () => setOpen((o) => !o), title: "Appearance",
      style: { display: "flex", alignItems: "center", gap: 9, width: "100%", padding: compact ? "8px" : "9px 12px",
        borderRadius: "var(--r-sm)", border: "none", cursor: "pointer", background: open ? "var(--surface-3)" : "transparent",
        color: "var(--ink-2)", justifyContent: compact ? "center" : "flex-start", fontWeight: 500, fontSize: 14 } },
      React.createElement(Icon, { name: "settings", size: 18, style: { flex: "none" } }),
      !compact && React.createElement("span", null, "Appearance")),

    open && React.createElement("div", {
      style: { position: "absolute", bottom: "calc(100% + 8px)", left: 0, width: 248, zIndex: 50,
        background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--r)", boxShadow: "var(--sh-3)",
        padding: "14px 15px", display: "flex", flexDirection: "column", gap: 14 } },
      React.createElement("span", { className: "eyebrow" }, "Accent"),
      React.createElement("div", { className: "row", style: { gap: 8 } },
        Object.entries(ACCENTS).map(([name, a]) => {
          const on = theme.accent === name;
          return React.createElement("button", { key: name, title: name, onClick: () => setTheme("accent", name),
            style: { width: 30, height: 30, borderRadius: 8, background: a.acc, cursor: "pointer",
              border: on ? "2px solid var(--ink)" : "2px solid transparent", boxShadow: "0 0 0 1px var(--line)", flex: "none" } });
        })),
      React.createElement("span", { className: "eyebrow" }, "Paper"),
      React.createElement(Seg, { value: theme.tone, options: Object.keys(TONES), onChange: (v) => setTheme("tone", v) }),
      React.createElement("span", { className: "eyebrow" }, "Headings"),
      React.createElement(Seg, { value: theme.serif, options: Object.keys(SERIFS), onChange: (v) => setTheme("serif", v),
        render: (o) => React.createElement("span", { style: { fontFamily: (SERIFS[o] || "Newsreader") + ", serif" } }, o) })));
}
