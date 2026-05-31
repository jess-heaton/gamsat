"use client";
/* ============================================================
   GAMSAT Study Hub — store: state, persistence, derived stats
   Ported from the prototype store.jsx to a real React context.
   ============================================================ */
import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from "react";
import GH from "./gh";

const KEY = "gh_state_v2";

const defaultState = () => ({
  tasks: {},        // taskId -> true
  topics: {},       // topicId -> 'none'|'shaky'|'solid'
  essays: [],       // {id, task, theme, words, date, score, text, ai?}
  answered: {},     // qid -> {choice, correct}
  quizzes: [],      // {date, section, correct, total}
  vocab: {},        // word -> 'known'|'review'
  activity: {},     // 'YYYY-MM-DD' -> true
  milestones: {},   // milestone date -> done bool override
  view: "today",
  badges: {},       // id -> true
});

const load = () => {
  if (typeof window === "undefined") return defaultState();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return defaultState();
    return Object.assign(defaultState(), JSON.parse(raw));
  } catch (e) { return defaultState(); }
};

const Ctx = createContext(null);

export function StoreProvider({ children }) {
  // Always start from defaultState on the server AND first client render so
  // markup matches; then hydrate from localStorage in an effect.
  const [state, setState] = useState(defaultState);
  const [hydrated, setHydrated] = useState(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    setState(load());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try { window.localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }, [state, hydrated]);

  const update = useCallback((fn) => setState((prev) => fn(structuredCloneSafe(prev))), []);
  function structuredCloneSafe(o) { return JSON.parse(JSON.stringify(o)); }

  const stampToday = (st) => { st.activity[GH.todayISO()] = true; };

  const api = useMemo(() => ({
    setView: (v) => update((st) => { st.view = v; return st; }),
    toggleTask: (id) => update((st) => { st.tasks[id] = !st.tasks[id]; if (st.tasks[id]) stampToday(st); return st; }),
    setTopic: (id, lv) => update((st) => { st.topics[id] = lv; if (lv !== "none") stampToday(st); return st; }),
    addEssay: (e) => update((st) => { st.essays.unshift(e); stampToday(st); return st; }),
    updateEssay: (id, patch) => update((st) => { st.essays = st.essays.map((x) => (x.id === id ? { ...x, ...patch } : x)); return st; }),
    deleteEssay: (id) => update((st) => { st.essays = st.essays.filter((x) => x.id !== id); return st; }),
    answerQ: (qid, choice, correct) => update((st) => { st.answered[qid] = { choice, correct }; stampToday(st); return st; }),
    logQuiz: (rec) => update((st) => { st.quizzes.unshift(rec); return st; }),
    setVocab: (w, status) => update((st) => { st.vocab[w] = status; stampToday(st); return st; }),
    toggleMilestone: (date) => update((st) => { st.milestones[date] = !st.milestones[date]; return st; }),
    resetAll: () => { try { window.localStorage.removeItem(KEY); } catch (e) {} setState(defaultState()); },
    setState,
  }), [update]);

  const stats = useMemo(() => GH.computeStats(state), [state]);

  // award badges
  useEffect(() => {
    const newly = {};
    GH.badgeDefs.forEach((b) => { if (!state.badges[b.id] && b.test(stats, state)) newly[b.id] = true; });
    if (Object.keys(newly).length) update((st) => { Object.assign(st.badges, newly); return st; });
  }, [stats]); // eslint-disable-line

  return React.createElement(Ctx.Provider, { value: { state, api, stats, hydrated } }, children);
}

export const useStore = () => useContext(Ctx);

// Also expose on the GH singleton so ported view code can call GH.useStore()
GH.useStore = useStore;
GH.StoreProvider = StoreProvider;
