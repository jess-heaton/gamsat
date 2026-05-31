/* ============================================================
   GAMSAT Study Hub — shared data + logic singleton
   Ported from the Claude Design prototype (data-core, data-sections,
   data-bank, store helpers) into a single ES module.

   Exam config, key dates, milestones, periodised study plan,
   section strategy, science checklists, practice bank, vocab.
   Today anchor: Irish GEM · Sep '26 primary sitting.
   ============================================================ */

const GH = {};

/* ---------- date utils ---------- */
GH.MS_DAY = 86400000;
GH.iso = (d) => {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return z.toISOString().slice(0, 10);
};
GH.todayISO = () => GH.iso(new Date());
GH.parseISO = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
GH.daysUntil = (isoStr) => {
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const t = GH.parseISO(isoStr); t.setHours(0, 0, 0, 0);
  return Math.round((t - now) / GH.MS_DAY);
};
GH.fmtDate = (isoStr) => GH.parseISO(isoStr).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
GH.fmtShort = (isoStr) => GH.parseISO(isoStr).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
GH.fmtClock = (s) => { s = Math.max(0, s); const m = Math.floor(s / 60), ss = s % 60; return m + ":" + String(ss).padStart(2, "0"); };

/* render a quote set entry — strings or {text, author} objects */
GH.quoteText = (q) => (typeof q === "string" ? q : q.text);
GH.quoteAuthor = (q) => (typeof q === "string" ? "" : (q.author || ""));

/* ---------- exam config ---------- */
GH.config = {
  name: "you",
  pathway: "Irish Graduate Entry Medicine",
  schools: ["RCSI", "UCD", "UCC", "UL"],
  // primary sitting (Sep 2026)
  examS2:   "2026-08-22", // Written Communication (remote)
  examMain: "2026-09-11", // Section 1 + Section 3 (test centre)
  // backup sitting (March 2027) — same 2027-entry CAO cycle
  backupS2:   "2027-02-26",
  backupMain: "2027-03-19",
  results:  "2026-11-12",
  caoClose: "2027-02-01",
  weeklyHours: 15,
};

/* score model — Ireland uses ACER Overall: (S1 + S2 + 2·S3) / 4 */
GH.scoreModel = {
  formula: "(S1 + S2 + 2 × S3) ÷ 4",
  note: "Section 3 (science) is double-weighted — your chemistry gains count twice.",
  targets: [
    { label: "Eligible to compete", v: 50, tone: "ink-3" },
    { label: "Typical offer cut-off", v: 58, tone: "gold" },
    { label: "Your target", v: 64, tone: "acc" },
  ],
};

GH.milestones = [
  { date: "2026-06-30", title: "Register for Sep GAMSAT", note: "Standard registration closes (ACER). Fee €378.", tag: "admin", done: false },
  { date: "2026-08-22", title: "Section II — Written Communication", note: "Two typed essays, remote-proctored. 22–23 Aug.", tag: "exam" },
  { date: "2026-09-11", title: "Sections I & III — main sitting", note: "Humanities + Sciences at test centre. 11–13 Sep.", tag: "exam" },
  { date: "2026-11-12", title: "Results released", note: "Scaled scores 0–100 per section + Overall.", tag: "result" },
  { date: "2027-02-01", title: "CAO application closes", note: "For 2027 entry. Min 2H1 degree — you qualify.", tag: "admin" },
  { date: "2027-03-19", title: "Backup: March '27 sitting", note: "Same 2027 cycle. CAO uses your BEST score.", tag: "backup" },
];

/* ---- phases ---- */
GH.phases = {
  found:  { label: "Foundations",     color: "var(--s3)",   soft: "var(--s3-soft)" },
  build:  { label: "Build",           color: "var(--gold)", soft: "var(--gold-soft)" },
  peak:   { label: "Essay Peak",      color: "var(--s2)",   soft: "var(--s2-soft)" },
  taper2: { label: "Section II Week",  color: "var(--acc)",  soft: "var(--acc-soft)" },
  sprint: { label: "Science Sprint",  color: "var(--s1)",   soft: "var(--s1-soft)" },
};

