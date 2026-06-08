// ============================================================
// Pluggable AI provider.
// Uses Groq (free, fast, OpenAI-compatible) when GROQ_API_KEY is set.
// Falls back to a deterministic heuristic so features still work
// without any API key. Swapping to another provider = edit this file.
// ============================================================

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

const hasKey = () => Boolean(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim());

/**
 * Low-level chat call. Returns the assistant text content.
 * @param {Array<{role:string, content:string}>} messages
 * @param {{ json?: boolean, temperature?: number }} opts
 */
async function chat(messages, opts = {}) {
  if (!hasKey()) {
    const err = new Error('NO_AI_KEY');
    err.code = 'NO_AI_KEY';
    throw err;
  }

  const body = {
    model: MODEL,
    messages,
    temperature: opts.temperature ?? 0.6,
    ...(opts.json ? { response_format: { type: 'json_object' } } : {}),
  };

  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Groq error ${res.status}: ${detail.slice(0, 300)}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? '';
}

module.exports = { chat, hasKey, MODEL };
