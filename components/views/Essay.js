"use client";
/* ============================================================
   GAMSAT Study Hub — Essay Studio (timed writing + self-rubric
   + Claude Opus marking against the ACER criteria)
   ============================================================ */
import React, { useState, useEffect, useRef } from "react";
import GH from "../../lib/gh";
import "../ui";
import "../../lib/store";

const E = React.createElement;
const SKEY = "gh_essay_session";

const RUBRIC = [
  { c: "Thought & content", color: "var(--s2)", items: [
    "I identified a clear theme across the quotes",
    "I took a definite position / angle (a thesis)",
    "I supported it with concrete examples or evidence",
    "I explored nuance — not just one obvious idea",
  ]},
  { c: "Organisation & expression", color: "var(--s1)", items: [
    "It has a clear beginning, middle and end",
    "Each paragraph develops one idea and links back",
    "The opening hooks and the conclusion lands",
    "The language is controlled and varied",
  ]},
];

function wordCount(t) { return (t.trim().match(/\S+/g) || []).length; }

function loadSession() { try { return JSON.parse(localStorage.getItem(SKEY)); } catch (e) { return null; } }
function saveSession(o) { try { localStorage.setItem(SKEY, JSON.stringify(o)); } catch (e) {} }
function clearSession() { try { localStorage.removeItem(SKEY); } catch (e) {} }

/* score colour by 0–100 band */
function bandColor(pct) { return pct >= 75 ? "var(--good)" : pct >= 55 ? "var(--gold)" : "var(--acc)"; }