/* ---- 15-week plan (Mon-anchored, Jun 1 → Sep 13) ---- */
GH.plan = [
  { n: 1, range: "Jun 1 – 7", phase: "found", hours: 12, focus: ["Diagnostics", "Routine"], tasks: [
    "Sit a full diagnostic: 1 timed S3 set + 1 timed S1 set",
    "Write 1 untimed Task A essay to find your baseline",
    "Chemistry: atomic structure, periodic trends, electron config",
    "Biology: cell structure & the cell membrane",
    "Set up daily habit — 20 min reading + 5 vocab cards",
  ]},
  { n: 2, range: "Jun 8 – 14", phase: "found", hours: 14, focus: ["Chem foundations", "Essays"], tasks: [
    "Chemistry: moles, stoichiometry & concentration (drill 15 Qs)",
    "Chemistry: bonding — ionic, covalent, intermolecular forces",
    "Write 1 Task A + 1 Task B (untimed, focus on structure)",
    "S1: practice 1 prose + 1 poetry stem set",
    "Biology: enzymes & basic metabolism",
  ]},
  { n: 3, range: "Jun 15 – 21", phase: "found", hours: 14, focus: ["Acids/bases", "Essays"], tasks: [
    "Chemistry: acids, bases, pH & buffers (your weak link — go slow)",
    "Chemistry: 20-question reasoning set, review every miss",
    "Write 2 essays — 1 timed (30 min) Task A",
    "S1: cartoons & visual stems — practice inference",
    "Biology: DNA, RNA & protein synthesis",
  ]},
  { n: 4, range: "Jun 22 – 28", phase: "found", hours: 14, focus: ["Equilibrium", "Review"], tasks: [
    "Chemistry: chemical equilibrium & Le Chatelier",
    "Physics: units, kinematics & graphs (you'll find this easy)",
    "Write 1 Task A + 1 Task B, both timed",
    "Build your essay evidence bank: 5 examples you can reuse",
    "Half-length S3 mock — log accuracy by topic",
  ]},
  { n: 5, range: "Jun 29 – Jul 5", phase: "build", hours: 16, focus: ["Organic chem", "Essays"], tasks: [
    "Chemistry: organic functional groups & nomenclature",
    "Chemistry: isomerism (structural & stereo)",
    "Write 2 timed essays — alternate Task A / Task B",
    "S1: full timed half-section (31 Qs / 50 min)",
    "Physics: forces, Newton's laws, momentum",
  ]},
  { n: 6, range: "Jul 6 – 12", phase: "build", hours: 16, focus: ["Reaction mechanisms", "Physics"], tasks: [
    "Chemistry: reaction mechanisms — SN1/SN2, addition",
    "Chemistry: redox & electrochemistry basics",
    "Physics: energy, work, power & circuits",
    "Write 2 timed essays — get feedback on one",
    "Biology: cardiovascular & respiratory systems",
  ]},
  { n: 7, range: "Jul 13 – 19", phase: "build", hours: 16, focus: ["Thermo/kinetics", "S1"], tasks: [
    "Chemistry: thermodynamics & reaction kinetics",
    "Chemistry: mixed 25-Q reasoning set under time",
    "S1: 2 timed half-sections — work on pace (1:36/Q)",
    "Write 1 Task A + 1 Task B timed; self-score vs rubric",
    "Biology: renal, nervous & endocrine systems",
  ]},
  { n: 8, range: "Jul 20 – 26", phase: "build", hours: 17, focus: ["Consolidate", "Mock"], tasks: [
    "Chemistry: spectroscopy basics + biomolecules",
    "Physics: waves, sound & optics",
    "Full S3 mock (75 Q / 150 min) — analyse weak topics",
    "Write 2 timed essays; refine your planning routine to 5 min",
    "Review all flagged chemistry questions from the month",
  ]},
  { n: 9, range: "Jul 27 – Aug 2", phase: "peak", hours: 17, focus: ["Essay ramp", "Gaps"], tasks: [
    "Essay focus: 3 timed essays this week, vary the style",
    "Lock 3 Task A frameworks + 3 Task B approaches you trust",
    "Chemistry: revisit your 2 weakest topics with fresh sets",
    "S1: 1 full timed section",
    "Expand evidence bank to 12 reusable examples",
  ]},
  { n: 10, range: "Aug 3 – 9", phase: "peak", hours: 17, focus: ["Essay peak", "Maintain"], tasks: [
    "Essay focus: 4 timed essays — simulate the 65-min double",
    "Practise the full Section II flow: Task A then Task B back-to-back",
    "Type with autocorrect OFF (matches exam interface)",
    "Chemistry: light maintenance set (15 Qs)",
    "S1: 2 timed half-sections",
  ]},
  { n: 11, range: "Aug 10 – 16", phase: "peak", hours: 15, focus: ["Polish essays", "Calm"], tasks: [
    "3 timed full Section II simulations (Task A + B, 65 min)",
    "Polish openings & conclusions — these carry the most weight",
    "Re-read your best 3 essays; note what worked",
    "Light science to stay warm — no new chemistry topics",
    "Plan exam-day logistics for the 22nd (tech check, ID)",
  ]},
  { n: 12, range: "Aug 17 – 23", phase: "taper2", hours: 10, focus: ["SIT SECTION II", "Taper"], tasks: [
    "Mon–Wed: 1 gentle timed essay each, then rest the mind",
    "Thu 21: tech & environment check for remote proctoring",
    "★ Aug 22–23: SIT SECTION II — Written Communication",
    "Prioritise sleep — you've done the work",
    "After: switch fully to Sections I & III",
  ]},
  { n: 13, range: "Aug 24 – 30", phase: "sprint", hours: 18, focus: ["Science sprint", "S1"], tasks: [
    "Full S3 mock + complete error analysis",
    "Chemistry: targeted drilling on remaining weak topics",
    "Physics: rapid formula recall + 2 timed sets",
    "S1: 2 full timed sections",
    "Biology: fast review of all systems via active recall",
  ]},
  { n: 14, range: "Aug 31 – Sep 6", phase: "sprint", hours: 18, focus: ["Full mocks", "Stamina"], tasks: [
    "Full combined mock day: S1 then S3 (build stamina)",
    "Review every error; re-drill the topics behind them",
    "Chemistry: final consolidation set (30 Qs)",
    "S1: timed practice, refine elimination strategy",
    "Second full combined mock — aim to beat last score",
  ]},
  { n: 15, range: "Sep 7 – 13", phase: "sprint", hours: 12, focus: ["Taper", "SIT MAIN"], tasks: [
    "Mon–Tue: light timed sets, review notes, no new content",
    "Wed: rest, logistics, early night — trust your prep",
    "★ Sep 11–13: SIT SECTIONS I & III",
    "Pack ID, admission ticket, water, snacks",
    "Afterwards: breathe. Results land mid-November.",
  ]},
];

/* xp / leveling */
GH.xp = { task: 12, essay: 55, quiz: 18, vocab: 2, topic: 15 };
GH.levels = ["Applicant", "Cadet", "Scholar", "Contender", "Front-runner", "Finalist"];

/* plan timing helpers */
GH.planStartISO = "2026-06-01";
GH.weekStartISO = (n) => GH.iso(new Date(GH.parseISO(GH.planStartISO).getTime() + (n - 1) * 7 * GH.MS_DAY));
GH.currentWeekIdx = () => {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  for (let i = GH.plan.length - 1; i >= 0; i--) {
    if (today >= GH.parseISO(GH.weekStartISO(i + 1))) return i;
  }
  return 0;
};

GH.motivation = [
  "Two shots at one goal. Today is just one honest hour at a time.",
  "Chemistry is double-weighted — every set you do today counts twice.",
  "You don't have to feel ready. You just have to show up and start.",
  "The plan already knows the way. Trust it; do today's part.",
  "Confidence is a side-effect of repetition. Stack one more rep.",
  "Your maths brain is an edge in Section III. Use it.",
  "Small and daily beats big and rare. Keep the streak alive.",
  "An essay written badly today is worth more than a perfect one imagined.",
];

/* ---------- SECTION I — Humanities & Social Sciences ---------- */
GH.s1 = {
  key: "s1", code: "Section I", accent: "var(--s1)", soft: "var(--s1-soft)",
  title: "Reasoning in Humanities & Social Sciences",
  facts: ["62 questions", "100 minutes", "≈ 1 min 36 s per question", "Stem-based MCQs"],
  blurb: "A comprehension test that isn't really about comprehension — it's about inference, tone, and argument. You read a stem (prose, poem, cartoon, table, dialogue) and answer 2–4 questions hung off it.",
  strategy: [
    { h: "Read the stem first, lightly", p: "Get the gist, tone, and the author's stance before touching the questions. Don't over-analyse — read only as deep as the questions demand." },
    { h: "Answer the question that's asked", p: "Most traps are true statements that don't answer the question. Match your answer to the exact verb: 'implies', 'suggests', 'best describes the tone'." },
    { h: "Eliminate ruthlessly", p: "Two options are usually obviously wrong. The real fight is between the last two — pick the one with the most textual support, not the most appealing idea." },
    { h: "Protect your pace", p: "At 1:36 a question, never sink 4 minutes into one. Flag it, guess, move on. No marks are deducted for wrong answers — leave nothing blank." },
  ],
  stems: [
    { t: "Prose / essay", tip: "Track the argument's turns — 'but', 'however', 'yet' signal where the author's real view sits." },
    { t: "Poetry", tip: "Tone & imagery over literal meaning. Ask what feeling the diction creates, not just what 'happens'." },
    { t: "Cartoons / visual", tip: "Identify the target of the satire and the contrast being drawn. Captions matter." },
    { t: "Tables & graphs", tip: "Read axes, units, and trends before the questions. Often pure data inference." },
    { t: "Dialogue / drama", tip: "Note who holds power, what's implied but unsaid, and shifts in attitude." },
  ],
  habit: "Read widely and a little daily: long-form journalism, essays, poetry. Familiarity with difficult, abstract prose is the single best Section I investment — and it doubles as essay material.",
};

