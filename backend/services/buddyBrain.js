// ============================================================
// Buddy Brain — turns a user's day (diary + tasks + spending)
// into a warm, honest reflection. Cross-domain: it can see how
// money, time and mood interact. Uses Groq when available, else
// a deterministic heuristic so it always returns something useful.
// ============================================================

const { chat, hasKey } = require('./aiProvider');

const SYSTEM = `You are Aura, a warm, sharp personal life buddy.
You help the user reflect on their day across three areas at once: how they spent their TIME (tasks), their MONEY (expenses), and their MOOD/journal.
Your superpower is connecting the dots BETWEEN these — e.g. low mood on a day with high food spending and skipped tasks.
Be encouraging but honest. Be specific to their data. Never generic. Keep it concise and human, never preachy.
ALL money is in Indian Rupees. Always write amounts with the ₹ symbol (e.g. ₹450). NEVER use $ or "dollars".
Always reply as strict JSON with this shape:
{
  "summary": "2-3 warm sentences reflecting the whole day",
  "wins": ["1-3 specific things that went well"],
  "improvements": ["1-3 specific, kind, actionable suggestions"],
  "connection": "one insight linking money + time + mood, or empty string if not enough data",
  "focus_tomorrow": "one concrete suggestion for tomorrow"
}`;

function buildUserPrompt(p) {
  const tasks = p.tasks || [];
  const done = tasks.filter((t) => t.done);
  const expenses = p.expenses || [];
  const spend = expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const moodLabel = ['', 'rough', 'low', 'okay', 'good', 'great'][p.mood || 0] || 'unrecorded';

  return `Reflect on this day (${p.date}).

MOOD: ${moodLabel}${p.mood ? ` (${p.mood}/5)` : ''}

JOURNAL:
${p.content?.trim() || '(none written)'}

USER-NOTED WINS: ${(p.wins || []).filter(Boolean).join('; ') || '(none)'}
USER-NOTED IMPROVEMENTS: ${(p.improvements || []).filter(Boolean).join('; ') || '(none)'}

TIME / TASKS (${done.length}/${tasks.length} done):
${tasks.length ? tasks.map((t) => `- [${t.done ? 'x' : ' '}] ${t.title}${t.plannedHours ? ` (planned ${t.plannedHours}h${t.actualHours ? `, actual ${t.actualHours}h` : ''})` : ''}`).join('\n') : '(no tasks logged)'}

MONEY: spent ₹${spend.toFixed(0)} across ${expenses.length} expense(s)${expenses.length ? ` — ${expenses.map((e) => `${e.sector} ₹${Number(e.amount).toFixed(0)}`).join(', ')}` : ''}

Give your reflection as JSON.`;
}

function heuristicReview(p) {
  const tasks = p.tasks || [];
  const done = tasks.filter((t) => t.done).length;
  const total = tasks.length;
  const completion = total ? Math.round((done / total) * 100) : null;
  const spend = (p.expenses || []).reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const mood = p.mood || 0;

  const wins = [];
  const improvements = [];

  if (done > 0) wins.push(`You completed ${done} task${done > 1 ? 's' : ''} — that's real progress.`);
  if ((p.wins || []).filter(Boolean).length) wins.push(...p.wins.filter(Boolean));
  if (mood >= 4) wins.push('Your mood was good today — worth noticing what helped.');
  if (!wins.length) wins.push('You showed up and reflected on your day — that itself is a win.');

  if (total && completion < 50) improvements.push(`Only ${completion}% of tasks got done — try picking just one "must-win" task tomorrow.`);
  if ((p.improvements || []).filter(Boolean).length) improvements.push(...p.improvements.filter(Boolean));
  if (mood && mood <= 2) improvements.push('Mood was low — be gentle with yourself and plan one small thing that recharges you.');
  if (!improvements.length) improvements.push('Keep the momentum — maybe stretch one task a little further tomorrow.');

  let connection = '';
  if (mood && mood <= 2 && spend > 0 && total && completion < 50) {
    connection = `On this low-mood day you spent ₹${spend.toFixed(0)} and finished under half your tasks — for you, low days and overspending may travel together. Worth watching.`;
  } else if (mood >= 4 && completion >= 70) {
    connection = 'Good mood lined up with high task completion — productive days seem to lift how you feel.';
  }

  const summaryBits = [];
  if (total) summaryBits.push(`You planned ${total} task${total > 1 ? 's' : ''} and finished ${done}.`);
  if (spend > 0) summaryBits.push(`You spent ₹${spend.toFixed(0)}.`);
  if (mood) summaryBits.push(`You rated the day ${mood}/5.`);
  const summary = (summaryBits.join(' ') || 'A quiet day worth a moment of reflection.') +
    ' Small, honest check-ins like this are how change starts.';

  return {
    summary,
    wins: wins.slice(0, 3),
    improvements: improvements.slice(0, 3),
    connection,
    focus_tomorrow: total && completion < 50
      ? 'Pick one task tomorrow that matters most, and protect time for it.'
      : 'Carry one good habit from today into tomorrow.',
    _engine: 'heuristic',
  };
}

