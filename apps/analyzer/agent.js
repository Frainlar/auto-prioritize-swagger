import axios from 'axios';

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2:3b';

const SYSTEM = `
You analyze software user stories and return ONLY compact JSON with keys:
description (2-3 sentences), priority (P1|P2|P3),
acceptance_criteria (3-6 short, verifiable bullet points),
test_cases (>=3, each with name,type,preconditions[],steps[],expected_result).
No extra text.
`;

function ruleFallback(story) {
  const t = `${story.title} ${story.summary || ''}`.toLowerCase();
  const tags = (story.tags || []).map(x => x.toLowerCase());
  const p1 = ['auth','security','payment','checkout'].some(k => t.includes(k) || tags.includes(k));
  const p2 = ['performance','latency','scalability','accessibility','a11y','ux'].some(k => t.includes(k) || tags.includes(k));
  const priority = p1 ? 'P1' : p2 ? 'P2' : 'P3';
  const description = `${story.summary || story.title}. Provide clear UX, validation, logs/metrics.`;
  const acceptance_criteria = [
    `User completes "${story.title}" with valid inputs`,
    `Invalid inputs rejected with clear errors`,
    `Action audit-logged (user,timestamp,status)`,
    `Success/failure observable (metrics/logs)`,
    `Meets basic accessibility`
  ];
  const test_cases = [
    { name: `${story.title} — happy path`, type: 'positive', preconditions: [], steps: ['Provide valid inputs','Submit'], expected_result: 'Success; expected state change' },
    { name: `${story.title} — invalid input`, type: 'negative', preconditions: [], steps: ['Provide invalid inputs','Submit'], expected_result: 'Rejected; validation errors' },
    { name: `${story.title} — unauthorized`, type: 'negative', preconditions: ['Not authenticated/authorized'], steps: ['Call endpoint'], expected_result: '401/403; audit log' }
  ];
  return { description, priority, acceptance_criteria, test_cases };
}

export async function analyzeStoryWithLLM(story) {
  try {
    const payload = JSON.stringify({ title: story.title, summary: story.summary || '', tags: story.tags || [] });
    const { data } = await axios.post(
      `${OLLAMA_BASE_URL}/api/chat`,
      {
        model: OLLAMA_MODEL,
        messages: [
          { role: 'system', content: SYSTEM.trim() },
          { role: 'user', content: `Story:\n${payload}\nReturn ONLY JSON.` }
        ],
        stream: false
      },
      { timeout: 30000 }
    );
    const content = data?.message?.content?.trim() || '';
    const jsonText = content.replace(/^```json\s*|\s*```$/g, '');
    const parsed = JSON.parse(jsonText);

    return {
      description: parsed.description,
      priority: parsed.priority,
      acceptance_criteria: parsed.acceptance_criteria,
      test_cases: parsed.test_cases
    };
  } catch {
    return ruleFallback(story);
  }
}
