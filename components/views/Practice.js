"use client";
/* ============================================================
   GAMSAT Study Hub — Practice (MCQ engine, worked solutions)
   ============================================================ */
import React, { useState, useEffect, useRef } from "react";
import GH from "../../lib/gh";
import "../ui";
import "../../lib/store";

const E = React.createElement;

const FILTERS = [
  { k: "mixed", label: "Mixed", color: "var(--acc)" },
  { k: "chem", label: "Chemistry", color: "var(--s3)" },
  { k: "bio", label: "Biology", color: "var(--s1)" },
  { k: "phys", label: "Physics", color: "var(--gold)" },
  { k: "s1", label: "Section I", color: "var(--s1)" },
];
function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const LET = ["A", "B", "C", "D", "E"];

export default function Practice() {
  const { api, stats } = GH.useStore();
  const [phase, setPhase] = useState("setup"); // setup | quiz | done
  const [filter, setFilter] = useState("mixed");
  const [qs, setQs] = useState([]);
  const [idx, setIdx] = useState(0);
  const [choice, setChoice] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [results, setResults] = useState([]); // {qid, correct}
  const [secs, setSecs] = useState(0);
  const scrollRef = useRef(null);

  useEffect(() => { if (phase !== "quiz") return; const t = setInterval(() => setSecs((s) => s + 1), 1000); return () => clearInterval(t); }, [phase]);

  function start(n) {
    const pool = filter === "mixed" ? GH.questions : GH.questions.filter((q) => q.section === filter);
    const picked = shuffle(pool).slice(0, Math.min(n, pool.length));
    setQs(picked); setIdx(0); setChoice(null); setRevealed(false); setResults([]); setSecs(0); setPhase("quiz");
  }
  function submit() {
    if (choice === null) return;
    const q = qs[idx]; const correct = choice === q.answer;
    api.answerQ(q.id, choice, correct);
    setResults((r) => [...r, { qid: q.id, correct, section: q.section }]);
    setRevealed(true);
  }
  function next() {
    if (idx + 1 >= qs.length) {
      const correct = results.filter((r) => r.correct).length;
      api.logQuiz({ date: GH.todayISO(), filter, correct, total: qs.length });
      setPhase("done"); return;
    }
    setIdx((i) => i + 1); setChoice(null); setRevealed(false);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }

  /* ---------- SETUP ---------- */
  if (phase === "setup") {
    const f = FILTERS.find((x) => x.k === filter);
    const count = filter === "mixed" ? GH.questions.length : GH.questions.filter((q) => q.section === filter).length;
    return E("div", { className: "scroll", style: { height: "100%", padding: "34px clamp(18px,4vw,46px) 80px" } },
      E("div", { style: { maxWidth: 820, margin: "0 auto" } },
        E(GH.PageHead, { eyebrow: "Reason, don't memorise · worked solutions on every question", title: "Practice" },
          stats.questionsAnswered > 0 && E("div", { className: "row", style: { gap: 10 } },
            E(GH.Ring, { pct: stats.accuracyOverall, size: 46, color: "var(--s1)" }, E("span", { className: "mono", style: { fontSize: 11, fontWeight: 700 } }, stats.accuracyOverall + "%")),
            E("div", { className: "col", style: { lineHeight: 1.15 } }, E("span", { style: { fontWeight: 700, fontSize: 14 } }, stats.totalCorrect + "/" + stats.questionsAnswered), E("span", { className: "eyebrow", style: { fontSize: 9 } }, "all-time")))),

        E("div", { className: "card rise", style: { padding: "22px 24px", marginBottom: 18 } },
          E("span", { className: "eyebrow", style: { display: "block", marginBottom: 12 } }, "Pick a focus"),
          E("div", { className: "row wrap", style: { gap: 9, marginBottom: 22 } },
            FILTERS.map((x) => E("button", { key: x.k, onClick: () => setFilter(x.k),
              style: { cursor: "pointer", padding: "9px 16px", borderRadius: 99, fontWeight: 600, fontSize: 13.5,
                border: "1px solid " + (filter === x.k ? "transparent" : "var(--line-2)"),
                background: filter === x.k ? x.color : "var(--surface)", color: filter === x.k ? "#fff" : "var(--ink-2)", transition: "all .15s" } }, x.label))),

          E("div", { className: "row between wrap", style: { gap: 14 } },
            E("div", { className: "col", style: { gap: 3 } },
              E("span", { className: "display", style: { fontSize: 18, color: f.color } }, f.label + " set"),
              E("span", { className: "faint", style: { fontSize: 13 } }, count + " questions available")),
            E("div", { className: "row wrap", style: { gap: 9 } },
              [5, 10].map((n) => E("button", { key: n, className: "btn", disabled: count === 0, onClick: () => start(n) }, n + " Qs")),
              E("button", { className: "btn btn-primary", disabled: count === 0, onClick: () => start(count) }, E(GH.Icon, { name: "practice", size: 15 }), "All " + count)))),

        E("div", { className: "card rise", style: { padding: "16px 18px", background: "var(--s3-soft)", border: "1px solid color-mix(in srgb,var(--s3) 22%,transparent)", display: "flex", gap: 13, alignItems: "flex-start" } },
          E(GH.Icon, { name: "spark", size: 19, style: { color: "var(--s3)", flex: "none", marginTop: 1 } }),
          E("span", { className: "muted", style: { fontSize: 13.5, lineHeight: 1.55 } }, "These are GAMSAT-style ", E("em", null, "reasoning"), " questions — the stem usually contains what you need. Don't panic if a topic feels unfamiliar; work the information in front of you. Chemistry carries the most weight, so start there."))
      ));
  }

  /* ---------- DONE ---------- */
  if (phase === "done") {
    const correct = results.filter((r) => r.correct).length;
    const pct = Math.round(100 * correct / results.length);
    const bySec = {};
    results.forEach((r) => { (bySec[r.section] = bySec[r.section] || [0, 0]); bySec[r.section][1]++; if (r.correct) bySec[r.section][0]++; });
    return E("div", { className: "scroll", style: { height: "100%", padding: "34px clamp(18px,4vw,46px) 80px" } },
      E("div", { style: { maxWidth: 760, margin: "0 auto", textAlign: "center" } },
        E("div", { className: "pop", style: { margin: "10px auto 0" } }, E(GH.Ring, { pct, size: 130, stroke: 10, color: pct >= 70 ? "var(--good)" : pct >= 50 ? "var(--gold)" : "var(--acc)" },
          E("div", { className: "col", style: { alignItems: "center" } }, E("span", { className: "display", style: { fontSize: 40 } }, pct + "%"), E("span", { className: "eyebrow", style: { fontSize: 9 } }, correct + " / " + results.length)))),
        E("h2", { className: "display", style: { fontSize: 28, margin: "18px 0 6px" } }, pct >= 70 ? "Strong work." : pct >= 50 ? "Solid — keep building." : "Every miss is a lesson."),
        E("p", { className: "muted", style: { fontSize: 15, marginBottom: 24 } }, "Finished in " + GH.fmtClock(secs) + ". Review below — read every solution, even the ones you got right."),

        Object.keys(bySec).length > 1 && E("div", { className: "row wrap", style: { gap: 10, justifyContent: "center", marginBottom: 24 } },
          Object.entries(bySec).map(([s, [c, t]]) => E("div", { key: s, className: "card", style: { padding: "10px 16px" } },
            E(GH.SecChip, { s }), E("div", { className: "mono", style: { fontSize: 15, fontWeight: 700, marginTop: 6 } }, c + "/" + t)))),

        E("div", { className: "col", style: { gap: 10, textAlign: "left", marginBottom: 24 } },
          qs.map((q, i) => { const r = results[i]; return E("div", { key: q.id, className: "card", style: { padding: "14px 16px", borderLeft: "3px solid " + (r.correct ? "var(--good)" : "var(--acc)") } },
            E("div", { className: "row", style: { gap: 8, marginBottom: 6 } }, E(GH.SecChip, { s: q.section }),
              E("span", { className: "chip", style: { fontFamily: "var(--sans)", textTransform: "none", letterSpacing: 0 } }, q.topic),
              E("span", { className: "mono", style: { fontSize: 11, fontWeight: 700, marginLeft: "auto", color: r.correct ? "var(--good)" : "var(--acc)" } }, r.correct ? "Correct" : "Missed")),
            E("div", { style: { fontSize: 14, lineHeight: 1.5, color: "var(--ink-2)" } }, q.stem)); })),

        E("div", { className: "row", style: { gap: 10, justifyContent: "center" } },
          E("button", { className: "btn btn-primary", onClick: () => setPhase("setup") }, "New set"),
          E("button", { className: "btn", onClick: () => start(qs.length) }, E(GH.Icon, { name: "reset", size: 15 }), "Retry similar")))
    );
  }

  /* ---------- QUIZ ---------- */
  const q = qs[idx];
  return E("div", { style: { height: "100%", display: "flex", flexDirection: "column" } },
    E("div", { style: { height: 4, background: "var(--line)" } }, E("div", { style: { height: "100%", width: (100 * (idx + (revealed ? 1 : 0)) / qs.length) + "%", background: "var(--acc)", transition: "width .3s" } })),
    E("div", { className: "row between", style: { padding: "12px clamp(16px,3vw,30px)", borderBottom: "1px solid var(--line)", background: "var(--surface)" } },
      E("div", { className: "row", style: { gap: 12 } }, E(GH.SecChip, { s: q.section }), E("span", { className: "faint", style: { fontSize: 13 } }, q.topic)),
      E("div", { className: "row", style: { gap: 14 } },
        E("span", { className: "mono faint", style: { fontSize: 13 } }, GH.fmtClock(secs)),
        E("span", { className: "mono", style: { fontSize: 13, fontWeight: 700 } }, (idx + 1) + " / " + qs.length))),
    E("div", { className: "scroll", ref: scrollRef, style: { flex: 1 } },
      E("div", { style: { maxWidth: 720, margin: "0 auto", padding: "26px clamp(16px,3vw,20px) 60px" } },
        q.passage && E("div", { className: "card", style: { padding: "16px 18px", marginBottom: 16, background: "var(--surface-2)" } },
          E("div", { className: "serif", style: { fontSize: 16.5, fontStyle: "italic", lineHeight: 1.6, color: "var(--ink-2)" } }, q.passage)),
        E("h2", { style: { fontSize: 18.5, lineHeight: 1.5, fontWeight: 600, marginBottom: 18 } }, q.stem),
        E("div", { className: "col", style: { gap: 9, marginBottom: 20 } }, q.options.map((opt, i) => {
          const isAns = i === q.answer, isPick = i === choice;
          let bd = "var(--line-2)", bg = "var(--surface)", fg = "var(--ink)";
          if (revealed) { if (isAns) { bd = "var(--good)"; bg = "var(--good-soft)"; } else if (isPick) { bd = "var(--acc)"; bg = "var(--acc-soft)"; } else { fg = "var(--ink-3)"; } }
          else if (isPick) { bd = "var(--acc)"; bg = "var(--acc-soft)"; }
          return E("button", { key: i, disabled: revealed, onClick: () => setChoice(i),
            style: { display: "flex", gap: 13, alignItems: "flex-start", textAlign: "left", padding: "13px 15px", borderRadius: "var(--r-sm)",
              border: "1.6px solid " + bd, background: bg, color: fg, cursor: revealed ? "default" : "pointer", transition: "all .12s", width: "100%" } },
            E("span", { className: "mono", style: { flex: "none", width: 24, height: 24, borderRadius: 6, display: "grid", placeItems: "center", fontWeight: 700, fontSize: 12,
              background: (revealed && isAns) ? "var(--good)" : (isPick ? "var(--acc)" : "var(--surface-3)"), color: (isPick || (revealed && isAns)) ? "#fff" : "var(--ink-3)" } }, LET[i]),
            E("span", { style: { fontSize: 14.5, lineHeight: 1.45, paddingTop: 2 } }, opt),
            revealed && isAns && E(GH.Icon, { name: "check", size: 17, style: { color: "var(--good)", marginLeft: "auto", flex: "none" } }));
        })),
        revealed && E("div", { className: "card rise", style: { padding: "16px 18px", marginBottom: 20, background: "var(--surface-2)" } },
          E("div", { className: "row", style: { gap: 8, marginBottom: 7 } }, E(GH.Icon, { name: "spark", size: 16, style: { color: "var(--acc)" } }), E("span", { className: "eyebrow", style: { color: "var(--acc)" } }, "Worked solution")),
          E("div", { style: { fontSize: 14.5, lineHeight: 1.6, color: "var(--ink-2)" } }, q.solution)),
        E("div", { className: "row between" },
          E("button", { className: "btn btn-ghost", onClick: () => setPhase("setup") }, "Quit"),
          revealed
            ? E("button", { className: "btn btn-primary", onClick: next }, idx + 1 >= qs.length ? "See results" : "Next question", E(GH.Icon, { name: "arrow", size: 15 }))
            : E("button", { className: "btn btn-primary", disabled: choice === null, onClick: submit }, "Check answer")))));
}
