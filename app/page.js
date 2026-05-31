"use client";
/* ============================================================
   GAMSAT Study Hub — app shell, nav, theme, mount
   ============================================================ */
import React, { useState, useEffect } from "react";
import { StoreProvider, useStore } from "../lib/store";
import { Icon } from "../components/ui";
import { useThemeState, themeVars, SettingsMenu } from "../components/theme";

import Today from "../components/views/Today";
import Plan from "../components/views/Plan";
import Sections from "../components/views/Sections";
import Essay from "../components/views/Essay";
import Practice from "../components/views/Practice";
import Vocab from "../components/views/Vocab";
import Progress from "../components/views/Progress";

const E = React.createElement;

const VIEWS = { today: Today, plan: Plan, sections: Sections, essay: Essay, practice: Practice, vocab: Vocab, progress: Progress };

const NAV = [
  { k: "today", label: "Today", icon: "today" },
  { k: "plan", label: "Study Plan", icon: "plan" },
  { k: "sections", label: "Sections", icon: "sections" },
  { k: "essay", label: "Essay Studio", icon: "essay" },
  { k: "practice", label: "Practice", icon: "practice" },
  { k: "vocab", label: "Vocab", icon: "vocab" },
  { k: "progress", label: "Progress", icon: "progress" },
];

function Brand() {
  return E("div", { className: "row", style: { gap: 10, alignItems: "center" } },
    E("div", { style: { width: 32, height: 32, borderRadius: 9, background: "var(--acc)", display: "grid", placeItems: "center", flex: "none" } },
      E("span", { className: "serif", style: { color: "#fff", fontSize: 18, fontWeight: 600, lineHeight: 1 } }, "G")),
    E("div", { className: "col", style: { lineHeight: 1.1 } },
      E("span", { className: "serif", style: { fontSize: 17, fontWeight: 600, letterSpacing: "-0.01em" } }, "GAMSAT Hub"),
      E("span", { className: "mono", style: { fontSize: 9.5, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--ink-3)" } }, "Irish GEM · Sep '26")));
}

function NavBtn({ item, active, onClick, compact }) {
  return E("button", { onClick, title: item.label,
    style: { display: "flex", alignItems: "center", gap: 11, width: "100%", padding: compact ? "8px" : "9px 12px", borderRadius: "var(--r-sm)",
      border: "none", cursor: "pointer", background: active ? "var(--acc-soft)" : "transparent", color: active ? "var(--acc-deep)" : "var(--ink-2)",
      justifyContent: compact ? "center" : "flex-start", transition: "all .12s", fontWeight: active ? 600 : 500, fontSize: 14 } },
    E(Icon, { name: item.icon, size: 19, style: { flex: "none" } }),
    !compact && E("span", null, item.label));
}

function App() {
  const { state, api } = useStore();
  const [theme, setTheme] = useThemeState();
  const view = state.view || "today";
  const vars = themeVars(theme);
  const ViewComp = VIEWS[view] || Today;

  return E("div", { style: Object.assign({ height: "100vh", display: "flex", background: "var(--bg)" }, vars) },
    /* sidebar (desktop) */
    E("aside", { className: "gh-sidebar", style: { width: "var(--nav-w)", flex: "none", borderRight: "1px solid var(--line)", background: "var(--surface)", display: "flex", flexDirection: "column", padding: "18px 14px" } },
      E("div", { style: { padding: "4px 6px 18px" } }, E(Brand, null)),
      E("nav", { className: "col", style: { gap: 3, flex: 1 } },
        NAV.map((it) => E(NavBtn, { key: it.k, item: it, active: view === it.k, onClick: () => api.setView(it.k) }))),
      E("div", { className: "col", style: { gap: 4, padding: "10px 0 4px", borderTop: "1px solid var(--line)" } },
        E(SettingsMenu, { theme, setTheme }),
        E("div", { className: "faint", style: { fontSize: 11, lineHeight: 1.5, padding: "8px 8px 0" } },
          "Offers in Irish GEM are made on ", E("strong", { style: { color: "var(--ink-2)" } }, "GAMSAT score"), " once your degree clears the 2:1 bar. Keep going."))),

    /* main */
    E("main", { style: { flex: 1, minWidth: 0, position: "relative", display: "flex", flexDirection: "column" } },
      E("div", { key: view, className: "rise", style: { flex: 1, minHeight: 0 } }, E(ViewComp, null)),
      /* mobile bottom nav */
      E("nav", { className: "gh-botbar", style: { display: "none", borderTop: "1px solid var(--line)", background: "var(--surface)", padding: "6px 4px", gap: 2, justifyContent: "space-around" } },
        NAV.map((it) => E("button", { key: it.k, onClick: () => api.setView(it.k), title: it.label,
          style: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "5px 2px", border: "none", background: "transparent", cursor: "pointer",
            color: view === it.k ? "var(--acc)" : "var(--ink-3)" } },
          E(Icon, { name: it.icon, size: 20 }),
          E("span", { style: { fontSize: 9.5, fontWeight: 600 } }, it.label.split(" ")[0]))))));
}

export default function Page() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    // Stable, theme-default shell during SSR / first paint to avoid hydration
    // mismatches (the whole app is localStorage- and date-driven).
    return E("div", { style: { height: "100vh", display: "grid", placeItems: "center", background: "var(--bg)" } },
      E("div", { className: "col", style: { alignItems: "center", gap: 14 } },
        E("div", { style: { width: 40, height: 40, borderRadius: 11, background: "var(--acc)", display: "grid", placeItems: "center" } },
          E("span", { className: "serif", style: { color: "#fff", fontSize: 24, fontWeight: 600 } }, "G")),
        E("span", { className: "eyebrow" }, "GAMSAT Hub")));
  }

  return E(StoreProvider, null, E(App, null));
}