/* ---------- Claude Opus marking panel ---------- */
function AiMarking({ task, prompt, text, onMarked }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ai, setAi] = useState(null);
  const wc = wordCount(text);

  async function mark() {
    setLoading(true); setError(null);
    try {
      const quotes = prompt.quotes.map((q) => (typeof q === "string" ? q : (q.text + (q.author ? " — " + q.author : ""))));
      const res = await fetch("/api/mark-essay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task, theme: prompt.theme, quotes, text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Marking failed. Check the server has an ANTHROPIC_API_KEY set.");
      setAi(data);
      onMarked && onMarked(data);
    } catch (e) {
      setError(e.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (!ai) {
    return E("div", { className: "card", style: { padding: "20px 22px", marginBottom: 18, background: "color-mix(in srgb,var(--acc) 5%,var(--surface))", border: "1px solid var(--acc-soft2)" } },
      E("div", { className: "row between wrap", style: { gap: 12 } },
        E("div", { className: "col", style: { gap: 4, flex: "1 1 280px", minWidth: 0 } },
          E("div", { className: "row", style: { gap: 9 } },
            E(GH.Icon, { name: "ai", size: 19, style: { color: "var(--acc)" } }),
            E("span", { className: "display", style: { fontSize: 18 } }, "Mark with Claude Opus")),
          E("span", { className: "muted", style: { fontSize: 13.5, lineHeight: 1.5 } },
            "Get an estimated GAMSAT band, scores on both rater criteria, and concrete, line-level feedback — as a senior Section II rater would give it.")),
        E("button", { className: "btn btn-primary", disabled: loading || wc < 40, onClick: mark, style: { alignSelf: "center" } },
          loading ? E(GH.Spinner, { size: 16, color: "#fff" }) : E(GH.Icon, { name: "spark", size: 15 }),
          loading ? "Marking…" : "Mark my essay")),
      wc < 40 && E("div", { className: "faint", style: { fontSize: 12, marginTop: 10 } }, "Write at least ~40 words to get useful marking."),
      error && E("div", { style: { fontSize: 13, marginTop: 12, color: "var(--acc-deep)", background: "var(--acc-soft)", padding: "10px 12px", borderRadius: "var(--r-sm)", lineHeight: 1.5 } }, error));
  }

  /* ----- render AI feedback ----- */
  const overallPct = ai.overall && typeof ai.overall.estimatePct === "number" ? ai.overall.estimatePct : null;
  return E("div", { className: "card rise", style: { padding: "22px 24px", marginBottom: 18, border: "1px solid var(--acc-soft2)" } },
    E("div", { className: "row between wrap", style: { gap: 12, marginBottom: 16, alignItems: "flex-start" } },
      E("div", { className: "row", style: { gap: 10 } },
        E(GH.Icon, { name: "ai", size: 20, style: { color: "var(--acc)" } }),
        E("span", { className: "display", style: { fontSize: 20 } }, "Claude Opus · rater feedback")),
      overallPct != null && E("div", { className: "row", style: { gap: 12 } },
        E(GH.Ring, { pct: overallPct, size: 60, stroke: 6, color: bandColor(overallPct) },
          E("span", { className: "mono", style: { fontSize: 14, fontWeight: 700 } }, ai.overall.band || Math.round(overallPct / 100 * 7))),
        E("div", { className: "col", style: { lineHeight: 1.15, justifyContent: "center" } },
          E("span", { style: { fontWeight: 700, fontSize: 14 } }, ai.overall.estimate || "—"),
          E("span", { className: "eyebrow", style: { fontSize: 9 } }, "est. band")))),

    ai.overall && ai.overall.oneLiner && E("p", { className: "serif", style: { fontSize: 17, fontStyle: "italic", lineHeight: 1.55, color: "var(--ink-2)", marginBottom: 18 } }, "“" + ai.overall.oneLiner + "”"),

    /* criteria */
    Array.isArray(ai.criteria) && E("div", { className: "col", style: { gap: 12, marginBottom: 18 } },
      ai.criteria.map((cr, i) => {
        const pct = typeof cr.scorePct === "number" ? cr.scorePct : (cr.score ? Math.round(cr.score / 7 * 100) : 0);
        const color = i === 0 ? "var(--s2)" : "var(--s1)";
        return E("div", { key: i, className: "col", style: { gap: 7, padding: "14px 16px", border: "1px solid var(--line)", borderRadius: "var(--r-sm)", background: "var(--surface-2)" } },
          E("div", { className: "row between" },
            E("div", { className: "row", style: { gap: 8 } }, E("span", { className: "dot", style: { background: color, width: 9, height: 9 } }), E("span", { style: { fontWeight: 600, fontSize: 14.5, color } }, cr.name)),
            E("span", { className: "mono", style: { fontWeight: 700, fontSize: 13, color } }, cr.score ? cr.score + "/7" : pct + "%")),
          E("div", { style: { height: 7, borderRadius: 99, background: "var(--surface-3)", overflow: "hidden" } },
            E("div", { style: { height: "100%", width: Math.max(3, pct) + "%", background: color, borderRadius: 99 } })),
          E("div", { className: "muted", style: { fontSize: 13.5, lineHeight: 1.55, marginTop: 2 } }, cr.comment));
      })),

    /* strengths + improvements */
    E("div", { className: "grid-2c", style: { gap: 14, marginBottom: 16 } },
      Array.isArray(ai.strengths) && E("div", { className: "col", style: { gap: 8 } },
        E("span", { className: "eyebrow", style: { color: "var(--good)" } }, "What worked"),
        ai.strengths.map((s, i) => E("div", { key: i, className: "row", style: { gap: 9, alignItems: "flex-start" } },
          E(GH.Icon, { name: "check", size: 15, style: { color: "var(--good)", flex: "none", marginTop: 2 } }),
          E("span", { style: { fontSize: 13.5, lineHeight: 1.5, color: "var(--ink-2)" } }, s)))),
      Array.isArray(ai.improvements) && E("div", { className: "col", style: { gap: 8 } },
        E("span", { className: "eyebrow", style: { color: "var(--acc)" } }, "What to lift"),
        ai.improvements.map((s, i) => E("div", { key: i, className: "row", style: { gap: 9, alignItems: "flex-start" } },
          E(GH.Icon, { name: "arrow", size: 15, style: { color: "var(--acc)", flex: "none", marginTop: 2 } }),
          E("span", { style: { fontSize: 13.5, lineHeight: 1.5, color: "var(--ink-2)" } }, s))))),

    /* line edits */
    Array.isArray(ai.lineEdits) && ai.lineEdits.length > 0 && E("div", { className: "col", style: { gap: 8, marginBottom: 16 } },
      E("span", { className: "eyebrow" }, "Line-level suggestions"),
      ai.lineEdits.map((le, i) => E("div", { key: i, className: "col", style: { gap: 4, padding: "11px 14px", borderLeft: "3px solid var(--gold)", background: "var(--surface-2)", borderRadius: "0 var(--r-sm) var(--r-sm) 0" } },
        le.quote && E("span", { className: "serif", style: { fontSize: 13.5, fontStyle: "italic", color: "var(--ink-3)", lineHeight: 1.5 } }, "“" + le.quote + "”"),
        E("span", { style: { fontSize: 13.5, lineHeight: 1.5, color: "var(--ink-2)" } }, le.suggestion)))),

    /* next step */
    ai.nextStep && E("div", { className: "row", style: { gap: 11, padding: "13px 16px", background: "var(--acc-soft)", borderRadius: "var(--r-sm)", alignItems: "flex-start" } },
      E(GH.Icon, { name: "target", size: 17, style: { color: "var(--acc-deep)", flex: "none", marginTop: 1 } }),
      E("div", { className: "col", style: { gap: 2 } },
        E("span", { className: "eyebrow", style: { color: "var(--acc-deep)" } }, "Your one next move"),
        E("span", { style: { fontSize: 14, lineHeight: 1.5, color: "var(--acc-deep)" } }, ai.nextStep))),

    E("div", { className: "faint", style: { fontSize: 11.5, marginTop: 14, lineHeight: 1.5 } },
      "An AI estimate to guide practice — not an official ACER score. Real essays are marked by three trained human raters."));
}

export default function Essay() {
  const { state, api } = GH.useStore();
  const init = typeof window !== "undefined" ? loadSession() : null;
  const [phase, setPhase] = useState(init?.phase || "setup"); // setup | writing | review
  const [taskSel, setTaskSel] = useState(init?.taskSel || "A");
  const [promptId, setPromptId] = useState(init?.promptId || null);
  const [text, setText] = useState(init?.text || "");
  const [secs, setSecs] = useState(init?.secs ?? 1800);
  const [running, setRunning] = useState(false);
  const [checks, setChecks] = useState({});
  const [aiResult, setAiResult] = useState(null);
  const taRef = useRef(null);

  const prompts = GH.essayPrompts.filter((p) => p.task === taskSel);
  const prompt = GH.essayPrompts.find((p) => p.id === promptId) || prompts[0];

  // persist session
  useEffect(() => {
    if (phase === "setup") { clearSession(); return; }
    saveSession({ phase, taskSel, promptId: prompt?.id, text, secs });
  }, [phase, taskSel, promptId, text, secs]); // eslint-disable-line

  // timer
  useEffect(() => {
    if (!running) return;
    if (secs <= 0) { setRunning(false); setPhase("review"); return; }
    const t = setTimeout(() => setSecs((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [running, secs]);

  function pick(task) { setTaskSel(task); const list = GH.essayPrompts.filter((p) => p.task === task); setPromptId(list[Math.floor(Math.random() * list.length)].id); }
  function shuffle() { const list = GH.essayPrompts.filter((p) => p.task === taskSel); setPromptId(list[Math.floor(Math.random() * list.length)].id); }
  function begin(mins) { if (!promptId) setPromptId(prompts[0].id); setSecs(mins * 60); setText(""); setChecks({}); setAiResult(null); setPhase("writing"); setRunning(true); setTimeout(() => taRef.current && taRef.current.focus(), 60); }
  function finish() { setRunning(false); setPhase("review"); }
  function save() {
    const total = RUBRIC.reduce((n, r) => n + r.items.length, 0);
    const got = Object.values(checks).filter(Boolean).length;
    const score = Math.round(got / total * 100);
    api.addEssay({ id: "es-" + Date.now(), task: taskSel, theme: prompt.theme, words: wordCount(text), date: GH.todayISO(), score, text, ai: aiResult || null });
    clearSession(); setPhase("setup"); setText(""); setPromptId(null); setChecks({}); setAiResult(null);
  }
  function discard() { clearSession(); setPhase("setup"); setText(""); setPromptId(null); setSecs(1800); setChecks({}); setAiResult(null); }

  const wc = wordCount(text);
  const accent = taskSel === "A" ? "var(--s2)" : "var(--s1)";

  /* ---------- SETUP ---------- */
  if (phase === "setup") {
    return E("div", { className: "scroll", style: { height: "100%", padding: "34px clamp(18px,4vw,46px) 80px" } },
      E("div", { style: { maxWidth: 860, margin: "0 auto" } },
        E(GH.PageHead, { eyebrow: "Section II practice · build the habit", title: "Essay Studio" },
          state.essays.length > 0 && E("span", { className: "chip", style: { color: "var(--s2)" } }, E(GH.Icon, { name: "write", size: 12 }), state.essays.length + " written")),

        E("div", { className: "card rise", style: { padding: "22px 24px", marginBottom: 18 } },
          E("span", { className: "eyebrow", style: { display: "block", marginBottom: 12 } }, "Choose your task"),
          E("div", { className: "cards-2", style: { gap: 12, marginBottom: 20 } },
            [["A", "Task A — Argumentative", "Socio-cultural themes. Build a structured case.", "var(--s2)"],
             ["B", "Task B — Reflective", "Personal & emotional themes. Reflect or create.", "var(--s1)"]].map(([k, t, d, c]) =>
              E("button", { key: k, onClick: () => pick(k), className: "card",
                style: { cursor: "pointer", textAlign: "left", padding: "15px 16px",
                  borderColor: taskSel === k ? "color-mix(in srgb," + c + " 55%,var(--line))" : "var(--line)",
                  background: taskSel === k ? "color-mix(in srgb," + c + " 7%,var(--surface))" : "var(--surface)" } },
                E("div", { style: { fontWeight: 700, fontSize: 15, color: taskSel === k ? c : "var(--ink)", marginBottom: 4 } }, t),
                E("div", { className: "muted", style: { fontSize: 13, lineHeight: 1.45 } }, d)))),

          /* prompt preview */
          E("div", { style: { borderRadius: "var(--r)", border: "1px solid var(--line)", overflow: "hidden", marginBottom: 18 } },
            E("div", { className: "row between", style: { padding: "11px 16px", background: "var(--surface-3)", borderBottom: "1px solid var(--line)" } },
              E("span", { className: "eyebrow", style: { color: accent } }, "Quote set · " + (prompt ? prompt.theme : "")),
              E("button", { className: "btn btn-ghost btn-sm", onClick: shuffle }, E(GH.Icon, { name: "reset", size: 14 }), "Shuffle")),
            E("div", { className: "col", style: { gap: 0 } }, (prompt ? prompt.quotes : []).map((q, i) =>
              E("div", { key: i, style: { padding: "13px 18px", borderTop: i ? "1px solid var(--line)" : "none" } }, E(GH.Quote, { q, size: 15.5 }))))),

          E("div", { className: "row wrap", style: { gap: 10 } },
            E("button", { className: "btn btn-primary", onClick: () => begin(30) }, E(GH.Icon, { name: "clock", size: 15 }), "Start · 30 minutes"),
            E("button", { className: "btn", onClick: () => begin(15) }, "Quick · 15 min"),
            E("button", { className: "btn btn-ghost", onClick: () => begin(60) }, "Untimed-ish · 60 min")),
          E("div", { className: "faint", style: { fontSize: 12, marginTop: 12, lineHeight: 1.5 } }, "Tip: the editor has spell-check disabled to match the real exam interface. Aim for ~400–500 words.")),

        /* history */
        state.essays.length > 0 && E(EssayHistory, null)
      ));
  }

  /* ---------- WRITING ---------- */
  if (phase === "writing") {
    const low = secs <= 120;
    return E("div", { style: { height: "100%", display: "flex", flexDirection: "column" } },
      /* top bar */
      E("div", { className: "row between", style: { padding: "12px clamp(16px,3vw,30px)", borderBottom: "1px solid var(--line)", background: "var(--surface)", flexWrap: "wrap", gap: 10 } },
        E("div", { className: "row", style: { gap: 12 } },
          E(GH.SecChip, { s: "s2" }),
          E("span", { style: { fontWeight: 600, fontSize: 14 } }, "Task " + taskSel + " · " + prompt.theme)),
        E("div", { className: "row", style: { gap: 14 } },
          E("span", { className: "mono", style: { fontSize: 13, color: "var(--ink-3)" } }, wc + " words"),
          E("div", { className: "row", style: { gap: 8, padding: "6px 12px", borderRadius: 99, background: low ? "var(--acc-soft)" : "var(--surface-3)" } },
            E(GH.Icon, { name: "clock", size: 15, style: { color: low ? "var(--acc)" : "var(--ink-3)" } }),
            E("span", { className: "mono", style: { fontSize: 15, fontWeight: 700, color: low ? "var(--acc)" : "var(--ink)" } }, GH.fmtClock(secs))),
          E("button", { className: "btn btn-sm", onClick: () => setRunning((r) => !r) }, running ? "Pause" : "Resume"),
          E("button", { className: "btn btn-primary btn-sm", onClick: finish }, "Finish"))),
      /* prompt + editor */
      E("div", { className: "scroll", style: { flex: 1, padding: "0" } },
        E("div", { style: { maxWidth: 780, margin: "0 auto", padding: "22px clamp(16px,3vw,20px) 60px" } },
          E("details", { style: { marginBottom: 16 } },
            E("summary", { className: "row", style: { gap: 8, cursor: "pointer", listStyle: "none", color: "var(--ink-3)", fontSize: 13, fontFamily: "var(--mono)", letterSpacing: ".05em", textTransform: "uppercase" } },
              E(GH.Icon, { name: "book", size: 14 }), "Show quotes"),
            E("div", { className: "card", style: { padding: "4px 16px", marginTop: 8 } }, prompt.quotes.map((q, i) =>
              E("div", { key: i, style: { padding: "11px 0", borderTop: i ? "1px solid var(--line)" : "none" } }, E(GH.Quote, { q, size: 14.5 }))))),
          E("textarea", { ref: taRef, value: text, onChange: (e) => setText(e.target.value), spellCheck: false, autoCorrect: "off", autoCapitalize: "off",
            placeholder: "Begin writing your response…",
            style: { width: "100%", minHeight: "56vh", border: "none", outline: "none", resize: "none", background: "transparent",
              fontFamily: "var(--serif)", fontSize: 18, lineHeight: 1.75, color: "var(--ink)" } }))));
  }

  /* ---------- REVIEW ---------- */
  const total = RUBRIC.reduce((n, r) => n + r.items.length, 0);
  const got = Object.values(checks).filter(Boolean).length;
  return E("div", { className: "scroll", style: { height: "100%", padding: "34px clamp(18px,4vw,46px) 80px" } },
    E("div", { style: { maxWidth: 820, margin: "0 auto" } },
      E(GH.PageHead, { eyebrow: "Reflect & score · Task " + taskSel + " · " + prompt.theme, title: "How did that go?" }),
      E("div", { className: "row wrap", style: { gap: 14, marginBottom: 22 } },
        E("div", { className: "card", style: { padding: "16px 18px", flex: "1 0 130px" } }, E(GH.Stat, { value: wc, label: "Words written", color: accent })),
        E("div", { className: "card", style: { padding: "16px 18px", flex: "1 0 130px" } }, E(GH.Stat, { value: Math.round(got / total * 100) + "%", label: "Self-rubric", color: "var(--acc)" })),
        E("div", { className: "card", style: { padding: "16px 18px", flex: "1 0 130px" } }, E(GH.Stat, { value: "+" + GH.xp.essay, label: "XP on save", color: "var(--gold)" }))),

      /* Claude Opus marking */
      E(AiMarking, { task: taskSel, prompt, text, onMarked: setAiResult }),

      E("div", { className: "card", style: { padding: "20px 22px", marginBottom: 18 } },
        E("span", { className: "eyebrow", style: { display: "block", marginBottom: 14 } }, "Or mark yourself against the rater criteria"),
        RUBRIC.map((r, ri) => E("div", { key: ri, style: { marginBottom: ri ? 0 : 18 } },
          E("div", { className: "row", style: { gap: 8, marginBottom: 8 } }, E("span", { className: "dot", style: { background: r.color, width: 9, height: 9 } }), E("span", { style: { fontWeight: 600, fontSize: 14.5, color: r.color } }, r.c)),
          E("div", { className: "col", style: { gap: 2 } }, r.items.map((it, ii) => {
            const key = ri + "-" + ii, on = !!checks[key];
            return E("button", { key: key, onClick: () => setChecks((c) => ({ ...c, [key]: !c[key] })),
              style: { display: "flex", gap: 11, alignItems: "center", textAlign: "left", padding: "9px 4px", background: "none", border: "none", cursor: "pointer" } },
              E("span", { style: { flex: "none", width: 20, height: 20, borderRadius: 6, border: "1.8px solid " + (on ? r.color : "var(--line-2)"), background: on ? r.color : "transparent", display: "grid", placeItems: "center" } },
                on && E(GH.Icon, { name: "check", size: 12, style: { color: "#fff" } })),
              E("span", { style: { fontSize: 14, color: on ? "var(--ink)" : "var(--ink-2)" } }, it));
          })))) ),

      E("details", { className: "card", style: { padding: "14px 18px", marginBottom: 18 } },
        E("summary", { style: { cursor: "pointer", fontWeight: 600, fontSize: 14 } }, "Re-read what you wrote"),
        E("div", { className: "serif", style: { whiteSpace: "pre-wrap", fontSize: 16, lineHeight: 1.7, color: "var(--ink-2)", marginTop: 12 } }, text || "(empty)")),

      E("div", { className: "row wrap", style: { gap: 10 } },
        E("button", { className: "btn btn-primary", onClick: save }, E(GH.Icon, { name: "check", size: 15 }), "Save to my history"),
        E("button", { className: "btn", onClick: () => { setPhase("writing"); setRunning(false); } }, "Keep editing"),
        E("button", { className: "btn btn-ghost", onClick: discard }, "Discard"))
    ));
}

function EssayHistory() {
  const { state, api } = GH.useStore();
  return E("div", { className: "rise", style: { marginTop: 8 } },
    E("span", { className: "eyebrow", style: { display: "block", marginBottom: 12 } }, "Your essays"),
    E("div", { className: "col", style: { gap: 8 } }, state.essays.map((es) => E("div", { key: es.id, className: "card", style: { padding: "12px 16px", display: "flex", alignItems: "center", gap: 14 } },
      E("span", { className: "chip", style: { color: es.task === "A" ? "var(--s2)" : "var(--s1)" } }, "Task " + es.task),
      E("div", { className: "col", style: { flex: 1, minWidth: 0, gap: 2 } },
        E("span", { style: { fontWeight: 600, fontSize: 14 } }, es.theme),
        E("span", { className: "mono faint", style: { fontSize: 11.5 } }, GH.fmtShort(es.date) + " · " + es.words + " words" + (es.ai && es.ai.overall && es.ai.overall.estimate ? " · Opus " + es.ai.overall.estimate : ""))),
      E("div", { className: "col", style: { alignItems: "flex-end", lineHeight: 1 } },
        E("span", { className: "mono", style: { fontSize: 15, fontWeight: 700, color: "var(--acc)" } }, es.score + "%"),
        E("span", { className: "eyebrow", style: { fontSize: 9 } }, "rubric")),
      E("button", { className: "btn btn-ghost btn-sm", onClick: () => api.deleteEssay(es.id), title: "Delete" }, E(GH.Icon, { name: "x", size: 14 }))))));
}