/* ---------- SECTION 2 — Written Communication ---------- */
GH.s2 = {
  key: "s2", code: "Section II", accent: "var(--s2)", soft: "var(--s2-soft)",
  title: "Written Communication",
  facts: ["2 essays", "65 minutes total", "≈ 30 min each", "Typed · remote-proctored"],
  blurb: "Two essays from two quote sets. Task A leans socio-cultural → argumentative. Task B leans personal → reflective or creative. Marked by three raters on (1) thought & content and (2) organisation & expression. Sat earlier, on its own: 22–23 Aug.",
  marking: [
    { h: "Thought & content", p: "The quality and depth of your ideas — how well you explore the theme, the nuance and insight you bring, the evidence you marshal." },
    { h: "Organisation & expression", p: "Structure, flow, and control of language. A clear thesis, logical paragraphs, and a resonant close. Spelling/punctuation don't affect your score — clarity does." },
  ],
  plan: {
    h: "The 5-minute plan",
    steps: [
      "Read all quotes — find the single theme threading them (≈1 min)",
      "Take a position or angle on that theme — your thesis (≈1 min)",
      "Brainstorm 2–3 concrete examples / evidence (≈2 min)",
      "Order them into a skeleton: intro → 3 beats → close (≈1 min)",
      "Write ~24 min, leave ~2 to tidy. Repeat for the second task.",
    ],
  },
  taskA: {
    label: "Task A — Argumentative",
    note: "Socio-cultural themes (power, progress, justice, freedom). Build a structured argument with a clear stance.",
    structure: [
      "Hook + name the theme + state your thesis",
      "Body 1: strongest argument → concrete example → link to thesis",
      "Body 2: develop / complicate it with a second example",
      "Body 3: acknowledge the counter-view, then answer it",
      "Conclusion: widen out — why it matters",
    ],
  },
  taskB: {
    label: "Task B — Reflective / Creative",
    note: "Personal & emotional themes (memory, belonging, fear, change). Reflective essay, vignette, story, letter — your choice. Show empathy and texture.",
    structure: [
      "Open in a concrete moment or image — not an abstraction",
      "Broaden the moment toward the universal theme",
      "Add tension or nuance — resist the tidy answer",
      "Let an idea evolve across the piece",
      "Close on a resonant image that echoes the open",
    ],
  },
  warnings: [
    "Memorised essays score poorly and raters spot them — build flexible material, not canned scripts.",
    "You don't have to quote the prompts or agree with them; they exist to spark a theme.",
    "Type with autocorrect OFF when practising — the exam has no spell-check.",
    "Depth over breadth: a few ideas explored well beats many ideas listed.",
  ],
  /* theme bank — flexible material, not pre-written essays */
  themes: [
    { t: "Progress", task: "A", angles: ["Is progress always advancement?", "Who pays for it?"], evidence: ["Industrial Revolution", "antibiotics & resistance", "AI displacement"] },
    { t: "Freedom vs security", task: "A", angles: ["The trade-off is permanent", "Liberty as the safer bet"], evidence: ["surveillance states", "pandemic lockdowns", "Franklin's warning"] },
    { t: "Power & corruption", task: "A", angles: ["Power reveals more than it corrupts", "Accountability as the antidote"], evidence: ["Stanford prison study", "whistleblowers", "separation of powers"] },
    { t: "Knowledge & truth", task: "A", angles: ["Truth as provisional", "The cost of certainty"], evidence: ["scientific method", "Galileo", "misinformation"] },
    { t: "Justice", task: "A", angles: ["Fairness vs equality", "Mercy within justice"], evidence: ["restorative justice", "Les Misérables", "healthcare rationing"] },
    { t: "Tradition vs change", task: "A", angles: ["Tradition as tested wisdom", "Change as survival"], evidence: ["medicine's evolution", "language drift", "cultural ritual"] },
    { t: "Memory", task: "B", angles: ["Memory as identity", "What we choose to forget"], evidence: ["a grandparent's story", "nostalgia's distortions", "trauma"] },
    { t: "Belonging", task: "B", angles: ["Outsider looking in", "Home as people not place"], evidence: ["migration", "first day somewhere new", "found family"] },
    { t: "Fear", task: "B", angles: ["Fear as compass", "Courage is fear acted through"], evidence: ["a first attempt", "medical uncertainty", "stage fright"] },
    { t: "Failure", task: "B", angles: ["Failure as teacher", "The redemptive restart"], evidence: ["your own setback", "Edison's iterations", "second chances"] },
    { t: "Time", task: "B", angles: ["Scarcity gives meaning", "Slowness as resistance"], evidence: ["a deadline", "deathbed regrets", "the slow-living turn"] },
    { t: "Empathy", task: "B", angles: ["Imagining another's interior", "Its limits & its labour"], evidence: ["a patient's fear", "literature as rehearsal", "compassion fatigue"] },
  ],
};

/* ---------- SECTION 3 — Biological & Physical Sciences ---------- */
GH.s3 = {
  key: "s3", code: "Section III", accent: "var(--s3)", soft: "var(--s3-soft)",
  title: "Reasoning in Biological & Physical Sciences",
  facts: ["75 questions", "150 minutes", "≈ 40% chem · 40% bio · 20% physics", "First-year uni / Yr 12 physics"],
  blurb: "The double-weighted section — and your biggest lever. Less recall than you'd fear: most questions hand you the information in the stem and test whether you can reason with it. Build concepts, not flashcard facts. Your data-science maths is a real edge here.",
  strategy: [
    { h: "The answer is often in the stem", p: "GAMSAT gives you novel info and asks you to apply it. Read the stem as the textbook for that question — don't reach for memorised detail you don't need." },
    { h: "Master the maths shortcuts", p: "Unit cancellation, rearranging equations, log/exponent intuition, ratios. Your background makes this a strength — lean on it to bank fast marks." },
    { h: "Graphs are gifts", p: "Titration curves, rate plots, enzyme kinetics — learn to read shape, gradient, and turning points fast." },
    { h: "Triage by confidence", p: "Two passes: bank every question you can do quickly first, then return to the heavy reasoning ones. Never leave blanks." },
  ],
};