async function reviewDay(payload) {
  if (!hasKey()) return heuristicReview(payload);
  try {
    const raw = await chat(
      [
        { role: 'system', content: SYSTEM },
        { role: 'user', content: buildUserPrompt(payload) },
      ],
      { json: true, temperature: 0.6 }
    );
    const parsed = JSON.parse(raw);
    return { ...parsed, _engine: 'groq' };
  } catch (e) {
    console.error('reviewDay AI failed, using heuristic:', e.message);
    return heuristicReview(payload);
  }
}

// ── Cross-domain insights (used by the Insights page) ───────────
const INSIGHTS_SYSTEM = `You are Aura, a sharp personal finance + life analyst.
Given recent expenses, tasks and diary moods, surface 3-5 SPECIFIC, data-grounded insights.
Each insight must reference real numbers from the data. Be useful, not generic.
ALL money is in Indian Rupees. Always write amounts with the ₹ symbol (e.g. ₹450). NEVER use $ or "dollars".
Reply as strict JSON: { "insights": [ { "title": "short headline", "body": "1-2 sentences with numbers", "tone": "positive|warning|neutral" } ] }`;

function heuristicInsights(p) {
  const expenses = p.expenses || [];
  const insights = [];
  const total = expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);

  // by sector
  const bySector = {};
  expenses.forEach((e) => { bySector[e.sector] = (bySector[e.sector] || 0) + Number(e.amount || 0); });
  const top = Object.entries(bySector).sort((a, b) => b[1] - a[1])[0];
  if (top) insights.push({ title: `${top[0]} is your biggest spend`, body: `You've spent ₹${top[1].toFixed(0)} on ${top[0]} recently — ${Math.round((top[1] / (total || 1)) * 100)}% of total spending.`, tone: 'neutral' });

  if (total > 0) insights.push({ title: 'Recent spending tracked', body: `₹${total.toFixed(0)} across ${expenses.length} expenses is logged. Keep logging to unlock sharper patterns.`, tone: 'positive' });

  const tasks = p.tasks || [];
  if (tasks.length) {
    const done = tasks.filter((t) => t.done).length;
    insights.push({ title: 'Task completion', body: `You've completed ${done} of ${tasks.length} recent tasks (${Math.round((done / tasks.length) * 100)}%).`, tone: done / tasks.length >= 0.6 ? 'positive' : 'warning' });
  }

  if (!insights.length) insights.push({ title: 'Not enough data yet', body: 'Log a few expenses, tasks and diary entries and Aura will start spotting real patterns for you.', tone: 'neutral' });
  return { insights: insights.slice(0, 5), _engine: 'heuristic' };
}

async function generateInsights(payload) {
  if (!hasKey()) return heuristicInsights(payload);
  try {
    const summary = JSON.stringify({
      expenses: (payload.expenses || []).slice(0, 60),
      tasks: (payload.tasks || []).slice(0, 60),
      moods: (payload.moods || []).slice(0, 30),
    });
    const raw = await chat(
      [
        { role: 'system', content: INSIGHTS_SYSTEM },
        { role: 'user', content: `Here is the recent data as JSON:\n${summary}\n\nReturn insights JSON.` },
      ],
      { json: true, temperature: 0.5 }
    );
    const parsed = JSON.parse(raw);
    return { ...parsed, _engine: 'groq' };
  } catch (e) {
    console.error('generateInsights AI failed, using heuristic:', e.message);
    return heuristicInsights(payload);
  }
}

module.exports = { reviewDay, generateInsights };
