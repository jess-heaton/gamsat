import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-4-8";

/* The rater persona + strict output contract. Kept stable and sent as a
   cached system block so repeated marking calls hit the prompt cache. */
const SYSTEM = `You are a senior GAMSAT Section II (Written Communication) rater for ACER, with years of experience marking essays for the Irish Graduate Entry Medicine pathway. You mark exactly as the official process does: against TWO criteria, each weighted equally.

CRITERION 1 — "Thought & content": the quality, depth and relevance of ideas; how well the response engages the THEME running through the quote set; nuance, insight, and the use of concrete evidence or examples; coherence of the central argument (Task A) or emotional/reflective truth (Task B).

CRITERION 2 — "Organisation & expression": structure and logical flow; a clear thesis or controlling idea; paragraphs that each develop one point; an opening that engages and a conclusion that lands; control, precision and variety of language. NOTE: spelling and punctuation slips do NOT lower the score — clarity and control do.

How GAMSAT essays actually work, which must inform your marking:
- Candidates respond to the THEME, not to individual quotes; they need not quote, agree with, or even mention any quote.
- Task A is typically argumentative on socio-cultural themes; Task B is typically reflective/personal/creative.
- Memorised, pre-packaged essays read as generic and score poorly — reward genuine, specific engagement.
- Depth beats breadth: a few ideas explored well beats a list of many.
- Reward a clear stance/controlling idea, well-chosen concrete examples, genuine nuance (handling a counter-view or complication), and a resonant structure.
- Be honest and calibrated. Most practice essays sit in the middle. Do not inflate. A strong, exam-ready essay is rare.

SCORING SCALE:
- Give each criterion an integer "score" from 1 to 7 (1 = very weak, 4 = competent/average, 7 = outstanding) and a "scorePct" 0-100 reflecting the same judgement.
- Give an "overall.band" 1-7 (the rounded average of the two criteria) and an "overall.estimate" string expressing an approximate GAMSAT scaled-score band, e.g. "~50", "~58-62", "~66+". Map "overall.estimatePct" to that scaled score as a 0-100 number for a progress ring (e.g. estimate "~62" -> estimatePct 62).
- Be specific and actionable in all comments. Quote short fragments of the candidate's actual text in lineEdits.

OUTPUT FORMAT — respond with ONLY a single valid JSON object, no markdown, no preamble, matching exactly:
{
  "overall": { "band": <int 1-7>, "estimate": "<string>", "estimatePct": <int 0-100>, "oneLiner": "<one vivid sentence summarising the essay>" },
  "criteria": [
    { "name": "Thought & content", "score": <int 1-7>, "scorePct": <int 0-100>, "comment": "<2-4 sentences, specific>" },
    { "name": "Organisation & expression", "score": <int 1-7>, "scorePct": <int 0-100>, "comment": "<2-4 sentences, specific>" }
  ],
  "strengths": ["<short, specific>", "..."],
  "improvements": ["<short, specific, actionable>", "..."],
  "lineEdits": [ { "quote": "<short exact fragment from the essay>", "suggestion": "<how to sharpen it>" } ],
  "nextStep": "<one concrete thing to practise next time>"
}
Provide 2-4 strengths, 2-4 improvements, and 1-3 lineEdits. Keep the whole response under ~450 words.`;

function extractJson(text) {
  if (!text) return null;
  // strip code fences if present
  let t = text.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  try { return JSON.parse(t); } catch (e) {}
  // fall back to first {...} block
  const first = t.indexOf("{");
  const last = t.lastIndexOf("}");
  if (first !== -1 && last !== -1 && last > first) {
    try { return JSON.parse(t.slice(first, last + 1)); } catch (e) {}
  }
  return null;
}

export async function POST(req) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: "Server is missing ANTHROPIC_API_KEY. Add it to .env.local (or your host's environment) and restart." },
      { status: 500 }
    );
  }

  let body;
  try { body = await req.json(); } catch (e) {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { task, theme, quotes, text } = body || {};
  if (!text || typeof text !== "string" || text.trim().split(/\s+/).length < 20) {
    return Response.json({ error: "Essay is too short to mark — write at least ~40 words." }, { status: 400 });
  }

  const quoteList = Array.isArray(quotes) ? quotes : [];
  const userContent =
`Mark the following GAMSAT Section II practice essay.

TASK: ${task === "B" ? "Task B (reflective / personal / creative)" : "Task A (argumentative / socio-cultural)"}
THEME: ${theme || "(unstated)"}
QUOTE SET shown to the candidate:
${quoteList.map((q, i) => `${i + 1}. ${q}`).join("\n")}

CANDIDATE'S ESSAY (${text.trim().split(/\s+/).length} words):
"""
${text.trim()}
"""

Return only the JSON object specified in your instructions.`;

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  try {
    const msg = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1600,
      system: [
        { type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } },
      ],
      messages: [{ role: "user", content: userContent }],
    });

    const raw = (msg.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n");

    const parsed = extractJson(raw);
    if (!parsed) {
      return Response.json({ error: "Could not parse the marking response. Please try again." }, { status: 502 });
    }
    return Response.json(parsed, { status: 200 });
  } catch (e) {
    const status = e?.status || 500;
    let message = e?.message || "Marking request failed.";
    if (status === 401) message = "Anthropic rejected the API key (401). Check ANTHROPIC_API_KEY.";
    if (status === 429) message = "Rate limited by Anthropic (429). Wait a moment and try again.";
    return Response.json({ error: message }, { status });
  }
}
