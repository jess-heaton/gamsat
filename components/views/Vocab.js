"use client";
/* ============================================================
   GAMSAT Study Hub — Vocab flashcards
   ============================================================ */
import React, { useState, useMemo } from "react";
import GH from "../../lib/gh";
import "../ui";
import "../../lib/store";

const E = React.createElement;

export default function Vocab() {
  const { state, api } = GH.useStore();
  const [mode, setMode] = useState("study"); // study | all
  const [i, setI] = useState(0);
  const [flip, setFlip] = useState(false);

  const known = Object.values(state.vocab).filter((v) => v === "known").length;
  const queue = useMemo(() => {
    if (mode === "all") return GH.vocab;
    // study: unseen + review first, drop 'known'
    const q = GH.vocab.filter((v) => state.vocab[v.w] !== "known");
    return q.length ? q : GH.vocab;
  }, [mode, state.vocab]);

  const card = queue[i % queue.length];
  const status = state.vocab[card.w];

  function mark(s) {
    api.setVocab(card.w, s);
    setFlip(false);
    setI((x) => x + 1);
  }
  function skip() { setFlip(false); setI((x) => x + 1); }

  return E("div", { className: "scroll", style: { height: "100%", padding: "34px clamp(18px,4vw,46px) 80px" } },
    E("div", { style: { maxWidth: 680, margin: "0 auto" } },
      E(GH.PageHead, { eyebrow: "GAMSAT-level vocabulary · sharpens Section I & your essays", title: "Vocab Deck" },
        E("div", { className: "row", style: { gap: 12 } },
          E(GH.Ring, { pct: Math.round(100 * known / GH.vocab.length), size: 48, color: "var(--s1)" }, E("span", { className: "mono", style: { fontSize: 11, fontWeight: 700 } }, known)),
          E("div", { className: "col", style: { lineHeight: 1.15 } }, E("span", { style: { fontWeight: 700, fontSize: 14 } }, known + " / " + GH.vocab.length), E("span", { className: "eyebrow", style: { fontSize: 9 } }, "learned")))),

      /* mode toggle */
      E("div", { className: "row between", style: { marginBottom: 18 } },
        E("div", { className: "row", style: { gap: 5, background: "var(--surface-3)", padding: 3, borderRadius: 99 } },
          [["study", "Study queue"], ["all", "Browse all"]].map(([k, l]) => E("button", { key: k, onClick: () => { setMode(k); setI(0); setFlip(false); },
            style: { border: "none", cursor: "pointer", padding: "7px 15px", borderRadius: 99, fontSize: 13, fontWeight: 600,
              background: mode === k ? "var(--surface)" : "transparent", color: mode === k ? "var(--ink)" : "var(--ink-3)", boxShadow: mode === k ? "var(--sh-1)" : "none" } }, l))),
        E("span", { className: "mono faint", style: { fontSize: 12 } }, (i % queue.length + 1) + " / " + queue.length)),

      /* flashcard */
      E("div", { onClick: () => setFlip((f) => !f), className: "card",
        style: { cursor: "pointer", minHeight: 300, padding: "34px 32px", display: "flex", flexDirection: "column",
          justifyContent: "center", position: "relative", boxShadow: "var(--sh-2)", background: flip ? "var(--surface-2)" : "var(--surface)", transition: "background .2s" } },
        E("div", { className: "row between", style: { position: "absolute", top: 16, left: 20, right: 20 } },
          E("span", { className: "eyebrow" }, flip ? "Definition" : "Tap to reveal"),
          status && E("span", { className: "chip", style: { color: status === "known" ? "var(--good)" : "var(--gold)" } }, status === "known" ? "learned" : "reviewing")),
        !flip
          ? E("div", { className: "col", style: { alignItems: "center", textAlign: "center", gap: 8 } },
              E("span", { className: "display", style: { fontSize: "clamp(34px,7vw,52px)" } }, card.w),
              E("span", { className: "mono faint", style: { fontSize: 14 } }, card.pos))
          : E("div", { className: "col", style: { gap: 16 } },
              E("div", { className: "col", style: { gap: 4 } },
                E("span", { className: "display", style: { fontSize: 26 } }, card.w, E("span", { className: "mono faint", style: { fontSize: 13, marginLeft: 10 } }, card.pos)),
                E("span", { style: { fontSize: 17, lineHeight: 1.55, color: "var(--ink)" } }, card.def)),
              E("div", { style: { borderLeft: "3px solid var(--s1)", paddingLeft: 14 } },
                E("span", { className: "serif", style: { fontSize: 16, fontStyle: "italic", color: "var(--ink-2)", lineHeight: 1.55 } }, card.ex)))),

      /* controls */
      E("div", { className: "row between", style: { marginTop: 18, gap: 10 } },
        E("button", { className: "btn btn-ghost", onClick: skip }, "Skip"),
        E("div", { className: "row", style: { gap: 10 } },
          E("button", { className: "btn", style: { borderColor: "color-mix(in srgb,var(--gold) 40%,var(--line))", color: "var(--gold)" }, onClick: () => mark("review") },
            E(GH.Icon, { name: "reset", size: 15 }), "Still learning"),
          E("button", { className: "btn btn-primary", style: { background: "var(--good)", borderColor: "var(--good)" }, onClick: () => mark("known") },
            E(GH.Icon, { name: "check", size: 15 }), "Got it"))),

      E("div", { className: "faint", style: { fontSize: 12.5, textAlign: "center", marginTop: 16, lineHeight: 1.5 } },
        "Cards you mark “still learning” keep coming back in the study queue. “Got it” retires them — but they're always here in Browse all.")
    ));
}
