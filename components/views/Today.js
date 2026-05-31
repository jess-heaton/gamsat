"use client";
/* ============================================================
   GAMSAT Study Hub — Today / Dashboard
   ============================================================ */
import React from "react";
import GH from "../../lib/gh";
import "../ui";
import "../../lib/store";

const E = React.createElement;

export default function Today() {
  const { state, api, stats } = GH.useStore();
  const wIdx = GH.currentWeekIdx();
  const week = GH.plan[wIdx];
  const phase = GH.phases[week.phase];
  const dayIdx = (new Date()).getDate() % GH.motivation.length;

  const doneCount = week.tasks.filter((_, i) => state.tasks[`w${week.n}-${i}`]).length;
  const wordOfDay = GH.vocab[(new Date()).getDate() % GH.vocab.length];
  const essayOfDay = GH.essayPrompts[(new Date()).getDate() % GH.essayPrompts.length];
  const nextMile = GH.milestones.find((m) => GH.daysUntil(m.date) >= 0) || GH.milestones[0];

  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return E("div", { className: "scroll", style: { height: "100%", padding: "34px clamp(18px,4vw,46px) 80px" } },
    E("div", { style: { maxWidth: 1080, margin: "0 auto" } },

      /* header */
      E("div", { className: "row between wrap rise", style: { gap: 18, marginBottom: 26, alignItems: "flex-end" } },
        E("div", { className: "col", style: { gap: 7, flex: "1 1 auto", minWidth: 0 } },
          E("span", { className: "eyebrow" }, greet + " — " + new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })),
          E("h1", { className: "display", style: { fontSize: "clamp(27px,3.6vw,40px)", lineHeight: 1.1 } }, "Let's get you to ", E("span", { style: { color: "var(--acc)" } }, "medicine"), ".")),
        E("div", { className: "row", style: { gap: 18 } },
          E(GH.Flame, { count: stats.streak }),
          E("div", { style: { width: 1, height: 38, background: "var(--line)" } }),
          E("div", { className: "row", style: { gap: 12 } },
            E(GH.Ring, { pct: stats.levelPct, size: 46, stroke: 5 },
              E("span", { className: "mono", style: { fontSize: 11, fontWeight: 700 } }, "L" + (stats.levelIdx + 1))),
            E("div", { className: "col", style: { lineHeight: 1.15 } },
              E("span", { style: { fontWeight: 700, fontSize: 14 } }, stats.level),
              E("span", { className: "mono faint", style: { fontSize: 11 } }, stats.xp + " XP"))))),

      /* motivation banner */
      E("div", { className: "rise", style: { animationDelay: ".04s", display: "flex", gap: 12, alignItems: "center", padding: "13px 18px", borderRadius: "var(--r)", background: "var(--acc-soft)", border: "1px solid var(--acc-soft2)", marginBottom: 22 } },
        E(GH.Icon, { name: "spark", size: 18, style: { color: "var(--acc)", flex: "none" } }),
        E("span", { className: "serif", style: { fontSize: 17, fontStyle: "italic", color: "var(--acc-deep)" } }, GH.motivation[dayIdx])),

      /* countdowns */
      E("div", { className: "rise", style: { animationDelay: ".08s", marginBottom: 14 } },
        E("div", { className: "row between", style: { marginBottom: 10 } },
          E("span", { className: "eyebrow" }, "The road ahead"),
          E("span", { className: "chip", style: { color: "var(--s1)", borderColor: "color-mix(in srgb,var(--s1) 30%,transparent)" } },
            E(GH.Icon, { name: "target", size: 12 }), "Target Overall ≥ 64")),
        E("div", { className: "grid-2c", style: { gap: 14 } },
          E(GH.Countdown, { iso: GH.config.examS2, label: "Section II · Written Communication", color: "var(--s2)", soft: "var(--s2-soft)", big: true }),
          E(GH.Countdown, { iso: GH.config.examMain, label: "Sections I & III · Main Sitting", color: "var(--s3)", soft: "var(--s3-soft)", big: true }))),

      E("div", { className: "faint", style: { fontSize: 12.5, marginBottom: 26, lineHeight: 1.5 } },
        "Both the Sep '26 and the March '27 sittings feed your ", E("strong", { style: { color: "var(--ink-2)" } }, "2027 CAO cycle"),
        " — and Ireland counts your ", E("strong", { style: { color: "var(--ink-2)" } }, "best score"), ". This is two attempts at one goal, not pass-or-restart."),

      /* main grid */
      E("div", { className: "grid-main", style: { gap: 18 } },

        /* LEFT — today's focus */
        E("div", { className: "col rise", style: { gap: 14, animationDelay: ".12s" } },
          E("div", { className: "card", style: { padding: "4px 4px 8px" } },
            E("div", { className: "row between", style: { padding: "16px 18px 12px" } },
              E("div", { className: "col", style: { gap: 4 } },
                E("div", { className: "row", style: { gap: 9 } },
                  E("span", { className: "eyebrow" }, "This week's focus"),
                  E("span", { className: "chip", style: { color: phase.color, background: phase.soft, borderColor: "transparent" } }, phase.label)),
                E("span", { className: "display", style: { fontSize: 21 } }, "Week " + week.n + " · " + week.range)),
              E(GH.Ring, { pct: week.tasks.length ? Math.round(100 * doneCount / week.tasks.length) : 0, size: 48, color: phase.color },
                E("span", { className: "mono", style: { fontSize: 11, fontWeight: 700 } }, doneCount + "/" + week.tasks.length))),
            E("div", { className: "col", style: { gap: 0 } },
              week.tasks.map((t, i) => {
                const id = `w${week.n}-${i}`, done = !!state.tasks[id];
                return E("button", { key: id, onClick: () => api.toggleTask(id),
                  style: { display: "flex", gap: 12, alignItems: "flex-start", textAlign: "left", width: "100%",
                    padding: "12px 18px", background: "transparent", border: "none", borderTop: "1px solid var(--line)", cursor: "pointer" } },
                  E("span", { style: { flex: "none", marginTop: 1, width: 21, height: 21, borderRadius: 6,
                    border: "1.8px solid " + (done ? phase.color : "var(--line-2)"), background: done ? phase.color : "transparent",
                    display: "grid", placeItems: "center", transition: "all .15s" } },
                    done && E(GH.Icon, { name: "check", size: 13, style: { color: "#fff" } })),
                  E("span", { style: { fontSize: 14.5, lineHeight: 1.45, color: done ? "var(--ink-3)" : "var(--ink)", textDecoration: done ? "line-through" : "none" } }, t));
              }))),
          E("button", { className: "btn btn-ghost", onClick: () => api.setView("plan"), style: { alignSelf: "flex-start" } },
            E(GH.Icon, { name: "plan", size: 16 }), "See the full 15-week plan", E(GH.Icon, { name: "arrow", size: 15 }))),

        /* RIGHT — side stack */
        E("div", { className: "col rise", style: { gap: 14, animationDelay: ".16s" } },

          /* quick stats */
          E("div", { className: "card", style: { padding: "16px 18px" } },
            E("div", { className: "row", style: { justifyContent: "space-between" } },
              E(GH.Stat, { value: stats.essays, label: "Essays", color: "var(--s2)" }),
              E(GH.Stat, { value: stats.questionsAnswered, label: "Questions", color: "var(--s3)" }),
              E(GH.Stat, { value: (stats.accuracyOverall || 0) + "%", label: "Accuracy", color: "var(--s1)" }))),

          /* daily essay */
          E("div", { className: "card", style: { padding: "18px", background: "var(--s2-soft)", border: "1px solid color-mix(in srgb,var(--s2) 22%,transparent)" } },
            E("div", { className: "row between", style: { marginBottom: 8 } },
              E("span", { className: "eyebrow", style: { color: "var(--s2)" } }, "Daily essay · Task " + essayOfDay.task),
              E(GH.Icon, { name: "write", size: 17, style: { color: "var(--s2)" } })),
            E("div", { className: "serif", style: { fontSize: 16, lineHeight: 1.5, color: "var(--ink)", marginBottom: 8 } }, "Theme: " + essayOfDay.theme),
            E("div", { style: { marginBottom: 14 } }, E(GH.Quote, { q: essayOfDay.quotes[0], size: 14.5 })),
            E("button", { className: "btn btn-primary", style: { width: "100%", justifyContent: "center" }, onClick: () => api.setView("essay") },
              E(GH.Icon, { name: "clock", size: 15 }), "Write it · 30 min")),

          /* word of the day */
          E("div", { className: "card", style: { padding: "18px" } },
            E("span", { className: "eyebrow", style: { marginBottom: 8, display: "block" } }, "Word of the day"),
            E("div", { className: "row between", style: { alignItems: "baseline", marginBottom: 4 } },
              E("span", { className: "display", style: { fontSize: 24 } }, wordOfDay.w),
              E("span", { className: "mono faint", style: { fontSize: 12 } }, wordOfDay.pos)),
            E("div", { className: "muted", style: { fontSize: 14, lineHeight: 1.5, marginBottom: 8 } }, wordOfDay.def),
            E("div", { className: "serif", style: { fontSize: 13.5, fontStyle: "italic", color: "var(--ink-3)", lineHeight: 1.5 } }, wordOfDay.ex)),

          /* next milestone */
          E("button", { className: "card", onClick: () => api.setView("plan"), style: { padding: "15px 18px", textAlign: "left", cursor: "pointer", background: "var(--surface)" } },
            E("div", { className: "row between", style: { marginBottom: 6 } },
              E("span", { className: "eyebrow" }, "Next milestone"),
              E("span", { className: "mono", style: { fontSize: 12, fontWeight: 700, color: "var(--acc)" } }, "in " + GH.daysUntil(nextMile.date) + "d")),
            E("div", { style: { fontWeight: 600, fontSize: 15, marginBottom: 3 } }, nextMile.title),
            E("div", { className: "faint", style: { fontSize: 12.5, lineHeight: 1.45 } }, nextMile.note))
        ))
    ));
}