/* ---- topic checklists (confidence-tracked) ----
   chem weighted first & heaviest — the user's weak point + double weight */
GH.topics = {
  chem: { label: "Chemistry", accent: "var(--s3)", weight: "~40% · double-weighted", groups: [
    { g: "Physical & general", items: [
      { id: "chem-atomic", t: "Atomic structure & periodicity", note: "Shells, orbitals, electron config; trends in radius, ionisation energy, electronegativity across/down the table." },
      { id: "chem-bonding", t: "Bonding & intermolecular forces", note: "Ionic vs covalent vs metallic; polarity; H-bonding, dipole, dispersion — these drive boiling points & solubility." },
      { id: "chem-moles", t: "Moles, stoichiometry & concentration", note: "n = m/M, c = n/V; limiting reagents; % yield. Practise until dimensional analysis is automatic." },
      { id: "chem-gases", t: "Gas laws", note: "PV = nRT; partial pressures. Watch units (kPa, K)." },
      { id: "chem-acids", t: "Acids, bases, pH & buffers", note: "pH = −log[H⁺]; strong vs weak; Ka/pKa; Henderson–Hasselbalch; buffers resist change near pKa. (Priority topic.)" },
      { id: "chem-equil", t: "Equilibrium & Le Chatelier", note: "Kc/Kp; how T, P, concentration shift position. Reason qualitatively first, then quantitatively." },
      { id: "chem-thermo", t: "Thermodynamics & energetics", note: "ΔH, ΔS, ΔG = ΔH − TΔS; spontaneity; exo/endothermic; Hess's law." },
      { id: "chem-kinetics", t: "Reaction kinetics", note: "Rate laws, order, rate-determining step; effect of T (Arrhenius) & catalysts. Read rate-vs-time graphs." },
      { id: "chem-redox", t: "Redox & electrochemistry", note: "Oxidation states, half-equations, balancing; cells, E°, anode/cathode. OIL RIG." },
    ]},
    { g: "Organic", items: [
      { id: "chem-fg", t: "Functional groups & nomenclature", note: "Recognise alcohols, aldehydes/ketones, acids, esters, amines, amides; IUPAC naming." },
      { id: "chem-isomer", t: "Isomerism", note: "Structural vs stereo (cis/trans, enantiomers, chirality). Chirality matters for biomolecules." },
      { id: "chem-mech", t: "Reaction mechanisms", note: "SN1/SN2, E1/E2, electrophilic addition, condensation/hydrolysis. Curly-arrow logic." },
      { id: "chem-spec", t: "Spectroscopy basics", note: "Interpret IR (functional groups) & basic NMR/MS clues from a stem." },
      { id: "chem-biomol", t: "Biomolecules", note: "Amino acids/proteins, carbohydrates, lipids, nucleic acids — structure → function." },
    ]},
  ]},
  bio: { label: "Biology", accent: "var(--s1)", weight: "~40%", groups: [
    { g: "Molecular & cellular", items: [
      { id: "bio-cell", t: "Cell structure & membranes", note: "Organelles; membrane transport — diffusion, osmosis, active transport." },
      { id: "bio-enzyme", t: "Enzymes & metabolism", note: "Active site, inhibition (competitive/non-comp), Michaelis–Menten intuition; respiration & ATP." },
      { id: "bio-dna", t: "DNA, RNA & protein synthesis", note: "Replication, transcription, translation; the central dogma." },
      { id: "bio-genetics", t: "Genetics & inheritance", note: "Punnett squares, dominance, linkage, mutations; basic population genetics." },
    ]},
    { g: "Physiology & systems", items: [
      { id: "bio-cardio", t: "Cardiovascular & respiratory", note: "Heart cycle, gas exchange, oxygen dissociation curve." },
      { id: "bio-renal", t: "Renal & homeostasis", note: "Nephron function, osmoregulation, negative feedback." },
      { id: "bio-nervous", t: "Nervous & endocrine", note: "Action potentials, synapses, hormone signalling & feedback loops." },
      { id: "bio-immuno", t: "Immunology & microbiology", note: "Innate vs adaptive immunity; basic pathogen biology." },
      { id: "bio-evo", t: "Evolution & ecology", note: "Selection, fitness, energy flow — usually light, reasoning-based." },
    ]},
  ]},
  phys: { label: "Physics", accent: "var(--gold)", weight: "~20% · your edge", groups: [
    { g: "Core", items: [
      { id: "phys-units", t: "Units & dimensional analysis", note: "SI units, prefixes, unit cancellation — fast free marks." },
      { id: "phys-kin", t: "Kinematics & graphs", note: "v–t and x–t graphs, gradients = velocity/acceleration; SUVAT." },
      { id: "phys-force", t: "Forces & Newton's laws", note: "F = ma, friction, equilibrium, free-body diagrams." },
      { id: "phys-energy", t: "Work, energy, power & momentum", note: "KE, PE, conservation; p = mv, impulse, collisions." },
    ]},
    { g: "Fields & waves", items: [
      { id: "phys-circ", t: "Electricity & circuits", note: "V = IR, power, series/parallel resistance, charge." },
      { id: "phys-wave", t: "Waves, sound & optics", note: "v = fλ, reflection/refraction, lenses, basic interference." },
      { id: "phys-thermo", t: "Thermodynamics & heat", note: "Q = mcΔT, latent heat, gas behaviour." },
      { id: "phys-modern", t: "Radioactivity & modern", note: "Half-life, decay types, E = hf intuition." },
    ]},
  ]},
};

GH.confLevels = [
  { v: "none",  label: "Not started", dot: "var(--line-2)", pct: 0 },
  { v: "shaky", label: "Shaky",       dot: "var(--gold)",   pct: 50 },
  { v: "solid", label: "Solid",       dot: "var(--good)",   pct: 100 },
];

/* ============================================================
   Practice bank — reasoning-style questions (original content,
   not reproduced ACER material).
   ============================================================ */
