/**
 * prompts/prompts.js
 *
 * PURPOSE:
 * Single source of truth for every prompt sent to Gemini. Keeping them
 * here (instead of inline in controllers/services) makes them easy to
 * tune without touching business logic, and easy to reuse across
 * services/geminiService.js functions.
 *
 * CONNECTS TO:
 * - services/geminiService.js (imports and fills these templates)
 *
 * DESIGN RULES FOLLOWED BY EVERY PROMPT BELOW:
 * - Stay grounded in the provided text; never invent facts not implied
 *   by it.
 * - Return ONLY valid JSON, no markdown fences, no commentary.
 * - Keep explanations concise and exam-focused.
 */

function noteAnalysisPrompt(subject, text) {
  return `You are an expert ${subject} teaching assistant helping a college
student revise from their own notes.

Read the notes below and produce a structured JSON analysis. Stay strictly
grounded in the provided text — do not invent facts that aren't supported
by it. Return ONLY valid JSON matching exactly this shape, no markdown
fences, no extra commentary:

{
  "summary": "3-5 sentence plain-language summary of the notes",
  "importantTopics": [
    { "name": "string", "importance": "high|medium|low", "shortExplanation": "string" }
  ],
  "flashcards": [
    { "question": "string", "answer": "string", "topic": "string", "difficulty": "easy|medium|hard" }
  ],
  "quiz": [
    {
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correctAnswer": "string (must exactly match one option)",
      "explanation": "string",
      "topic": "string",
      "difficulty": "easy|medium|hard"
    }
  ],
  "keyTerms": [
    { "term": "string (abbreviation or key phrase)", "fullForm": "string or empty", "explanation": "1-2 sentence explanation" }
  ]
}

Produce 4-8 importantTopics, 6-10 flashcards, 5-8 quiz questions, and
4-8 keyTerms (favor real abbreviations used in the notes, e.g. NF, ACID,
TCP, plus a couple of important technical terms even if not abbreviated).

NOTES:
"""
${text}
"""`;
}

function targetedRevisionPrompt(subject, topic, contextText) {
  return `A college student studying ${subject} is weak on the topic
"${topic}". Using the context notes below (if relevant), produce a
focused revision package as JSON only, no markdown fences:

{
  "explanation": "A clear, simple 4-6 sentence explanation of ${topic} aimed at a confused student",
  "flashcards": [
    { "question": "string", "answer": "string", "topic": "${topic}", "difficulty": "easy|medium|hard" }
  ],
  "quiz": [
    {
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correctAnswer": "string (must exactly match one option)",
      "explanation": "string",
      "topic": "${topic}",
      "difficulty": "easy|medium|hard"
    }
  ]
}

Generate exactly 3 flashcards and 3 quiz questions. The quiz questions
must be NEW questions, not copies of anything the student may have seen
before, and must test the same underlying concept from different angles.

CONTEXT NOTES (may be partial or empty):
"""
${contextText || "(no additional notes provided, rely on general knowledge of the subject)"}
"""`;
}

function mentorPrompt(userContext, conversationHistory, userMessage) {
  return `You are "AI Mentor" inside Pocket Mentor, a personal study
assistant. You are talking to a specific student. Use their real learning
data below to ground every recommendation — do not give generic advice
that ignores it.

STUDENT CONTEXT (JSON):
${JSON.stringify(userContext, null, 2)}

CONVERSATION SO FAR:
${conversationHistory.map((m) => `${m.role}: ${m.content}`).join("\n") || "(start of conversation)"}

STUDENT'S NEW MESSAGE:
"${userMessage}"

Reply as the AI Mentor in 2-5 sentences, plain text (no markdown, no
JSON). If the student mentions a time budget (e.g. "I have 20 minutes"),
propose a short time-boxed plan broken into minutes. If relevant, end by
naming the single topic they should act on next.`;
}

function explanationPrompt(subject, term) {
  return `Explain the term/abbreviation "${term}" from a ${subject}
college course to a confused student. Return ONLY JSON, no markdown
fences:

{
  "term": "${term}",
  "fullForm": "string or empty if not an abbreviation",
  "explanation": "2-4 sentence plain-language explanation",
  "related": ["short related term 1", "short related term 2"]
}`;
}

module.exports = {
  noteAnalysisPrompt,
  targetedRevisionPrompt,
  mentorPrompt,
  explanationPrompt,
};