GH.questions = [
  /* ---------------- CHEMISTRY ---------------- */
  { id: "q-c1", section: "chem", topic: "Concentration", stem: "A technician takes 25 mL of 0.80 mol L⁻¹ hydrochloric acid and dilutes it with water to a final volume of 100 mL. What is the concentration of the diluted solution?",
    options: ["0.05 mol L⁻¹", "0.20 mol L⁻¹", "0.32 mol L⁻¹", "3.2 mol L⁻¹"], answer: 1,
    solution: "Use c₁V₁ = c₂V₂. (0.80)(25) = c₂(100) → c₂ = 20/100 = 0.20 mol L⁻¹. Dilution quartered the volume ratio (×4), so concentration falls to a quarter." },
  { id: "q-c2", section: "chem", topic: "Acids & pH", stem: "What is the pH of a 0.010 mol L⁻¹ solution of HCl, a strong monoprotic acid, at 25 °C?",
    options: ["1", "2", "10", "12"], answer: 1,
    solution: "HCl fully dissociates, so [H⁺] = 0.010 = 10⁻² mol L⁻¹. pH = −log[H⁺] = −log(10⁻²) = 2." },
  { id: "q-c3", section: "chem", topic: "Equilibrium", stem: "The reaction N₂(g) + 3H₂(g) ⇌ 2NH₃(g) is exothermic. A chemist raises the temperature of the system at equilibrium. What happens to the yield of ammonia?",
    options: ["Increases", "Decreases", "Unchanged", "First rises, then falls"], answer: 1,
    solution: "By Le Chatelier, raising temperature favours the endothermic (reverse) direction to absorb the added heat. The equilibrium shifts left, so NH₃ yield decreases and K falls." },
  { id: "q-c4", section: "chem", topic: "Oxidation states", stem: "What is the oxidation state of sulfur in the sulfate ion, SO₄²⁻?",
    options: ["+2", "+4", "+6", "−2"], answer: 2,
    solution: "Each O is −2, giving 4 × (−2) = −8. The overall ion charge is −2, so S + (−8) = −2 → S = +6." },
  { id: "q-c5", section: "chem", topic: "Reaction kinetics", stem: "For a reaction A → products, doubling [A] causes the initial rate to increase by a factor of four. What is the order of the reaction with respect to A?",
    options: ["Zero order", "First order", "Second order", "Third order"], answer: 2,
    solution: "Rate ∝ [A]ⁿ. Doubling [A] multiplies rate by 2ⁿ. Here 2ⁿ = 4, so n = 2 — second order." },
  { id: "q-c6", section: "chem", topic: "Buffers", stem: "A buffer is made with a weak acid (pKa = 4.7) and its conjugate base at equal concentrations. What is the approximate pH?",
    options: ["2.4", "4.7", "7.0", "9.3"], answer: 1,
    solution: "Henderson–Hasselbalch: pH = pKa + log([A⁻]/[HA]). With [A⁻] = [HA], the ratio is 1 and log(1) = 0, so pH = pKa = 4.7." },
  { id: "q-c7", section: "chem", topic: "Isomerism", stem: "How many structural (constitutional) isomers have the molecular formula C₄H₁₀?",
    options: ["1", "2", "3", "4"], answer: 1,
    solution: "C₄H₁₀ gives n-butane (straight chain) and 2-methylpropane / isobutane (branched). That is 2 structural isomers." },
  { id: "q-c8", section: "chem", topic: "Stoichiometry", stem: "How many moles of carbon dioxide are produced when 2 mol of propane (C₃H₈) undergoes complete combustion? (C₃H₈ + 5O₂ → 3CO₂ + 4H₂O)",
    options: ["3 mol", "4 mol", "5 mol", "6 mol"], answer: 3,
    solution: "Each mole of propane yields 3 mol CO₂. 2 mol × 3 = 6 mol CO₂." },
  { id: "q-c9", section: "chem", topic: "Thermodynamics", stem: "A reaction has ΔH = +40 kJ mol⁻¹ and ΔS = +120 J K⁻¹ mol⁻¹. Using ΔG = ΔH − TΔS, at roughly what temperature does it become spontaneous (ΔG < 0)?",
    options: ["Above ~333 K", "Below ~333 K", "Never spontaneous", "Always spontaneous"], answer: 0,
    solution: "Set ΔG = 0: T = ΔH/ΔS = 40 000 J ÷ 120 J K⁻¹ = 333 K. Since both ΔH and ΔS are positive, ΔG < 0 only when T exceeds 333 K." },
  { id: "q-c10", section: "chem", topic: "Intermolecular forces", stem: "Ethanol (CH₃CH₂OH) boils at 78 °C while ethane (CH₃CH₃), of similar molar mass, boils at −89 °C. The best explanation is that ethanol can form:",
    options: ["Ionic bonds", "Hydrogen bonds", "Metallic bonds", "Stronger covalent bonds"], answer: 1,
    solution: "The –OH group lets ethanol molecules hydrogen-bond to each other — a strong intermolecular force needing far more energy to overcome. Ethane has only weak dispersion forces, hence its much lower boiling point." },

  /* ---------------- BIOLOGY ---------------- */
  { id: "q-b1", section: "bio", topic: "Enzymes", stem: "A competitive inhibitor is added to an enzyme-catalysed reaction. Compared with the uninhibited reaction, what happens to the apparent Vmax and Km?",
    options: ["Vmax unchanged, Km increases", "Vmax decreases, Km unchanged", "Both decrease", "Both increase"], answer: 0,
    solution: "A competitive inhibitor competes for the active site but can be out-competed by excess substrate, so Vmax is unchanged. More substrate is needed to reach half-Vmax, so the apparent Km increases." },
  { id: "q-b2", section: "bio", topic: "Osmosis", stem: "An animal cell is placed in a hypertonic solution (higher solute concentration than the cytoplasm). What is the most likely outcome?",
    options: ["The cell swells and may burst", "Water leaves and the cell shrinks", "No net water movement", "Solutes flood into the cell"], answer: 1,
    solution: "Water moves by osmosis from high water potential (inside) to low (the hypertonic exterior). Net water loss makes the cell shrink (crenate)." },
  { id: "q-b3", section: "bio", topic: "Genetics", stem: "Two organisms heterozygous for a single gene (Aa × Aa) are crossed. What fraction of offspring are expected to show the recessive phenotype?",
    options: ["1/2", "1/4", "3/4", "1/16"], answer: 1,
    solution: "Aa × Aa gives genotypes 1 AA : 2 Aa : 1 aa. Only aa (1 in 4) shows the recessive phenotype → 1/4." },
  { id: "q-b4", section: "bio", topic: "Physiology", stem: "During exercise, muscle tissue becomes warmer and more acidic with rising CO₂. According to the Bohr effect, the oxygen–haemoglobin dissociation curve shifts so that haemoglobin:",
    options: ["Binds O₂ more tightly", "Releases more O₂ to tissues", "Stops carrying CO₂", "Denatures"], answer: 1,
    solution: "Lower pH, higher CO₂ and higher temperature shift the curve right, lowering haemoglobin's O₂ affinity — so it unloads more oxygen exactly where active tissue needs it." },
  { id: "q-b5", section: "bio", topic: "Molecular biology", stem: "In the central dogma, the process that synthesises a complementary mRNA strand from a DNA template is called:",
    options: ["Replication", "Transcription", "Translation", "Reverse transcription"], answer: 1,
    solution: "Transcription copies a DNA template into mRNA (in the nucleus). Translation then reads mRNA to build protein at the ribosome." },

  /* ---------------- PHYSICS ---------------- */
  { id: "q-p1", section: "phys", topic: "Kinematics", stem: "An object is dropped from rest and falls freely for 2.0 s. Taking g = 10 m s⁻², what is its speed just before impact? (ignore air resistance)",
    options: ["5 m s⁻¹", "10 m s⁻¹", "20 m s⁻¹", "40 m s⁻¹"], answer: 2,
    solution: "v = u + gt, with u = 0: v = 10 × 2.0 = 20 m s⁻¹." },
  { id: "q-p2", section: "phys", topic: "Circuits", stem: "A 12 V battery is connected across a single 4 Ω resistor. What current flows?",
    options: ["0.33 A", "3 A", "8 A", "48 A"], answer: 1,
    solution: "Ohm's law: I = V/R = 12/4 = 3 A." },
  { id: "q-p3", section: "phys", topic: "Energy", stem: "What is the kinetic energy of a 2.0 kg mass moving at 3.0 m s⁻¹?",
    options: ["3 J", "6 J", "9 J", "18 J"], answer: 2,
    solution: "KE = ½mv² = ½ × 2.0 × (3.0)² = ½ × 2.0 × 9 = 9 J." },
  { id: "q-p4", section: "phys", topic: "Waves", stem: "A sound wave has frequency 500 Hz and wavelength 0.68 m. What is its speed?",
    options: ["340 m s⁻¹", "500 m s⁻¹", "735 m s⁻¹", "0.0014 m s⁻¹"], answer: 0,
    solution: "v = fλ = 500 × 0.68 = 340 m s⁻¹ — about the speed of sound in air." },
  { id: "q-p5", section: "phys", topic: "Radioactivity", stem: "A radioactive sample has a half-life of 5 days and an initial mass of 80 g. How much remains after 15 days?",
    options: ["5 g", "10 g", "20 g", "27 g"], answer: 1,
    solution: "15 days = 3 half-lives. 80 → 40 → 20 → 10 g. After 3 halvings, 10 g remains." },

  /* ---------------- SECTION 1 ---------------- */
  { id: "q-s1a", section: "s1", topic: "Inference",
    passage: "“We call it progress when a forest becomes a field, a field becomes a town, a town becomes a city. We rarely pause to ask whether the line we are drawing is an arrow or merely a longer and longer fuse.”",
    stem: "The author's use of the word “fuse” most strongly implies that progress:",
    options: ["Is always beneficial", "May be building toward a destructive end", "Cannot be measured", "Is too slow to notice"], answer: 1,
    solution: "An 'arrow' suggests purposeful forward direction; a 'fuse' suggests something burning toward an explosion. The contrast implies progress may be leading, unnoticed, toward disaster — a critical, cautionary reading." },
  { id: "q-s1b", section: "s1", topic: "Tone",
    passage: "“Ah yes, the experts assure us the system is perfectly fair. They have studied it thoroughly—from the comfortable distance of those it has never failed.”",
    stem: "The tone of this passage is best described as:",
    options: ["Sincere and reassuring", "Ironic and critical", "Neutral and factual", "Nostalgic and warm"], answer: 1,
    solution: "The phrase 'comfortable distance of those it has never failed' undercuts the experts' assurance, exposing their bias. The 'Ah yes' signals sarcasm. The tone is ironic and critical, not sincere." },
  { id: "q-s1c", section: "s1", topic: "Main idea",
    passage: "“The map is not the territory. A model that explains everything explains nothing, for it can no longer be surprised—and what cannot be surprised cannot learn.”",
    stem: "Which statement best captures the passage's central claim?",
    options: ["Maps should be more detailed", "A model that cannot be challenged loses its value", "Learning is impossible", "Territories change too fast to map"], answer: 1,
    solution: "The passage links surprise to learning: a model immune to being wrong ('surprised') can't improve. The central idea is that an unfalsifiable, all-explaining model has no real explanatory power." },
];

/* ============================================================
   ESSAY QUOTE SETS — real, attributed quotations grouped by theme,
   in the authentic GAMSAT Section II format (a comment/theme with
   four genuine quotations to spark a response). You don't have to
   agree with, or even refer to, any single quote.
   ============================================================ */
GH.essayPrompts = [
  /* ---- TASK A — argumentative / socio-cultural ---- */
  { id: "e-a1", task: "A", theme: "Progress", quotes: [
    { text: "Progress is impossible without change, and those who cannot change their minds cannot change anything.", author: "George Bernard Shaw" },
    { text: "All progress is precarious, and the solution of one problem brings us face to face with another problem.", author: "Martin Luther King Jr." },
    { text: "Civilization advances by extending the number of important operations which we can perform without thinking about them.", author: "Alfred North Whitehead" },
    { text: "Restlessness is discontent — and discontent is the first necessity of progress.", author: "Thomas Edison" },
  ]},
  { id: "e-a2", task: "A", theme: "Freedom & security", quotes: [
    { text: "Those who would give up essential liberty, to purchase a little temporary safety, deserve neither liberty nor safety.", author: "Benjamin Franklin" },
    { text: "The only freedom which deserves the name is that of pursuing our own good in our own way.", author: "John Stuart Mill" },
    { text: "Freedom is not worth having if it does not include the freedom to make mistakes.", author: "Mahatma Gandhi" },
    { text: "Liberty, when it begins to take root, is a plant of rapid growth.", author: "George Washington" },
  ]},
  { id: "e-a3", task: "A", theme: "Power", quotes: [
    { text: "Power tends to corrupt, and absolute power corrupts absolutely.", author: "Lord Acton" },
    { text: "It is not power that corrupts but fear.", author: "Aung San Suu Kyi" },
    { text: "Power concedes nothing without a demand. It never did and it never will.", author: "Frederick Douglass" },
    { text: "Nearly all men can stand adversity, but if you want to test a man's character, give him power.", author: "Abraham Lincoln" },
  ]},
  { id: "e-a4", task: "A", theme: "Knowledge & truth", quotes: [
    { text: "The only true wisdom is in knowing you know nothing.", author: "Socrates" },
    { text: "Truth is ever to be found in simplicity, and not in the multiplicity and confusion of things.", author: "Isaac Newton" },
    { text: "It is the mark of an educated mind to be able to entertain a thought without accepting it.", author: "Aristotle" },
    { text: "Three things cannot be long hidden: the sun, the moon, and the truth.", author: "Buddha" },
  ]},
  { id: "e-a5", task: "A", theme: "Justice", quotes: [
    { text: "Injustice anywhere is a threat to justice everywhere.", author: "Martin Luther King Jr." },
    { text: "Justice delayed is justice denied.", author: "William E. Gladstone" },
    { text: "Justice is truth in action.", author: "Benjamin Disraeli" },
    { text: "If you want peace, work for justice.", author: "Pope Paul VI" },
  ]},
  { id: "e-a6", task: "A", theme: "Tradition & change", quotes: [
    { text: "Tradition is not the worship of ashes, but the preservation of fire.", author: "Gustav Mahler" },
    { text: "Change is the law of life. And those who look only to the past or present are certain to miss the future.", author: "John F. Kennedy" },
    { text: "Tradition is a guide and not a jailer.", author: "W. Somerset Maugham" },
    { text: "The world hates change, yet it is the only thing that has brought progress.", author: "Charles Kettering" },
  ]},

  /* ---- TASK B — reflective / personal ---- */
  { id: "e-b1", task: "B", theme: "Memory", quotes: [
    { text: "Memory is the diary that we all carry about with us.", author: "Oscar Wilde" },
    { text: "We do not remember days, we remember moments.", author: "Cesare Pavese" },
    { text: "Nothing is ever really lost to us as long as we remember it.", author: "L. M. Montgomery" },
    { text: "What we remember from childhood we remember forever.", author: "Cynthia Ozick" },
  ]},
  { id: "e-b2", task: "B", theme: "Belonging", quotes: [
    { text: "Where we love is home — home that our feet may leave, but not our hearts.", author: "Oliver Wendell Holmes" },
    { text: "You are only free when you realize you belong no place — you belong every place — no place at all.", author: "Maya Angelou" },
    { text: "We are all just walking each other home.", author: "Ram Dass" },
    { text: "Belonging is the innate human desire to be part of something larger than us.", author: "Brené Brown" },
  ]},
  { id: "e-b3", task: "B", theme: "Fear", quotes: [
    { text: "The only thing we have to fear is fear itself.", author: "Franklin D. Roosevelt" },
    { text: "Courage is resistance to fear, mastery of fear — not absence of fear.", author: "Mark Twain" },
    { text: "You gain strength, courage and confidence by every experience in which you really stop to look fear in the face.", author: "Eleanor Roosevelt" },
    { text: "Nothing in life is to be feared, it is only to be understood.", author: "Marie Curie" },
  ]},
  { id: "e-b4", task: "B", theme: "Failure", quotes: [
    { text: "I have not failed. I've just found 10,000 ways that won't work.", author: "Thomas Edison" },
    { text: "Ever tried. Ever failed. No matter. Try again. Fail again. Fail better.", author: "Samuel Beckett" },
    { text: "Failure is simply the opportunity to begin again, this time more intelligently.", author: "Henry Ford" },
    { text: "Only those who dare to fail greatly can ever achieve greatly.", author: "Robert F. Kennedy" },
  ]},
  { id: "e-b5", task: "B", theme: "Time", quotes: [
    { text: "How we spend our days is, of course, how we spend our lives.", author: "Annie Dillard" },
    { text: "Lost time is never found again.", author: "Benjamin Franklin" },
    { text: "Time is the wisest counsellor of all.", author: "Pericles" },
    { text: "Time is the most valuable thing a man can spend.", author: "Theophrastus" },
  ]},
  { id: "e-b6", task: "B", theme: "Empathy", quotes: [
    { text: "I do not ask the wounded person how he feels, I myself become the wounded person.", author: "Walt Whitman" },
    { text: "Empathy is about finding echoes of another person in yourself.", author: "Mohsin Hamid" },
    { text: "Could a greater miracle take place than for us to look through each other's eyes for an instant?", author: "Henry David Thoreau" },
    { text: "When you start to develop your powers of empathy and imagination, the whole world opens up to you.", author: "Susan Sarandon" },
  ]},
];

/* ---------------- VOCAB DECK ---------------- */
GH.vocab = [
  { w: "Ameliorate", pos: "v.", def: "To make a bad situation better; to improve.", ex: "Reforms intended to ameliorate poverty often miss its deepest causes." },
  { w: "Ephemeral", pos: "adj.", def: "Lasting a very short time; fleeting.", ex: "Fame in the digital age is increasingly ephemeral." },
  { w: "Ubiquitous", pos: "adj.", def: "Present or found everywhere.", ex: "Smartphones have become ubiquitous in modern life." },
  { w: "Dichotomy", pos: "n.", def: "A division between two sharply opposed things.", ex: "The essay rejects the dichotomy between reason and emotion." },
  { w: "Pragmatic", pos: "adj.", def: "Dealing with things sensibly and realistically.", ex: "She took a pragmatic view of an imperfect compromise." },
  { w: "Esoteric", pos: "adj.", def: "Understood by only a small, specialised group.", ex: "The lecture drifted into esoteric detail few could follow." },
  { w: "Paradigm", pos: "n.", def: "A typical pattern or model; a framework of thought.", ex: "The discovery forced a shift in the scientific paradigm." },
  { w: "Juxtapose", pos: "v.", def: "To place close together for contrasting effect.", ex: "The poem juxtaposes wealth and want in a single image." },
  { w: "Empirical", pos: "adj.", def: "Based on observation or experience, not theory.", ex: "The claim lacked empirical support." },
  { w: "Dogmatic", pos: "adj.", def: "Asserting opinions as if they were unquestionable.", ex: "His dogmatic tone left no room for debate." },
  { w: "Salient", pos: "adj.", def: "Most noticeable or important.", ex: "She drew out the most salient point of the argument." },
  { w: "Tacit", pos: "adj.", def: "Understood without being stated.", ex: "There was a tacit agreement to avoid the subject." },
  { w: "Cogent", pos: "adj.", def: "Clear, logical and convincing.", ex: "He made a cogent case for reform." },
  { w: "Equivocal", pos: "adj.", def: "Open to more than one interpretation; ambiguous.", ex: "The results were equivocal and settled nothing." },
  { w: "Antithesis", pos: "n.", def: "The direct opposite of something.", ex: "Her calm was the antithesis of the panic around her." },
  { w: "Capricious", pos: "adj.", def: "Given to sudden, unpredictable changes.", ex: "Markets can be as capricious as the weather." },
  { w: "Didactic", pos: "adj.", def: "Intended to teach, often moralising.", ex: "The novel is didactic, almost a sermon in disguise." },
  { w: "Fastidious", pos: "adj.", def: "Very attentive to detail; hard to please.", ex: "A fastidious editor caught every slip." },
  { w: "Hubris", pos: "n.", def: "Excessive pride or self-confidence.", ex: "His downfall was a classic case of hubris." },
  { w: "Iconoclast", pos: "n.", def: "One who attacks cherished beliefs or institutions.", ex: "The iconoclast questioned every assumption." },
  { w: "Laconic", pos: "adj.", def: "Using very few words.", ex: "Her laconic reply said more than a speech." },
  { w: "Magnanimous", pos: "adj.", def: "Generous or forgiving, especially toward a rival.", ex: "He was magnanimous in victory." },
  { w: "Nascent", pos: "adj.", def: "Just coming into existence; emerging.", ex: "A nascent movement gathered quiet momentum." },
  { w: "Obfuscate", pos: "v.", def: "To deliberately make unclear or confusing.", ex: "Jargon can obfuscate a simple idea." },
  { w: "Panacea", pos: "n.", def: "A supposed cure-all.", ex: "Technology is no panacea for social problems." },
  { w: "Quixotic", pos: "adj.", def: "Idealistic and impractical.", ex: "His quixotic plan ignored every obstacle." },
  { w: "Reticent", pos: "adj.", def: "Reserved; reluctant to speak.", ex: "She was reticent about her own achievements." },
  { w: "Taciturn", pos: "adj.", def: "Habitually saying little.", ex: "The taciturn guide rarely volunteered a word." },
  { w: "Venerate", pos: "v.", def: "To regard with deep respect.", ex: "Cultures that venerate elders preserve their memory." },
  { w: "Anachronism", pos: "n.", def: "Something out of its proper time.", ex: "The duel felt like an anachronism in a modern court." },
  { w: "Ennui", pos: "n.", def: "Weary boredom from lack of interest.", ex: "A sense of ennui settled over the long afternoon." },
  { w: "Pernicious", pos: "adj.", def: "Having a harmful effect, often gradually.", ex: "Misinformation has a pernicious, creeping influence." },
  { w: "Sanguine", pos: "adj.", def: "Optimistic, especially in a hard situation.", ex: "She remained sanguine despite the setbacks." },
  { w: "Spurious", pos: "adj.", def: "False; not what it claims to be.", ex: "The argument rested on a spurious correlation." },
  { w: "Trenchant", pos: "adj.", def: "Sharp, vigorous and incisive.", ex: "His trenchant critique exposed the flaw at once." },
  { w: "Vicissitude", pos: "n.", def: "A change of fortune or circumstance.", ex: "They endured the vicissitudes of a long campaign." },
  { w: "Inexorable", pos: "adj.", def: "Impossible to stop or prevent.", ex: "The inexorable march of time spares no one." },
  { w: "Ostensible", pos: "adj.", def: "Apparent, but perhaps not genuine.", ex: "The ostensible reason hid a deeper motive." },
  { w: "Quotidian", pos: "adj.", def: "Ordinary; everyday.", ex: "She found meaning in quotidian routines." },
  { w: "Recalcitrant", pos: "adj.", def: "Stubbornly resistant to authority.", ex: "A recalcitrant minority blocked the vote." },
];

/* ---------- derived stats ---------- */
GH.computeStats = (s) => {
  const tasksDone = Object.values(s.tasks).filter(Boolean).length;
  const essays = s.essays.length;
  const ansEntries = Object.entries(s.answered);
  const questionsAnswered = ansEntries.length;
  const vocabKnown = Object.values(s.vocab).filter((v) => v === "known").length;

  // topic confidence
  let topicsSolid = 0, topicsTotal = 0, topicsStarted = 0;
  Object.values(GH.topics).forEach((sub) => sub.groups.forEach((g) => g.items.forEach((it) => {
    topicsTotal++;
    const lv = s.topics[it.id] || "none";
    if (lv === "solid") topicsSolid++;
    if (lv !== "none") topicsStarted++;
  })));

  // xp + level
  const xp = tasksDone * GH.xp.task + essays * GH.xp.essay + questionsAnswered * GH.xp.quiz
    + vocabKnown * GH.xp.vocab + topicsSolid * GH.xp.topic;
  const per = 500;
  const levelIdx = Math.min(GH.levels.length - 1, Math.floor(xp / per));
  const levelPct = Math.round(((xp % per) / per) * 100);

  // accuracy by section (latest answer per question)
  const qById = {}; GH.questions.forEach((q) => (qById[q.id] = q));
  const acc = { chem: [0, 0], bio: [0, 0], phys: [0, 0], s1: [0, 0] };
  ansEntries.forEach(([qid, a]) => {
    const q = qById[qid]; if (!q) return;
    const bucket = acc[q.section]; if (!bucket) return;
    bucket[1]++; if (a.correct) bucket[0]++;
  });
  const totalCorrect = Object.values(acc).reduce((n, b) => n + b[0], 0);
  const accuracyOverall = questionsAnswered ? Math.round(100 * totalCorrect / questionsAnswered) : 0;

  // streak from activity
  const days = Object.keys(s.activity).filter((d) => s.activity[d]).sort();
  const set = new Set(days);
  let streak = 0;
  let cur = new Date(); cur.setHours(0, 0, 0, 0);
  if (!set.has(GH.iso(cur))) cur = new Date(cur.getTime() - GH.MS_DAY); // allow counting if only yesterday active
  while (set.has(GH.iso(cur))) { streak++; cur = new Date(cur.getTime() - GH.MS_DAY); }
  // longest
  let longest = 0, run = 0, prev = null;
  days.forEach((d) => {
    if (prev && (GH.parseISO(d) - GH.parseISO(prev)) === GH.MS_DAY) run++; else run = 1;
    longest = Math.max(longest, run); prev = d;
  });

  return {
    xp, levelIdx, level: GH.levels[levelIdx], levelPct, per,
    tasksDone, essays, questionsAnswered, vocabKnown,
    topicsSolid, topicsTotal, topicsStarted,
    acc, accuracyOverall, totalCorrect, streak, longest,
  };
};

/* ---------- badges ---------- */
GH.badgeDefs = [
  { id: "first-essay", t: "First Words",    d: "Write your first essay",   test: (st) => st.essays >= 1 },
  { id: "essay-10",    t: "Essayist",        d: "Write 10 essays",          test: (st) => st.essays >= 10 },
  { id: "streak-7",    t: "Seven-Day Spark", d: "Hit a 7-day streak",       test: (st) => st.longest >= 7 || st.streak >= 7 },
  { id: "q-50",        t: "Half Century",    d: "Answer 50 questions",      test: (st) => st.questionsAnswered >= 50 },
  { id: "chem-5",      t: "Chem Apprentice", d: "Mark 5 chem topics solid", test: (st, raw) => Object.entries(raw.topics).filter(([k, v]) => k.startsWith("chem-") && v === "solid").length >= 5 },
  { id: "vocab-25",    t: "Wordsmith",       d: "Learn 25 vocab cards",     test: (st) => st.vocabKnown >= 25 },
];

export default GH;
